import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../constants/routes';
import { clearAuth, getUser } from '../lib/auth';
import { Avatar } from '../components/Avatar';
import { BetaBadge } from '../components/BetaBadge';

const NAV_ITEMS = [
  { to: APP_ROUTES.services, label: 'Services' },
  { to: APP_ROUTES.drivers, label: 'Drivers' },
  { to: APP_ROUTES.vehicles, label: 'Vehicles' },
  { to: APP_ROUTES.guides, label: 'Guides' },
  { to: APP_ROUTES.settings, label: 'Settings' },
] as const;

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return `px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
    isActive ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'
  }`;
}

export function AppHeader() {
  const navigate = useNavigate();
  const user = getUser();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  function handleLogout() {
    setIsOpen(false);
    clearAuth();
    navigate(APP_ROUTES.login);
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/transitdesk-favicon.svg" alt="TransitDesk logo" className="h-8 w-8 shrink-0" />
            <Link to={APP_ROUTES.services} className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600 truncate">TransitDesk</h1>
            </Link>
            <BetaBadge />
          </div>

          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={APP_ROUTES.newService}
              className="hidden lg:inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              + New Service
            </Link>

            {user ? (
              <span className="inline-flex items-center gap-2">
                <Avatar name={user.name} />
                <span className="hidden max-w-[14ch] truncate text-sm font-medium text-gray-700 dark:text-gray-300 sm:inline">
                  {user.name}
                </span>
              </span>
            ) : null}

            <button
              onClick={handleLogout}
              className="hidden lg:inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Logout
            </button>

            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 p-2 text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen ? (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            <Link
              to={APP_ROUTES.newService}
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              + New Service
            </Link>

            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={navLinkClass}
              >
                {item.label}
              </NavLink>
            ))}

            <button
              onClick={handleLogout}
              className="mt-1 inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
