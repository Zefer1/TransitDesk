import { Link } from "react-router-dom";
import { APP_ROUTES } from "../constants/routes";

export function NotFoundPage() {
	return (
		<section className="mx-auto max-w-3xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center shadow-sm">
			<p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">404</p>
			<h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Page not found</h1>
			<p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
				The page you are looking for does not exist or has been moved.
			</p>
			<div className="mt-6">
				<Link
					to={APP_ROUTES.services}
					className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
				>
					Go to services
				</Link>
			</div>
		</section>
	);
}



