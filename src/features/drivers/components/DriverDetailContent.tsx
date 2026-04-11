/**
 * DriverDetailContent.tsx
 *
 * A read-only card that shows all the important details about a single driver.
 * This component does NOT let you edit anything -- it is purely for viewing.
 * It is used inside the DriverDetailPage when the page is in "view" mode
 * (as opposed to "edit" mode, which renders the DriverForm instead).
 *
 * The layout is split into two side-by-side cards on wider screens:
 *   - Personal Information (name, gender, phone)
 *   - License & Eligibility (license type, what vehicle types the driver can operate)
 */
import type { Driver } from "../../../types/service.types";

type DriverDetailContentProps = {
	driver: Driver;
};

export function DriverDetailContent({ driver }: DriverDetailContentProps) {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			{/* Left card: basic personal info */}
			<div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
				<dl className="space-y-4">
					<div>
						<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
						<dd className="mt-1 text-sm text-gray-900 dark:text-white">{driver.name}</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</dt>
						<dd className="mt-1 text-sm text-gray-900 dark:text-white">{driver.gender}</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
						<dd className="mt-1 text-sm text-gray-900 dark:text-white">{driver.phone || "Not provided"}</dd>
					</div>
				</dl>
			</div>

			{/* Right card: license and vehicle eligibility */}
			<div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white">License & Eligibility</h3>
				<dl className="space-y-4">
					<div>
						<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">License Type</dt>
						<dd className="mt-1 text-sm text-gray-900 dark:text-white">{driver.license}</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Entitled to Drive</dt>
						<dd className="mt-1 text-sm text-gray-900 dark:text-white">{driver.entitledToDrive}</dd>
					</div>
				</dl>
			</div>
		</div>
	);
}



