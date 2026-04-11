/** Filter hook for the services list. Filters by status, description search, and date range. Exports testable helper functions. */
import { useMemo, useState } from "react";
import type { Service, ServiceStatus } from "../types/service.types";

// Core flow note: the block below contains the main behavior used by this module.

// Applies status/search/date filters in a deterministic order for predictable list behavior.

export type ServiceFilters = {
	status: ServiceStatus | "all";
	search: string;
	startDate: string;
	endDate: string;
};

const INITIAL_FILTERS: ServiceFilters = {
	status: "all",
	search: "",
	startDate: "",
	endDate: "",
};

export function matchesStatus(service: Service, status: ServiceFilters["status"]): boolean {
	return status === "all" || service.status === status;
}

export function matchesSearch(service: Service, search: string): boolean {
	const normalizedSearch = search.trim().toLowerCase();

	if (!normalizedSearch) {
		return true;
	}

	return service.description.toLowerCase().includes(normalizedSearch);
}

export function matchesDateRange(service: Service, startDate: string, endDate: string): boolean {
	const scheduledTime = new Date(service.scheduledAt).getTime();

	if (Number.isNaN(scheduledTime)) {
		return false;
	}

	if (startDate) {
		const startTime = new Date(startDate).getTime();
		if (!Number.isNaN(startTime) && scheduledTime < startTime) {
			return false;
		}
	}

	if (endDate) {
		const end = new Date(endDate);
		end.setHours(23, 59, 59, 999);
		const endTime = end.getTime();

		if (!Number.isNaN(endTime) && scheduledTime > endTime) {
			return false;
		}
	}

	return true;
}

export function useServiceFilters(services: Service[]) {
	const [filters, setFilters] = useState<ServiceFilters>(INITIAL_FILTERS);

	const filteredServices = useMemo(() => {
		return services.filter((service) => {
			return (
				matchesStatus(service, filters.status) &&
				matchesSearch(service, filters.search) &&
				matchesDateRange(service, filters.startDate, filters.endDate)
			);
		});
	}, [filters, services]);

	const setStatusFilter = (status: ServiceFilters["status"]) => {
		setFilters((currentFilters) => ({
			...currentFilters,
			status,
		}));
	};

	const setSearchFilter = (search: string) => {
		setFilters((currentFilters) => ({
			...currentFilters,
			search,
		}));
	};

	const setDateRange = (startDate: string, endDate: string) => {
		setFilters((currentFilters) => ({
			...currentFilters,
			startDate,
			endDate,
		}));
	};

	const resetFilters = () => {
		setFilters(INITIAL_FILTERS);
	};

	const hasActiveFilters =
		filters.status !== "all" ||
		filters.search.trim() !== "" ||
		filters.startDate !== "" ||
		filters.endDate !== "";

	return {
		filters,
		filteredServices,
		hasActiveFilters,
		setFilters,
		setStatusFilter,
		setSearchFilter,
		setDateRange,
		resetFilters,
	};
}




