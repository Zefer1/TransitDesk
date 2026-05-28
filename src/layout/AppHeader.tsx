import { Link, NavLink, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../constants/routes';
import { clearAuth, getUser } from '../lib/auth';
import { Avatar } from '../components/Avatar';

export function AppHeader() {
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    clearAuth();
    navigate(APP_ROUTES.login);
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0">
          <div className="flex items-center justify-between gap-3 sm:justify-start sm:gap-8">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src="/transitdesk-favicon.svg"
                alt="TransitDesk logo"
                className="h-8 w-8"
              />
              <Link to={APP_ROUTES.services} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md">
                <h1 className="text-xl sm:text-2xl font-bold text-blue-600 truncate">TransitDesk</h1>
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <NavLink
                to={APP_ROUTES.services}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'
                  }`
                }
              >
                Services
              </NavLink>
              <NavLink
                to={APP_ROUTES.drivers}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'
                  }`
                }
              >
                Drivers
              </NavLink>
              <NavLink
                to={APP_ROUTES.vehicles}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'
                  }`
                }
              >
                Vehicles
              </NavLink>
              <NavLink
                to={APP_ROUTES.guides}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'
                  }`
                }
              >
                Guides
              </NavLink>
              <NavLink
                to={APP_ROUTES.settings}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'
                  }`
                }
              >
                Settings
              </NavLink>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              to={APP_ROUTES.newService}
              className="inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:flex-none"
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
              className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}



