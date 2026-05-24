import type { Guide } from "../../../types/service.types";

type GuideDetailContentProps = {
	guide: Guide;
	isCheckingAssignments: boolean;
	activeAssignments: number;
};

export function GuideDetailContent({
	guide,
	isCheckingAssignments,
	activeAssignments,
}: GuideDetailContentProps) {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
				<dl className="space-y-4">
					<div>
						<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
						<dd className="mt-1 text-sm text-gray-900 dark:text-white">{guide.name}</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</dt>
						<dd className="mt-1 text-sm text-gray-900 dark:text-white">{guide.gender}</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
						<dd className="mt-1 text-sm text-gray-900 dark:text-white">{guide.phone || "Not provided"}</dd>
					</div>
				</dl>
			</div>

			<div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Languages</h3>
				{guide.languages && guide.languages.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						{guide.languages.map((language) => (
							<span
								key={language}
								className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
							>
								{language}
							</span>
						))}
					</div>
				) : (
					<p className="text-sm text-gray-500 dark:text-gray-400">No languages listed.</p>
				)}

				<div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
					<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Assignment Status</dt>
					<dd className="mt-1">
						{isCheckingAssignments ? (
							<span className="text-sm text-gray-500 dark:text-gray-400">Checking assignments…</span>
						) : (
							<span
								className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
									activeAssignments > 0
										? "bg-amber-100 text-amber-800"
										: "bg-green-100 text-green-800"
								}`}
							>
								{activeAssignments > 0
									? `${activeAssignments} active assignment(s)`
									: "Available"}
							</span>
						)}
					</dd>
				</div>
			</div>
		</div>
	);
}
