'use client';

import React, { useState } from 'react';
import { isDemoMode } from '@/lib/demo/demo-mode';

interface DemoBannerProps {
  role?: string;
}

/**
 * Sticky banner displayed at the top of the page when demo mode is active.
 * Shows the current demo role and provides controls to exit or dismiss.
 */
export function DemoBanner({ role }: DemoBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!isDemoMode() || dismissed) {
    return null;
  }

  const handleExit = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('spectree-demo-session');
      window.location.href = '/';
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <div
      role="banner"
      className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-amber-100 px-4 py-2 text-sm text-amber-900 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span className="font-medium">
          Demo Mode - You are viewing a demo of SpecTree
        </span>
        {role && (
          <span className="inline-flex items-center rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            {role}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleExit}
          className="rounded bg-amber-700 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-800"
        >
          Exit Demo
        </button>
        <button
          onClick={handleDismiss}
          className="rounded p-1 text-amber-700 transition-colors hover:bg-amber-200 hover:text-amber-900"
          aria-label="Dismiss demo banner"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
