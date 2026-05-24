import { ALLOWED_TRANSITIONS } from "../../../constants/serviceStatuses";
import type { Service, ServiceStatus } from "../../../types/service.types";
import { formatDateTime, formatTotalEstimatedTime } from "../utils/serviceFormatters";

const transitionButtonLabel: Record<ServiceStatus, string> = {
	scheduled: "Mark as Scheduled",
	ongoing: "Start Service",
	completed: "Complete Service",
	cancelled: "Cancel Service",
};

interface ServiceDetailContentProps {
	service: Service;
	isTransitioning: boolean;
	onTransitionClick: (status: ServiceStatus) => void;
}

export function ServiceDetailContent({
	service,
	isTransitioning,
	onTransitionClick,
}: ServiceDetailContentProps) {
	const routeStops = service.stops
		.map((stop) => stop.trim())
		.filter((stop) => stop.length > 0);
	const routeSummary = routeStops.length > 0 ? routeStops.join(" -> ") : "-";

	const passengerCount = service.passengerQuantity ?? 0;
	const capacity = service.vehicle.passengerCapacity ?? 0;
	const occupancy = capacity > 0 ? Math.round((passengerCount / capacity) * 100) : 0;
	const seatsRemaining = Math.max(capacity - passengerCount, 0);

	const nextTransitions = ALLOWED_TRANSITIONS[service.status];

	return (
		<>
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
					<p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Route summary</p>
					<p className="mt-2 text-sm text-gray-800">{routeSummary}</p>
				</div>
				<div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
					<p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Vehicle capacity usage</p>
					<p className="mt-2 text-sm text-gray-800">
						{passengerCount}/{capacity} passengers ({occupancy}%)
					</p>
				</div>
				<div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
					<p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Seats remaining</p>
					<p className="mt-2 text-sm text-gray-800">{seatsRemaining}</p>
				</div>
				<div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
					<p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Total estimated time</p>
					<p className="mt-2 text-sm text-gray-800">
						{formatTotalEstimatedTime(service.estimatedDurationMin)}
					</p>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<article className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Service</h2>
					<dl className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
						<div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
							<dt className="font-medium text-gray-500 dark:text-gray-400">Scheduled</dt>
							<dd>{formatDateTime(service.scheduledAt)}</dd>
						</div>
						<div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
							<dt className="font-medium text-gray-500 dark:text-gray-400">Distance</dt>
							<dd>{service.distanceKm ? `${service.distanceKm} km` : "Not specified"}</dd>
						</div>
						<div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
							<dt className="font-medium text-gray-500 dark:text-gray-400">Stops</dt>
							<dd>{service.stops.length}</dd>
						</div>
					</dl>

					{service.description || service.agencyName ? (
						<dl className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
							{service.description ? (
								<div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
									<dt className="font-medium text-gray-500 dark:text-gray-400">Description</dt>
									<dd>{service.description}</dd>
								</div>
							) : null}
							{service.agencyName ? (
								<div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
									<dt className="font-medium text-gray-500 dark:text-gray-400">Agency</dt>
									<dd>{service.agencyName}</dd>
								</div>
							) : null}
						</dl>
					) : null}

					{service.notes ? (
						<div className="mt-4 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
							{service.notes}
						</div>
					) : null}
				</article>

				<article className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assignments</h2>
					<div className="mt-4 space-y-4 text-sm text-gray-700 dark:text-gray-300">
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Vehicle</p>
							<p className="mt-1 font-medium text-gray-900 dark:text-white">
								{service.vehicle.licensePlate} ({service.vehicle.brand} {service.vehicle.model})
							</p>
							<p className="text-gray-600 dark:text-gray-400">Capacity: {service.vehicle.passengerCapacity}</p>
						</div>

						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Driver</p>
							<p className="mt-1 font-medium text-gray-900 dark:text-white">{service.driver.name}</p>
							<p className="text-gray-600 dark:text-gray-400">
								License {service.driver.license} - {service.driver.entitledToDrive}
							</p>
						</div>

						{service.guide ? (
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Guide</p>
								<p className="mt-1 font-medium text-gray-900 dark:text-white">{service.guide.name}</p>
								<p className="text-gray-600 dark:text-gray-400">
									{service.guide.languages?.length
										? service.guide.languages.join(", ")
										: "Languages not specified"}
								</p>
							</div>
						) : (
							<p className="text-gray-500 dark:text-gray-400">No guide assigned.</p>
						)}
					</div>
				</article>
			</div>

			{nextTransitions.length > 0 ? (
				<div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Status actions</h2>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
						Only transitions allowed by the status matrix are available.
					</p>
					{isTransitioning ? (
						<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Updating status...</p>
					) : null}
					<div className="mt-4 flex flex-wrap gap-3">
						{nextTransitions.map((targetStatus) => (
							<button
								key={targetStatus}
								type="button"
								onClick={() => onTransitionClick(targetStatus)}
								disabled={isTransitioning}
								className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
							>
								{transitionButtonLabel[targetStatus]}
							</button>
						))}
					</div>
				</div>
			) : null}
		</>
	);
}



