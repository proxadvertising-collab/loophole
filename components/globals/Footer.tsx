"use client";

import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white/60 border-t border-zinc-900 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <Link href="/" className="inline-block text-xl font-black tracking-tighter text-white hover:text-zinc-300 transition">
              LOOPHOLE
            </Link>
            <p className="text-xs text-zinc-500">
              The Deals Nobody Puts on the MLS.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-400">
            <Link href="/browse" className="hover:text-white transition">
              Browse
            </Link>
            <Link href="/#how-it-works" className="hover:text-white transition">
              How It Works
            </Link>
            <Link href="/#pricing" className="hover:text-white transition">
              Pricing
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-white transition">
              Contact
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-900 text-center text-xs text-zinc-500">
          <p>© 2026 Loophole. Browse free. List free. Pay only to talk.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
