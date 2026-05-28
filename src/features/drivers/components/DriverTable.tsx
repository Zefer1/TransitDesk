import { useNavigate } from "react-router-dom";

import type { Driver } from "../../../types/service.types";

type DriverTableProps = {
	drivers: Driver[];
};

export function DriverTable({ drivers }: DriverTableProps) {
	const navigate = useNavigate();

	const goToDetail = (driverId: number) => {
		navigate(`/drivers/${driverId}`);
	};

	const goToEdit = (driverId: number) => {
		navigate(`/drivers/${driverId}`);
	};

	const renderActions = (driver: Driver) => (
		<div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
			<button
				type="button"
				className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700"
				onClick={() => goToDetail(driver.id)}
				aria-label={`View driver ${driver.name}`}
			>
				View
			</button>
			<button
				type="button"
				className="rounded-md border border-blue-300 px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
				onClick={() => goToEdit(driver.id)}
				aria-label={`Edit driver ${driver.name}`}
			>
				Edit
			</button>
		</div>
	);

	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:hidden">
				{drivers.map((driver) => (
					<article
						key={driver.id}
						className="cursor-pointer rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm transition hover:border-blue-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus-within:border-blue-300"
						role="button"
						tabIndex={0}
						aria-label={`Open details for driver ${driver.name}`}
						onClick={() => goToDetail(driver.id)}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								goToDetail(driver.id);
							}
						}}
					>
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-base font-semibold text-gray-900 dark:text-white">{driver.name}</p>
								<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">License {driver.license}</p>
							</div>
						</div>

						<dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
							<div>
								<dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Can Drive</dt>
								<dd className="mt-1 text-gray-800 dark:text-gray-200">{driver.entitledToDrive}</dd>
							</div>
							<div>
								<dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Phone</dt>
								<dd className="mt-1 text-gray-800 dark:text-gray-200">{driver.phone ?? "N/A"}</dd>
							</div>
						</dl>

						<div className="mt-4 flex flex-wrap gap-2">{renderActions(driver)}</div>
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
								Name
							</th>
							<th
								scope="col"
								className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400"
							>
								License
							</th>
							<th
								scope="col"
								className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400"
							>
								Can Drive
							</th>
							<th
								scope="col"
								className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400"
							>
								Phone
							</th>
							<th
								scope="col"
								className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400"
							>
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
						{drivers.map((driver) => (
							<tr
								key={driver.id}
								className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 focus-within:bg-gray-50"

								tabIndex={0}
								aria-label={`Open details for driver ${driver.name}`}
								onClick={() => goToDetail(driver.id)}
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										goToDetail(driver.id);
									}
								}}
							>
								<td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{driver.name}</td>
								<td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{driver.license}</td>
								<td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{driver.entitledToDrive}</td>
								<td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{driver.phone ?? "N/A"}</td>
								<td className="px-4 py-3 text-sm">{renderActions(driver)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
