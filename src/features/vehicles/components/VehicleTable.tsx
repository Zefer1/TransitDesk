import { useNavigate } from "react-router-dom";
import type { Vehicle } from "../../../types/service.types";

type VehicleTableProps = {
	vehicles: Vehicle[];
};

export function VehicleTable({ vehicles }: VehicleTableProps) {
	const navigate = useNavigate();

	const goToDetail = (vehicleId: number) => {
		navigate(`/vehicles/${vehicleId}`);
	};

	const goToEdit = (vehicleId: number) => {
		navigate(`/vehicles/${vehicleId}?mode=edit`);
	};

	const renderActions = (vehicle: Vehicle) => (
		<div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
			<button
				type="button"
				className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700"
				onClick={() => goToDetail(vehicle.id)}
				aria-label={`View vehicle ${vehicle.licensePlate}`}
			>
				View
			</button>
			<button
				type="button"
				className="rounded-md border border-blue-300 px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
				onClick={() => goToEdit(vehicle.id)}
				aria-label={`Edit vehicle ${vehicle.licensePlate}`}
			>
				Edit
			</button>
		</div>
	);

	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:hidden">
				{vehicles.map((vehicle) => (
					<article
						key={vehicle.id}
						className="cursor-pointer rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm transition hover:border-blue-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus-within:border-blue-300"
						role="button"
						tabIndex={0}
						aria-label={`Open details for vehicle ${vehicle.licensePlate}`}
						onClick={() => goToDetail(vehicle.id)}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								goToDetail(vehicle.id);
							}
						}}
					>
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-base font-semibold text-gray-900 dark:text-white">{vehicle.licensePlate}</p>
								<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
									{vehicle.brand} {vehicle.model}
								</p>
							</div>
						</div>

						<dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
							<div>
								<dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Capacity</dt>
								<dd className="mt-1 text-gray-800 dark:text-gray-200">{vehicle.passengerCapacity} seats</dd>
							</div>
							<div>
								<dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Type</dt>
								<dd className="mt-1 text-gray-800 dark:text-gray-200">{vehicle.type}</dd>
							</div>
						</dl>

						<div className="mt-4 flex flex-wrap gap-2">{renderActions(vehicle)}</div>
					</article>
				))}
			</div>

			<div className="hidden overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow md:block">
				<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead className="bg-gray-50 dark:bg-gray-900">
						<tr>
							<th
								scope="col"
								className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400"
							>
								License Plate
							</th>
							<th
								scope="col"
								className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400"
							>
								Brand & Model
							</th>
							<th
								scope="col"
								className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400"
							>
								Capacity
							</th>
							<th
								scope="col"
								className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400"
							>
								Type
							</th>
							<th
								scope="col"
								className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400"
							>
								Year
							</th>
							<th
								scope="col"
								className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400"
							>
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
						{vehicles.map((vehicle) => (
							<tr
								key={vehicle.id}
								className="cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700"
								onClick={() => goToDetail(vehicle.id)}
								role="button"
								tabIndex={0}
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										goToDetail(vehicle.id);
									}
								}}
								aria-label={`Open details for vehicle ${vehicle.licensePlate}`}
							>
								<td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">{vehicle.licensePlate}</td>
								<td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
									{vehicle.brand} {vehicle.model}
								</td>
								<td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{vehicle.passengerCapacity} seats</td>
								<td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{vehicle.type}</td>
								<td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{vehicle.year}</td>
								<td className="px-4 py-4 text-sm">{renderActions(vehicle)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}



