import { useNavigate } from "react-router-dom";
import type { Guide } from "../../../types/service.types";
import { SortableHeader } from "../../../components/SortableHeader";
import { useTableSort, type SortAccessors } from "../../../hooks/useTableSort";

type GuideTableProps = {
	guides: Guide[];
};

const SORT_ACCESSORS: SortAccessors<Guide> = {
	name: (guide) => guide.name,
	gender: (guide) => guide.gender,
	languages: (guide) => (guide.languages ?? []).join(", "),
	phone: (guide) => guide.phone ?? "",
};

export function GuideTable({ guides }: GuideTableProps) {
	const navigate = useNavigate();
	const { sorted, sortKey, direction, toggleSort } = useTableSort(guides, SORT_ACCESSORS);

	const goToDetail = (guideId: number) => {
		navigate(`/guides/${guideId}`);
	};

	const goToEdit = (guideId: number) => {
		navigate(`/guides/${guideId}?mode=edit`);
	};

	const renderActions = (guide: Guide) => (
		<div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
			<button
				type="button"
				className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700"
				onClick={() => goToDetail(guide.id)}
				aria-label={`View guide ${guide.name}`}
			>
				View
			</button>
			<button
				type="button"
				className="rounded-md border border-blue-300 px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
				onClick={() => goToEdit(guide.id)}
				aria-label={`Edit guide ${guide.name}`}
			>
				Edit
			</button>
		</div>
	);

	const formatLanguages = (languages: string[] | undefined) => {
		if (!languages || languages.length === 0) return "N/A";
		return languages.join(", ");
	};

	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:hidden">
				{sorted.map((guide) => (
					<article
						key={guide.id}
						className="cursor-pointer rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm transition hover:border-blue-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus-within:border-blue-300"
						role="button"
						tabIndex={0}
						aria-label={`Open details for guide ${guide.name}`}
						onClick={() => goToDetail(guide.id)}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								goToDetail(guide.id);
							}
						}}
					>
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-base font-semibold text-gray-900 dark:text-white">{guide.name}</p>
								<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{guide.gender}</p>
							</div>
						</div>

						<dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
							<div>
								<dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Languages</dt>
								<dd className="mt-1 text-gray-800 dark:text-gray-200">{formatLanguages(guide.languages)}</dd>
							</div>
							<div>
								<dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Phone</dt>
								<dd className="mt-1 text-gray-800 dark:text-gray-200">{guide.phone ?? "N/A"}</dd>
							</div>
						</dl>

						<div className="mt-4 flex flex-wrap gap-2">{renderActions(guide)}</div>
					</article>
				))}
			</div>

			<div className="hidden overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow md:block">
				<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead className="bg-gray-50 dark:bg-gray-900">
						<tr>
							<SortableHeader label="Name" columnKey="name" activeKey={sortKey} direction={direction} onSort={toggleSort} />
							<SortableHeader label="Gender" columnKey="gender" activeKey={sortKey} direction={direction} onSort={toggleSort} />
							<SortableHeader label="Languages" columnKey="languages" activeKey={sortKey} direction={direction} onSort={toggleSort} />
							<SortableHeader label="Phone" columnKey="phone" activeKey={sortKey} direction={direction} onSort={toggleSort} />
							<th
								scope="col"
								className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400"
							>
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
						{sorted.map((guide) => (
							<tr
								key={guide.id}
								className="cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700 focus-within:bg-gray-50"
								role="button"
								tabIndex={0}
								aria-label={`Open details for guide ${guide.name}`}
								onClick={() => goToDetail(guide.id)}
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										goToDetail(guide.id);
									}
								}}
							>
								<td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{guide.name}</td>
								<td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{guide.gender}</td>
								<td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
									{guide.languages && guide.languages.length > 0 ? (
										<div className="flex flex-wrap gap-1">
											{guide.languages.map((lang) => (
												<span
													key={lang}
													className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
												>
													{lang}
												</span>
											))}
										</div>
									) : (
										<span className="text-gray-400">N/A</span>
									)}
								</td>
								<td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{guide.phone ?? "N/A"}</td>
								<td className="px-4 py-3 text-right">
									{renderActions(guide)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
