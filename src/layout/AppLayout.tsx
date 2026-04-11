/** Main layout shell. Renders the header at top and constrains child content to max-w-7xl. */
import type { ReactNode } from 'react';

// Core flow note: the block below contains the main behavior used by this module.

// Composes persistent chrome (header) with route content region.

interface AppLayoutProps {
  header: ReactNode;
  children: ReactNode;
}

export function AppLayout({ header, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {header}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</main>
    </div>
  );
}



