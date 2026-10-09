import { supabase } from '../supabaseClient';
import { dbLogger } from './utils';

export type PofStatus = 'none' | 'pending' | 'verified' | 'rejected';
export type DealStatus = 'pending' | 'verified' | 'rejected';

export interface BuyerPassport {
  user_id: string;
  pof_status: PofStatus;
  pof_document_url: string | null;
  pof_submitted_at: string | null;
  pof_verified_at: string | null;
  pof_rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface PassportDeal {
  id: string;
  user_id: string;
  title: string;
  asset_class: string | null;
  structure: string | null;
  closed_at: string | null;
  status: DealStatus;
  created_at: string;
}

export interface PassportSummary {
  passport: BuyerPassport | null;
  deals: PassportDeal[];
  verifiedDeals: number;
  responseRate: number | null; // 0..1, null when no inbound conversations yet
}

/**
 * Deal Passport: document-based buyer reputation.
 * Legal boundary: verification confirms a document was reviewed. It is not
 * an endorsement of any person or deal, and Loophole is never a party to
 * a transaction.
 */
export class PassportService {
  static async getPassport(userId: string): Promise<PassportSummary | null> {
    try {
      const { data: passport, error: pErr } = await supabase
        .from('buyer_passports')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (pErr) {
        dbLogger.error('Failed to fetch passport', pErr);
        return null;
      }

      const { data: deals, error: dErr } = await supabase
        .from('passport_deals')
        .select('*')
        .eq('user_id', userId)
        .order('closed_at', { ascending: false, nullsFirst: false });

      if (dErr) {
        dbLogger.error('Failed to fetch passport deals', dErr);
        return null;
      }

      const responseRate = await this.computeResponseRate(userId);

      return {
        passport: (passport as BuyerPassport) || null,
        deals: (deals as PassportDeal[]) || [],
        verifiedDeals: ((deals as PassportDeal[]) || []).filter((d) => d.status === 'verified').length,
        responseRate,
      };
    } catch (error) {
      dbLogger.error('Error in getPassport', error);
      return null;
    }
  }

  /**
   * Response rate: share of distinct people who messaged the user that the
   * user replied to. Null when nobody has messaged them yet.
   */
  static async computeResponseRate(userId: string): Promise<number | null> {
    try {
      const { data: inbound, error: inErr } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', userId)
        .limit(2000);

      if (inErr || !inbound || inbound.length === 0) return null;

      const { data: outbound, error: outErr } = await supabase
        .from('messages')
        .select('receiver_id')
        .eq('sender_id', userId)
        .limit(2000);

      if (outErr) return null;

      const inboundSenders = new Set((inbound as { sender_id: string }[]).map((m) => m.sender_id));
      const repliedTo = new Set(((outbound as { receiver_id: string }[]) || []).map((m) => m.receiver_id));
      if (inboundSenders.size === 0) return null;
      const replied = [...inboundSenders].filter((s) => repliedTo.has(s)).length;
      return replied / inboundSenders.size;
    } catch (error) {
      dbLogger.error('Error computing response rate', error);
      return null;
    }
  }

  /**
   * Upload a proof-of-funds document and mark the passport pending review.
   * Files go to the private `pof-documents` bucket under the user's folder.
   */
  static async submitPOF(userId: string, file: File): Promise<{ success: boolean; error?: string }> {
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
      const allowed = ['pdf', 'png', 'jpg', 'jpeg', 'webp'];
      if (!allowed.includes(ext)) {
        return { success: false, error: 'Please upload a PDF or image file.' };
      }
      if (file.size > 10 * 1024 * 1024) {
        return { success: false, error: 'File must be under 10 MB.' };
      }

      const filePath = `${userId}/pof-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('pof-documents')
        .upload(filePath, file, { upsert: true });

      if (upErr) {
        dbLogger.error('POF upload failed', upErr);
        return { success: false, error: 'Upload failed. Please try again.' };
      }

      const { error: dbErr } = await supabase.from('buyer_passports').upsert(
        {
          user_id: userId,
          pof_status: 'pending',
          pof_document_url: filePath,
          pof_submitted_at: new Date().toISOString(),
          pof_rejection_reason: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      if (dbErr) {
        dbLogger.error('POF status update failed', dbErr);
        return { success: false, error: 'Could not save verification status.' };
      }

      dbLogger.success('POF submitted', { userId });
      return { success: true };
    } catch (error) {
      dbLogger.error('Error in submitPOF', error);
      return { success: false, error: 'Something went wrong. Please try again.' };
    }
  }

  static async addDeal(
    userId: string,
    deal: { title: string; asset_class?: string; structure?: string; closed_at?: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!deal.title.trim()) {
        return { success: false, error: 'Please describe the deal.' };
      }
      const { error } = await supabase.from('passport_deals').insert({
        user_id: userId,
        title: deal.title.trim().slice(0, 120),
        asset_class: deal.asset_class || null,
        structure: deal.structure || null,
        closed_at: deal.closed_at || null,
        status: 'pending',
      });
      if (error) {
        dbLogger.error('Failed to add passport deal', error);
        return { success: false, error: 'Could not save the deal.' };
      }
      return { success: true };
    } catch (error) {
      dbLogger.error('Error in addDeal', error);
      return { success: false, error: 'Something went wrong. Please try again.' };
    }
  }

  static async removeDeal(userId: string, dealId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('passport_deals')
        .delete()
        .eq('id', dealId)
        .eq('user_id', userId);
      if (error) {
        dbLogger.error('Failed to remove passport deal', error);
        return false;
      }
      return true;
    } catch (error) {
      dbLogger.error('Error in removeDeal', error);
      return false;
    }
  }
}
