/**
 * DriverFiltersBar.tsx
 *
 * A row of filter controls that sits above the driver list table.
 * It lets the user narrow down the displayed drivers by:
 *   - Typing a search term (matches against name or license)
 *   - Picking a specific license type from a dropdown
 *   - Picking a vehicle type the driver is entitled to drive
 *
 * This component is "controlled" -- it does not manage its own state.
 * Instead, the parent (DriversListPage) owns the filter state through
 * the useDriverFilters hook and passes values + change handlers down here.
 * When the user interacts with a control, the matching callback fires
 * and the parent updates its state, which re-renders this component.
 */
import { DRIVER_LICENSES, VEHICLE_TYPES } from "../../../constants/enums";
import type { DriverFiltersState } from "../../../hooks/useDriverFilters";

type DriverFiltersBarProps = {
	filters: DriverFiltersState;
	hasActiveFilters: boolean;
	onSearchChange: (value: string) => void;
	onLicenseChange: (value: DriverFiltersState["license"]) => void;
	onEntitledToDriveChange: (value: DriverFiltersState["entitledToDrive"]) => void;
	onReset: () => void;
};

export function DriverFiltersBar({
	filters,
	hasActiveFilters,
	onSearchChange,
	onLicenseChange,
	onEntitledToDriveChange,
	onReset,
}: DriverFiltersBarProps) {
	return (
		<div className="grid gap-4 md:grid-cols-3">
			<label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
				Search
				<input
					type="search"
					value={filters.search}
					onChange={(event) => onSearchChange(event.target.value)}
					placeholder="Search by name or license"
					className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				/>
			</label>
			<label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
				License
				<select
					value={filters.license}
					onChange={(event) => onLicenseChange(event.target.value as DriverFiltersState["license"])}
					className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				>
					<option value="all">All licenses</option>
					{DRIVER_LICENSES.map((license) => (
						<option key={license} value={license}>
							{license}
						</option>
					))}
				</select>
			</label>
			<label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
				Entitled To Drive
				<select
					value={filters.entitledToDrive}
					onChange={(event) => onEntitledToDriveChange(event.target.value as DriverFiltersState["entitledToDrive"])}
					className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				>
					<option value="all">All vehicle types</option>
					{VEHICLE_TYPES.map((vehicleType) => (
						<option key={vehicleType} value={vehicleType}>
							{vehicleType}
						</option>
					))}
				</select>
			</label>
			<div className="flex items-end">
				<button
					type="button"
					onClick={onReset}
					disabled={!hasActiveFilters}
					className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Reset filters
				</button>
			</div>
		</div>
	);
}



