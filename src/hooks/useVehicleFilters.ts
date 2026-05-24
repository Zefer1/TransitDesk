import { useMemo, useState } from "react";
import { VEHICLE_TYPES } from "../constants/enums";
import type { Vehicle } from "../types/service.types";

export type VehicleFiltersState = {
	search: string;
	type: "all" | Vehicle["type"];
	capacityMin: string;
	capacityMax: string;
};

const INITIAL_FILTERS: VehicleFiltersState = {
	search: "",
	type: "all",
	capacityMin: "",
	capacityMax: "",
};

export function useVehicleFilters(vehicles: Vehicle[]) {
	const [filters, setFilters] = useState<VehicleFiltersState>(INITIAL_FILTERS);

	const filteredVehicles = useMemo(() => {
		const normalizedSearch = filters.search.trim().toLowerCase();
		const minCapacity = filters.capacityMin ? Number(filters.capacityMin) : 0;
		const maxCapacity = filters.capacityMax ? Number(filters.capacityMax) : Infinity;

		return vehicles.filter((vehicle) => {
			const matchesSearch =
				normalizedSearch.length === 0 ||
				vehicle.licensePlate.toLowerCase().includes(normalizedSearch) ||
				vehicle.brand.toLowerCase().includes(normalizedSearch) ||
				vehicle.model.toLowerCase().includes(normalizedSearch) ||
				vehicle.color.toLowerCase().includes(normalizedSearch);
			const matchesType = filters.type === "all" || vehicle.type === filters.type;
			const matchesCapacity = vehicle.passengerCapacity >= minCapacity && vehicle.passengerCapacity <= maxCapacity;

			return matchesSearch && matchesType && matchesCapacity;
		});
	}, [vehicles, filters]);

	const hasActiveFilters =
		filters.search.trim().length > 0 ||
		filters.type !== "all" ||
		filters.capacityMin.length > 0 ||
		filters.capacityMax.length > 0;

	const setSearchFilter = (search: string) => {
		setFilters((current) => ({ ...current, search }));
	};

	const setTypeFilter = (type: VehicleFiltersState["type"]) => {
		setFilters((current) => ({ ...current, type }));
	};

	const setCapacityMinFilter = (capacityMin: string) => {
		setFilters((current) => ({ ...current, capacityMin }));
	};

	const setCapacityMaxFilter = (capacityMax: string) => {
		setFilters((current) => ({ ...current, capacityMax }));
	};

	const resetFilters = () => {
		setFilters(INITIAL_FILTERS);
	};

	return {
		filters,
		filteredVehicles,
		hasActiveFilters,
		setSearchFilter,
		setTypeFilter,
		setCapacityMinFilter,
		setCapacityMaxFilter,
		resetFilters,
		typeOptions: VEHICLE_TYPES,
	};
}



