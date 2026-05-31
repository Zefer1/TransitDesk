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



