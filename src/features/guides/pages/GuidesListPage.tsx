/**
 * GuidesListPage.tsx
 *
 * The main landing page for the guides feature. It shows a searchable,
 * filterable table of all guides in the system.
 *
 * How it works:
 *   1. On mount, it fetches the full list of guides from the API
 *   2. The useGuideFilters hook provides search and language filtering
 *   3. The filtered results are passed to GuideTable for display
 *   4. If there are no guides at all, it shows an "empty state" prompt
 *   5. If there are guides but none match the filters, it shows a different message
 */
import { useEffect, useState } from "react";
import { CrudListLayout } from "../../../components/CrudListLayout";
import { EmptyState } from "../../../components/EmptyState";
import { useToast } from "../../../components/useToast";
import { APP_ROUTES } from "../../../constants/routes";
import { listGuides } from "../../../api/guides.api";
import type { Guide } from "../../../types/service.types";
import { GuideFiltersBar } from "../components/GuideFiltersBar";
import { GuideTable } from "../components/GuideTable";
import { useGuideFilters } from "../../../hooks/useGuideFilters";

export function GuidesListPage() {
	const { addToast } = useToast();
	const [guides, setGuides] = useState<Guide[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [reloadKey, setReloadKey] = useState(0);

	const {
		filters,
		filteredGuides,
		availableLanguages,
		hasActiveFilters,
		setSearchFilter,
		setLanguageFilter,
		resetFilters,
	} = useGuideFilters(guides);

	/**
	 * Fetches guides from the API when the page loads (or when retrying).
	 * The `isMounted` flag prevents updating state if the component unmounts
	 * while the request is still in flight -- this avoids React warnings
	 * about setting state on an unmounted component.
	 */
	useEffect(() => {
		let isMounted = true;

		const loadGuides = async () => {
			try {
				setIsLoading(true);
				setErrorMessage(null);

				const response = await listGuides();

				if (!isMounted) {
					return;
				}

				setGuides(response.data);
			} catch (error) {
				if (!isMounted) {
					return;
				}

				const message = error instanceof Error ? error.message : "Unable to load guides.";
				setErrorMessage(message);
				addToast(message, "error");
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadGuides();

		return () => {
			isMounted = false;
		};
	}, [addToast, reloadKey]);

	// Bumping reloadKey triggers the useEffect above to re-fetch guides.
	const handleRetry = () => {
		setReloadKey((current) => current + 1);
	};

	return (
		<CrudListLayout
			title="Guides"
			description="Manage guide profiles, language coverage, and assignment readiness."
			primaryAction={{ label: "Create Guide", to: APP_ROUTES.newGuide }}
			isLoading={isLoading}
			errorMessage={errorMessage}
			onRetry={handleRetry}
			filters={
				<GuideFiltersBar
					filters={filters}
					hasActiveFilters={hasActiveFilters}
					availableLanguages={availableLanguages}
					onSearchChange={setSearchFilter}
					onLanguageChange={setLanguageFilter}
					onReset={resetFilters}
				/>
			}
			isEmpty={guides.length === 0}
			emptyState={
				guides.length === 0
					? {
							title: "No guides yet",
							description: "Create your first guide to cover multilingual routes.",
							action: { label: "Create Guide", to: APP_ROUTES.newGuide },
						}
					: undefined
			}
		>
			{/* When filters produce zero results, show a hint to broaden the search */}
			{filteredGuides.length === 0 ? (
				<EmptyState
					title="No matching guides"
					description="No guides match your current filters. Try broadening your search criteria."
					action={{ label: "Reset filters", onClick: resetFilters }}
				/>
			) : (
				<GuideTable guides={filteredGuides} />
			)}
		</CrudListLayout>
	);
}



