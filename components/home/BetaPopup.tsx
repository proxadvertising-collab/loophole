'use client';

import { useState, useEffect } from 'react';
import { X, Github, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function BetaPopup() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (hasVisited) {
      setIsVisible(false);
    } else {
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-6 z-50 animate-fade-in">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X size={20} />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-1 bg-black text-white text-xs font-semibold rounded-full">
          BETA
        </span>
        <h3 className="text-lg font-semibold text-gray-900">Welcome to Loophole!</h3>
      </div>

      <p className="text-gray-600 text-sm mb-4">
        We&apos;re currently in beta testing. Your feedback helps us improve!
      </p>

      <div className="space-y-3">
        <Link
          href="/contact"
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-black transition"
        >
          <Github size={16} />
          Report bugs
        </Link>

        <a
          href="/contact"
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-black transition"
        >
          <MessageCircle size={16} />
          Suggest improvements
        </a>
      </div>
    </div>
  );
} 