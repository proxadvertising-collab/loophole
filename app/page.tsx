"use client";

import Link from "next/link";
import {
  ShieldCheck,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  Home as HomeIcon,
  Car,
  Ship,
  Briefcase,
  Bike,
  KeyRound,
  Search,
} from "lucide-react";

const ASSET_CLASSES = [
  { icon: HomeIcon, label: "Real Estate", id: "real_estate" },
  { icon: Car, label: "Auto", id: "auto" },
  { icon: Bike, label: "Motorcycle", id: "motorcycle" },
  { icon: Bike, label: "Powersports", id: "powersports" },
  { icon: Car, label: "RV", id: "rv" },
  { icon: Ship, label: "Watercraft", id: "watercraft" },
  { icon: Briefcase, label: "Businesses", id: "business" },
];

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
            The deal board for creative finance. Seller finance, subject-to, wraps, lease options —
            on houses, vehicles, boats, and businesses. Terms first, price second.
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

      {/* Section 2: Asset classes */}
      <section className="bg-white py-16 px-6 text-zinc-900 border-b border-zinc-200">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-8">
            One board. Every asset class.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {ASSET_CLASSES.map(({ icon: Icon, label, id }) => (
              <Link
                key={id}
                href={`/browse?class=${id}`}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50/50 px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:shadow-md hover:border-zinc-300"
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Problem */}
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
                Where do you post subto? Standard broker portals reject creative structures and hide real terms behind listing-agent gatekeeping.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-8 shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-black">
                <MessageSquare size={20} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-black">Facebook groups are chaos</h3>
              <p className="text-sm leading-relaxed text-zinc-600">
                Deals drown in comments, endless threads, and spam. No structure, no numbers on the card, zero discoverability.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-8 shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-black">
                <GraduationCap size={20} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-black">Courses teach. Nobody lists.</h3>
              <p className="text-sm leading-relaxed text-zinc-600">
                There&apos;s no shortage of creative finance education. What&apos;s missing is neutral ground — a place to actually post the deal, with the terms on the card.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Two Sides */}
      <section className="border-y border-zinc-200 bg-zinc-50 py-24 px-6 text-zinc-900">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                <KeyRound size={22} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-black">
                For Sellers
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                Own the note? Name your terms. List the deal with the numbers already on it — down, rate,
                payment, balloon — and talk to buyers who understand them. City or suburb only, never a street address.
              </p>
            </div>

            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                <TrendingUp size={22} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-black">
                For Buyers
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                Stop cold calling. Every listing shows its Deal DNA: cash in, monthly payment, and the structure
                in plain English. Underwrite from the card — filter by structure, asset class, payment, even crypto-friendly sellers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: How It Works */}
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
              <div className="flex items-center gap-2">
                <Search size={16} className="text-zinc-400" />
                <h4 className="text-lg font-bold text-black">Browse free</h4>
              </div>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Explore the deal board by asset class, structure, payment, or crypto-friendly sellers. No account needed to look.
              </p>
            </div>

            <div className="space-y-3 relative">
              <span className="text-5xl font-black text-zinc-200 block font-sans">2</span>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-zinc-400" />
                <h4 className="text-lg font-bold text-black">List with attestation</h4>
              </div>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Post your terms with an ownership attestation. Loophole connects buyers and sellers — we don&apos;t broker, title, or fund deals.
              </p>
            </div>

            <div className="space-y-3 relative">
              <span className="text-5xl font-black text-zinc-200 block font-sans">3</span>
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-zinc-400" />
                <h4 className="text-lg font-bold text-black">Message the seller</h4>
              </div>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Contact is included. Encrypted messaging with the seller — free.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Final CTA */}
      <section className="bg-black py-24 px-6 text-white text-center">
        <div className="mx-auto max-w-3xl space-y-8">
          <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
            Your next deal is someone else&apos;s terms.
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Join the board where creative finance actually trades — not in comments, not in DMs, on the card.
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
        </div>
      </section>
    </div>
  );
}
