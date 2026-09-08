"use client";

import Link from "next/link";

export default function SafetyTipsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Safety Tips</h1>
          <p className="text-gray-600">
            Your safety matters. Loophole only connects buyers and sellers. We do not broker, title, escrow, or fund
            deals. Take precautions when evaluating terms, wiring funds, or sharing documents.
          </p>
        </header>

        <section className="space-y-4 text-gray-700">
          <ul className="list-disc pl-6 space-y-3">
            <li>
              <span className="font-semibold">Verify the deal independently:</span> Loophole does not title, escrow, or
              underwrite. Confirm ownership, occupancy, payoff, and numbers with your own due diligence before any
              funds move.
            </li>
            <li>
              <span className="font-semibold">Inspect before you commit:</span> Walk the property, pull title, and
              match the listing terms (rate, balance, PITI, situation) before you send money or sign.
            </li>
            <li>
              <span className="font-semibold">Use secure payment methods:</span> Avoid gift cards, crypto-to-stranger
              requests, or wiring funds because someone is &quot;in a hurry.&quot; Use escrow or other trusted closing
              channels for real money.
            </li>
            <li>
              <span className="font-semibold">Keep communication on Loophole:</span> Staying within Loophole messages
              helps maintain a record and reduces scams. Be cautious if someone pushes to move immediately to text or
              external apps.
            </li>
            <li>
              <span className="font-semibold">Watch for common scam signs:</span> Be cautious if someone exhibits
              suspicious behavior, including but not limited to refusing to meet in person, asking for deposits or
              shipping fees, offering prices that seem too good to be true, using urgent pressure (“must sell today”),
              avoiding or refusing to answer basic questions, or requesting payment before you have verified the deal.
            </li>
            <li>
              <span className="font-semibold">Trust your instincts:</span> If something feels off, it probably is.
              You’re never obligated to complete a transaction.
            </li>
            <li>
              <span className="font-semibold">Report suspicious behavior:</span> If you encounter scams, harassment, or
              unsafe situations, report the listing or user through the{" "}
              <Link href="/contact" className="text-black hover:underline">
                Contact Us
              </Link>{" "}
              page so we can take action.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
