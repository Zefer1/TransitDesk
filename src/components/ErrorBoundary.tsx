import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { APP_ROUTES } from "../constants/routes";

type ErrorBoundaryProps = {
	children: ReactNode;
};

type ErrorBoundaryState = {
	hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	state: ErrorBoundaryState = { hasError: false };

	static getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Unhandled app error:", error, errorInfo);
	}

	handleReload = () => {
		window.location.reload();
	};

	render() {
		if (!this.state.hasError) {
			return this.props.children;
		}

		return (
			<section className="mx-auto max-w-3xl p-6 sm:p-10">
				<div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-8 text-center shadow-sm">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Something went wrong</h1>
					<p className="mt-2 text-sm text-red-700 dark:text-red-400">
						An unexpected error occurred. You can try reloading the page or go back to the services list.
					</p>
					<div className="mt-6 flex flex-wrap items-center justify-center gap-2">
						<button
							type="button"
							onClick={this.handleReload}
							className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
						>
							Reload page
						</button>
						<Link
							to={APP_ROUTES.services}
							className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700"
						>
							Back to services
						</Link>
					</div>
				</div>
			</section>
		);
	}
}
