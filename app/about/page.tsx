"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">About Loophole</h1>
          <p className="text-gray-600">
            Loophole is a nationwide marketplace that connects buyers and sellers of high-ticket creative-finance
            deals. We do not broker, title, escrow, or fund transactions. Sellers post terms — rate, balance, payment,
            situation — not a street address. City or suburb only. The deals nobody puts on the MLS.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">How to Use Loophole</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <span className="font-semibold">Create account:</span> Sign up with any valid email to access Loophole.
              Open to verified investors, buyers, and sellers nationwide.
            </li>
            <li>
              <span className="font-semibold">Browse or list:</span> Browse deals by type (subto, seller finance, wrap,
              novation, wholesale, foreclosure, cash) or list your own. Listings include photos, terms, and seller
              situation so you can evaluate the deal, not just the price.
            </li>
            <li>
              <span className="font-semibold">Message:</span> Use Loophole messaging to contact buyers or sellers, ask
              about terms, and work the deal. Keeping communication inside Loophole keeps a record and reduces noise.
            </li>
            <li>
              <span className="font-semibold">Attest & wait for approval:</span> Listings require an ownership
              attestation and admin review before they go live on browse.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">How to Buy</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <span className="font-semibold">Search & filters:</span> Use search, deal type, date, and price filters
              to find deals. Listings include key terms like rate, remaining balance, PITI, ARV, and seller situation.
            </li>
            <li>
              <span className="font-semibold">Contact seller:</span> Message the seller through Loophole to confirm
              the numbers, ask about terms, and start the conversation.
            </li>
            <li>
              <span className="font-semibold">Ask questions:</span> Before you commit time, clarify remaining balance,
              rate, PITI, repairs, and the seller&apos;s situation so there are no surprises.
            </li>
            <li>
              <span className="font-semibold">Stay on-platform:</span> Keep deal talk inside Loophole messages. Do not
              wire funds or share sensitive documents until you have independently verified the deal.
            </li>
            <li>
              <span className="font-semibold">Verify before you close:</span> Loophole is a marketplace, not escrow.
              Confirm title, occupancy, and numbers with your own due diligence before any funds move.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">How to Sell</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <span className="font-semibold">Create listing:</span> Post the address, deal type, asking price / entry
              fee, and the terms that matter. Honest numbers build trust and get serious replies.
            </li>
            <li>
              <span className="font-semibold">Photos:</span> Upload clear photos of the property. Buyers rely on them
              to decide whether to message.
            </li>
            <li>
              <span className="font-semibold">Seller situation:</span> Explain why the deal is available, what terms
              you need, and any constraints. Specifics cut the back-and-forth.
            </li>
            <li>
              <span className="font-semibold">Terms over price:</span> Post remaining balance, rate, PITI, ARV,
              repairs, and rent when you have them. Financing is the listing.
            </li>
            <li>
              <span className="font-semibold">Attest ownership:</span> Check the attestation that you have the legal
              right to market the deal. Listings go to admin review before they appear on browse.
            </li>
            <li>
              <span className="font-semibold">Respond to buyers:</span> Reply promptly on terms. Reliable communication
              is how deals actually move.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">FAQs</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <p className="font-semibold">Do I need a special email?</p>
              <p>
                No. Sign up with any valid email. Loophole is open to investors, buyers, and sellers nationwide.
              </p>
            </div>
            <div>
              <p className="font-semibold">How do deals get listed?</p>
              <p>
                You post the address, deal type, and terms, attest that you have the right to market the deal, and
                wait for admin approval. Approved deals appear on browse.
              </p>
            </div>
            <div>
              <p className="font-semibold">Is messaging paid?</p>
              <p>
                Messaging is currently included. Token packs and Pro placement are on the roadmap and labeled coming
                — there is no live checkout yet.
              </p>
            </div>
            <div>
              <p className="font-semibold">Is Loophole free?</p>
              <p>Yes. Browse is free. Listing is free. Messaging is included for now.</p>
            </div>
            <div>
              <p className="font-semibold">How do I report a user?</p>
              <p>
                Report a listing or user through the Contact Us page. Reports help us review suspicious behavior and
                keep the board clean.
              </p>
            </div>
            <div>
              <p className="font-semibold">Who can use Loophole?</p>
              <p>
                Nationwide verified investors, buyers, and sellers. If you understand subto, seller finance, and PITI,
                you are in the right place.
              </p>
            </div>
            <div>
              <p className="font-semibold">What listings are prohibited?</p>
              <p>
                Illegal activity, fraud, listings you have no right to market, and anything that violates the{" "}
                <Link href="/terms" className="text-black hover:underline">
                  Terms of Service
                </Link>
                . Listings may be removed if they violate guidelines.
              </p>
            </div>
            <div>
              <p className="font-semibold">What if a buyer or seller goes dark?</p>
              <p>
                Confirm terms in Loophole messages. Repeated no-shows or abuse can be reported from the listing or
                profile.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
