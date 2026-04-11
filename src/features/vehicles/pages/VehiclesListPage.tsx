/**
 * VehiclesListPage.tsx
 *
 * The main "Vehicles" page that users land on. It:
 *   1. Fetches all vehicles from the API on mount
 *   2. Passes them through the useVehicleFilters hook so the user can
 *      search, filter by type, and set capacity ranges
 *   3. Renders the results in a VehicleTable (or shows empty/error states)
 *
 * The page also provides a "Create Vehicle" button and a retry mechanism
 * if the initial fetch fails.
 */
import { useEffect, useState } from "react";
import { EmptyState } from "../../../components/EmptyState";
import { CrudListLayout } from "../../../components/CrudListLayout";
import { useToast } from "../../../components/useToast";
import { APP_ROUTES } from "../../../constants/routes";
import { VehicleTable } from "../components/VehicleTable";
import { VehicleFiltersBar } from "../components/VehicleFiltersBar";
import { listVehicles } from "../../../api/vehicles.api";
import type { Vehicle } from "../../../types/service.types";
import { useVehicleFilters } from "../../../hooks/useVehicleFilters";


export function VehiclesListPage() {
	const { addToast } = useToast();
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [reloadKey, setReloadKey] = useState(0);
	const { filters, filteredVehicles, hasActiveFilters, setSearchFilter, setTypeFilter, setCapacityMinFilter, setCapacityMaxFilter, resetFilters } = useVehicleFilters(vehicles);

	/**
	 * Fetch all vehicles from the API when the page mounts (or when reloadKey changes).
	 * The "isMounted" flag prevents updating state after the component unmounts,
	 * which would cause a React warning. This is a common pattern for async effects.
	 */
	useEffect(() => {
		let isMounted = true;

		const loadVehicles = async () => {
			try {
				setIsLoading(true);
				setError(null);

				const response = await listVehicles();

				if (!isMounted) {
					return;
				}

				setVehicles(response.data);
			} catch (err) {
				if (!isMounted) {
					return;
				}

				const message = err instanceof Error ? err.message : "Unable to load vehicles. Please try again.";
				setError(message);
				addToast(message, "error");
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadVehicles();

		return () => {
			isMounted = false;
		};
	}, [addToast, reloadKey]);

	/** Bumping the reloadKey causes the useEffect above to run again, re-fetching vehicles */
	const handleRetry = () => {
		setReloadKey((value) => value + 1);
	};

	return (
		<CrudListLayout
			title="Vehicles"
			description="Manage fleet records, capacities, and assignment readiness."
			primaryAction={{ label: "Create Vehicle", to: APP_ROUTES.newVehicle }}
			isLoading={isLoading}
			errorMessage={error}
			onRetry={handleRetry}
			loadingLabel="Loading vehicles"
			filters={
				<VehicleFiltersBar
					filters={filters}
					hasActiveFilters={hasActiveFilters}
					onSearchChange={setSearchFilter}
					onTypeChange={setTypeFilter}
					onCapacityMinChange={setCapacityMinFilter}
					onCapacityMaxChange={setCapacityMaxFilter}
					onReset={resetFilters}
				/>
			}
			isEmpty={vehicles.length === 0}
			emptyState={{
				title: "No vehicles yet",
				description: "Create your first vehicle to assign capacity to upcoming services.",
				action: { label: "Create Vehicle", to: APP_ROUTES.newVehicle },
			}}
		>
			{/* If vehicles exist but none match the current filters, show a hint to adjust filters */}
			{filteredVehicles.length === 0 ? (
				<EmptyState
					title="No vehicles match your filters"
					description="Try adjusting your search or filter criteria."
				/>
			) : (
				<VehicleTable vehicles={filteredVehicles} />
			)}
		</CrudListLayout>
	);
}



