import { VEHICLE_TYPES } from "../../../constants/enums";
import type { VehicleFiltersState } from "../../../hooks/useVehicleFilters";

type VehicleFiltersBarProps = {
	filters: VehicleFiltersState;
	hasActiveFilters: boolean;
	onSearchChange: (value: string) => void;
	onTypeChange: (value: VehicleFiltersState["type"]) => void;
	onCapacityMinChange: (value: string) => void;
	onCapacityMaxChange: (value: string) => void;
	onReset: () => void;
};

export function VehicleFiltersBar({
	filters,
	hasActiveFilters,
	onSearchChange,
	onTypeChange,
	onCapacityMinChange,
	onCapacityMaxChange,
	onReset,
}: VehicleFiltersBarProps) {
	return (
		<div className="mb-6 flex flex-col items-end gap-3 sm:flex-row sm:items-end">
			<div className="grid w-full flex-1 gap-4 md:grid-cols-4">
				<label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
					Search
					<input
						type="search"
						placeholder="Search by plate, brand, or model"
						value={filters.search}
						onChange={(event) => onSearchChange(event.target.value)}
						className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
					/>
				</label>
				<label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
					Type
					<select
						value={filters.type}
						onChange={(event) => onTypeChange(event.target.value as VehicleFiltersState["type"])}
						className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
					>
						<option value="all">All types</option>
						{VEHICLE_TYPES.map((vehicleType) => (
							<option key={vehicleType} value={vehicleType}>
								{vehicleType}
							</option>
						))}
					</select>
				</label>
				<label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
					Min Capacity
					<input
						type="number"
						placeholder="Min seats"
						value={filters.capacityMin}
						onChange={(event) => onCapacityMinChange(event.target.value)}
						min="0"
						className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
					/>
				</label>
				<label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
					Max Capacity
					<input
						type="number"
						placeholder="Max seats"
						value={filters.capacityMax}
						onChange={(event) => onCapacityMaxChange(event.target.value)}
						min="0"
						className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
					/>
				</label>
			</div>

			<button
				type="button"
				onClick={onReset}
				disabled={!hasActiveFilters}
				className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
			>
				Reset filters
			</button>
		</div>
	);
}



