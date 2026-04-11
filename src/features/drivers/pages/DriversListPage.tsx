/**
 * DriversListPage.tsx
 *
 * The main listing page for drivers. Here is what happens when it loads:
 *   1. It fetches all drivers from the API.
 *   2. The raw list is passed to the useDriverFilters hook, which provides
 *      filter state and a filtered subset of drivers.
 *   3. The DriverFiltersBar lets users narrow results by search, license, or vehicle type.
 *   4. The DriverTable displays whichever drivers match the current filters.
 *
 * There are three possible empty states:
 *   - Still loading: a loading spinner is shown by CrudListLayout.
 *   - No drivers exist at all: a prompt to create the first driver.
 *   - Drivers exist but none match filters: a prompt to reset filters.
 */
import { useEffect, useState } from "react";
import { CrudListLayout } from "../../../components/CrudListLayout";
import { EmptyState } from "../../../components/EmptyState";
import { useToast } from "../../../components/useToast";
import { APP_ROUTES } from "../../../constants/routes";
import { DriverTable } from "../components/DriverTable";
import { DriverFiltersBar } from "../components/DriverFiltersBar";
import { listDrivers } from "../../../api/drivers.api";
import type { Driver } from "../../../types/service.types";
import { useDriverFilters } from "../../../hooks/useDriverFilters";

export function DriversListPage() {
	const [drivers, setDrivers] = useState<Driver[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [reloadKey, setReloadKey] = useState(0);
	const { addToast } = useToast();

	const {
		filters,
		filteredDrivers,
		hasActiveFilters,
		setSearchFilter,
		setLicenseFilter,
		setEntitledToDriveFilter,
		resetFilters,
	} = useDriverFilters(drivers);

	/**
	 * Fetch all drivers from the API when the page mounts (or when a retry is triggered).
	 * The isMounted flag prevents React state updates after the component unmounts,
	 * which can happen if the user navigates away before the API call finishes.
	 */
	useEffect(() => {
		let isMounted = true;

		const loadDrivers = async () => {
			try {
				setIsLoading(true);
				setErrorMessage(null);

				const response = await listDrivers();

				if (!isMounted) {
					return;
				}

				setDrivers(response.data);
			} catch (error) {
				if (!isMounted) {
					return;
				}

				const message = error instanceof Error ? error.message : "Unable to load drivers.";
				setErrorMessage(message);
				addToast(message, "error");
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadDrivers();

		return () => {
			isMounted = false;
		};
	}, [addToast, reloadKey]);

	/** Bumping reloadKey causes the useEffect above to re-run and fetch fresh data. */
	const handleRetry = () => {
		setReloadKey((current) => current + 1);
	};

	return (
		<CrudListLayout
			title="Drivers"
			description="Manage driver records, availability, and assignment readiness."
			primaryAction={{ label: "Create Driver", to: APP_ROUTES.newDriver }}
			isLoading={isLoading}
			errorMessage={errorMessage}
			onRetry={handleRetry}
			filters={
				<DriverFiltersBar
					filters={filters}
					hasActiveFilters={hasActiveFilters}
					onSearchChange={setSearchFilter}
					onLicenseChange={setLicenseFilter}
					onEntitledToDriveChange={setEntitledToDriveFilter}
					onReset={resetFilters}
				/>
			}
			isEmpty={drivers.length === 0}
			emptyState={
				drivers.length === 0
					? {
							title: "No drivers yet",
							description: "Create your first driver to enable assignments in service forms.",
							action: { label: "Create Driver", to: APP_ROUTES.newDriver },
						}
					: undefined
			}
		>
			{/* Distinguishes empty dataset from no-match filtered state. */}
			{filteredDrivers.length === 0 ? (
				<EmptyState
					title="No matching drivers"
					description="No drivers match your current filters. Try broadening your search criteria."
					action={{ label: "Reset filters", onClick: resetFilters }}
				/>
			) : (
				<DriverTable drivers={filteredDrivers} />
			)}
		</CrudListLayout>
	);
}



