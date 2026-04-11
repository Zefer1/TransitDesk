/** Filter hook for the drivers list. Filters by name/phone search, license type, and entitled vehicle type. */
import { useMemo, useState } from "react";

import { DRIVER_LICENSES, VEHICLE_TYPES } from "../constants/enums";
import type { Driver } from "../types/service.types";

// Computes derived driver filter state and exposes memoized filter operations to list pages.

export type DriverFiltersState = {
	search: string;
	license: "all" | Driver["license"];
	entitledToDrive: "all" | Driver["entitledToDrive"];
};

const INITIAL_FILTERS: DriverFiltersState = {
	search: "",
	license: "all",
	entitledToDrive: "all",
};

export function useDriverFilters(drivers: Driver[]) {
	const [filters, setFilters] = useState<DriverFiltersState>(INITIAL_FILTERS);

	const filteredDrivers = useMemo(() => {
		const normalizedSearch = filters.search.trim().toLowerCase();

		return drivers.filter((driver) => {
			const matchesSearch =
				normalizedSearch.length === 0 ||
				driver.name.toLowerCase().includes(normalizedSearch) ||
				driver.license.toLowerCase().includes(normalizedSearch) ||
				(driver.phone ?? "").toLowerCase().includes(normalizedSearch);
			const matchesLicense = filters.license === "all" || driver.license === filters.license;
			const matchesEntitledToDrive =
				filters.entitledToDrive === "all" || driver.entitledToDrive === filters.entitledToDrive;

			return matchesSearch && matchesLicense && matchesEntitledToDrive;
		});
	}, [drivers, filters]);

	const hasActiveFilters =
		filters.search.trim().length > 0 || filters.license !== "all" || filters.entitledToDrive !== "all";

	const setSearchFilter = (search: string) => {
		setFilters((current) => ({ ...current, search }));
	};

	const setLicenseFilter = (license: DriverFiltersState["license"]) => {
		setFilters((current) => ({ ...current, license }));
	};

	const setEntitledToDriveFilter = (
		entitledToDrive: DriverFiltersState["entitledToDrive"],
	) => {
		setFilters((current) => ({ ...current, entitledToDrive }));
	};

	const resetFilters = () => {
		setFilters(INITIAL_FILTERS);
	};

	return {
		filters,
		filteredDrivers,
		hasActiveFilters,
		setSearchFilter,
		setLicenseFilter,
		setEntitledToDriveFilter,
		resetFilters,
		licenseOptions: DRIVER_LICENSES,
		entitledToDriveOptions: VEHICLE_TYPES,
	};
}



