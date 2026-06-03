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
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [reloadKey, setReloadKey] = useState(0);
	const { filters, filteredVehicles, hasActiveFilters, setSearchFilter, setTypeFilter, setCapacityMinFilter, setCapacityMaxFilter, resetFilters } = useVehicleFilters(vehicles);

	useEffect(() => {
		let isMounted = true;

		const loadVehicles = async () => {
			try {
				setIsLoading(true);
				setErrorMessage(null);

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
				setErrorMessage(message);
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

	const handleRetry = () => {
		setReloadKey((value) => value + 1);
	};

	return (
		<CrudListLayout
			title="Vehicles"
			description="Manage fleet records, capacities, and assignment readiness."
			primaryAction={{ label: "Create Vehicle", to: APP_ROUTES.newVehicle }}
			isLoading={isLoading}
			errorMessage={errorMessage}
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
			{filteredVehicles.length === 0 ? (
				<EmptyState
					title="No matching vehicles"
					description="No vehicles match your current filters. Try broadening your search criteria."
					action={{ label: "Reset filters", onClick: resetFilters }}
				/>
			) : (
				<VehicleTable vehicles={filteredVehicles} />
			)}
		</CrudListLayout>
	);
}



