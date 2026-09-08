"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Coins, 
  ShieldCheck, 
  MessageSquare, 
  Check, 
  Home as HomeIcon, 
  TrendingUp, 
  AlertTriangle 
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative overflow-hidden font-sans">
      {/* Section 1: Hero */}
      <section className="relative flex min-h-[calc(100vh-76px)] flex-col items-center justify-center bg-black px-6 text-center text-white">
        <div className="max-w-4xl space-y-8 py-20">
          <h1 className="text-5xl font-black tracking-tighter sm:text-7xl lg:text-8xl">
            The Deals Nobody Puts on the MLS.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400 sm:text-xl font-normal leading-relaxed">
            Where off-market, terms, and creative real estate deals get posted, found, and talked through.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/browse"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
            >
              Browse Deals
            </Link>
            <Link
              href="/create"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-8 text-sm font-semibold text-white/70 transition-colors hover:border-white/40 hover:text-white"
            >
              List Your Deal
            </Link>
          </div>
          
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium pt-4">
            Browse free. List free. Message sellers directly.
          </p>
        </div>
      </section>

      {/* Section 2: Problem */}
      <section className="bg-white py-24 px-6 text-zinc-900">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
              The MLS wasn&apos;t built for this.
            </h2>
            <p className="text-zinc-500 max-w-lg mx-auto text-sm sm:text-base">
              Traditional platforms are made for standard sales. Here is why creative finance needs its own home.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-8 shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-black">
                <AlertTriangle size={20} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-black">Zillow is for retail</h3>
              <p className="text-sm leading-relaxed text-zinc-600">
                Where do you post subto? Standard broker portals reject creative options and hide real terms behind complex legal jargon.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-8 shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-black">
                <MessageSquare size={20} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-black">Facebook groups are chaos</h3>
              <p className="text-sm leading-relaxed text-zinc-600">
                Texts and messages get lost instantly in comments, endless threads, and unorganized spam groups. Discoverability is zero.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-8 shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-black">
                <ShieldCheck size={20} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-black">Speak the language</h3>
              <p className="text-sm leading-relaxed text-zinc-600">
                You need a board where people understand immediately what subto, seller finance, and PITI actually mean.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Two Sides */}
      <section className="border-y border-zinc-200 bg-zinc-50 py-24 px-6 text-zinc-900">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Left Side */}
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                <HomeIcon size={22} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-black">
                For Homeowners in Trouble
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                Facing foreclosure? Behind on payments? List your situation with terms investors can actually do. City or suburb only — never a street address.
              </p>
            </div>

            {/* Right Side */}
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                <TrendingUp size={22} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-black">
                For Investors
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                Stop cold calling. Find verified off-market with numbers already posted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: How It Works */}
      <section className="bg-white py-24 px-6 text-zinc-900">
        <div className="mx-auto max-w-5xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
              How it works
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3 relative">
              <span className="text-5xl font-black text-zinc-200 block font-sans">1</span>
              <h4 className="text-lg font-bold text-black">Browse Free</h4>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Explore the entire creative deal directory and unique seller situations at no cost.
              </p>
            </div>

            <div className="space-y-3 relative">
              <span className="text-5xl font-black text-zinc-200 block font-sans">2</span>
              <h4 className="text-lg font-bold text-black">List Free with Attestation</h4>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Post terms with an ownership attestation. Loophole connects buyers and sellers — we don&apos;t broker, title, or fund deals.
              </p>
            </div>

            <div className="space-y-3 relative">
              <span className="text-5xl font-black text-zinc-200 block font-sans">3</span>
              <h4 className="text-lg font-bold text-black">Message the seller</h4>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Contact is included. Token packs for pay-to-talk are coming — no live checkout yet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Pricing */}
      <section className="bg-black py-24 px-6 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl text-white">
              Pricing
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Free Tier */}
            <div className="rounded-2xl border border-zinc-850 bg-zinc-950 p-8 flex flex-col justify-between">
              <div>
                <h4 className="text-sm uppercase tracking-widest text-zinc-500 font-semibold mb-2">Free</h4>
                <div className="text-4xl font-black text-white mb-6">$0</div>
                <ul className="space-y-3 text-zinc-400 text-sm mb-8">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-zinc-400" /> Browse + List
                  </li>
                </ul>
              </div>
              <Link
                href="/browse"
                className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
              >
                Get Started
              </Link>
            </div>

            {/* Token Pack Tier */}
            <div className="rounded-2xl border-2 border-white bg-zinc-950 p-8 flex flex-col justify-between relative">
              <span className="absolute -top-3 right-4 bg-white text-black text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                Most Popular
              </span>
              <div>
                <h4 className="text-sm uppercase tracking-widest text-zinc-400 font-semibold mb-2">Tokens</h4>
                <div className="text-4xl font-black text-white mb-6">$29</div>
                <ul className="space-y-3 text-zinc-300 text-sm mb-8">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-white" /> 15 tokens (coming)
                  </li>
                </ul>
              </div>
              <Link
                href="/browse"
                className="inline-flex h-10 items-center justify-center rounded-full bg-white text-black text-sm font-semibold transition-colors hover:bg-zinc-200"
              >
                Coming soon
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="rounded-2xl border border-zinc-850 bg-zinc-950 p-8 flex flex-col justify-between">
              <div>
                <h4 className="text-sm uppercase tracking-widest text-zinc-500 font-semibold mb-2">Pro</h4>
                <div className="text-4xl font-black text-white mb-6">$79<span className="text-xs text-zinc-500 font-medium">/mo</span></div>
                <ul className="space-y-3 text-zinc-400 text-sm mb-8">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-zinc-400" /> Verified badge (coming)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-zinc-400" /> Featured placement (coming)
                  </li>
                </ul>
              </div>
              <Link
                href="/browse"
                className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
              >
                Coming soon
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
