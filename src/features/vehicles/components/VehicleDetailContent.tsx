import type { Vehicle } from "../../../types/service.types";

type VehicleDetailContentProps = {
	vehicle: Vehicle;
};

export function VehicleDetailContent({ vehicle }: VehicleDetailContentProps) {
	return (
		<>
			<div className="grid gap-6 md:grid-cols-2">
				<div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Specifications</h3>
					<dl className="space-y-4">
						<div>
							<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Brand & Model</dt>
							<dd className="mt-1 text-sm text-gray-900 dark:text-white">
								{vehicle.brand} {vehicle.model}
							</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Year</dt>
							<dd className="mt-1 text-sm text-gray-900 dark:text-white">{vehicle.year}</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
							<dd className="mt-1 text-sm text-gray-900 dark:text-white">{vehicle.type}</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Color</dt>
							<dd className="mt-1 text-sm text-gray-900 dark:text-white">{vehicle.color}</dd>
						</div>
					</dl>
				</div>

				<div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Capacity & Status</h3>
					<dl className="space-y-4">
						<div>
							<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Passenger Capacity</dt>
							<dd className="mt-1 text-sm text-gray-900 dark:text-white">{vehicle.passengerCapacity} seats</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
							<dd className="mt-1">
								<span
									className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
										vehicle.active ? "bg-green-100 text-green-800" : "bg-gray-100 dark:bg-gray-700 text-gray-800"
									}`}
								>
									{vehicle.active ? "Active" : "Inactive"}
								</span>
							</dd>
						</div>
						{vehicle.suitedFor ? (
							<div>
								<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Suited For</dt>
								<dd className="mt-1 text-sm text-gray-900 dark:text-white">{vehicle.suitedFor}</dd>
							</div>
						) : null}
					</dl>
				</div>
			</div>

			{vehicle.registrationDate || vehicle.inspectionExpiry ? (
				<div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Registration & Inspection</h3>
					<dl className="mt-4 space-y-4">
						{vehicle.registrationDate ? (
							<div>
								<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Date</dt>
								<dd className="mt-1 text-sm text-gray-900 dark:text-white">{vehicle.registrationDate}</dd>
							</div>
						) : null}
						{vehicle.inspectionExpiry ? (
							<div>
								<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Inspection Expiry</dt>
								<dd className="mt-1 text-sm text-gray-900 dark:text-white">{vehicle.inspectionExpiry}</dd>
							</div>
						) : null}
					</dl>
				</div>
			) : null}

			{vehicle.notes ? (
				<div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h3>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{vehicle.notes}</p>
				</div>
			) : null}
		</>
	);
}



