import type { SortDirection } from "../hooks/useTableSort";

type SortableHeaderProps = {
	label: string;
	columnKey: string;
	activeKey: string | null;
	direction: SortDirection;
	onSort: (key: string) => void;
	align?: "left" | "right";
};

export function SortableHeader({ label, columnKey, activeKey, direction, onSort, align = "left" }: SortableHeaderProps) {
	const isActive = activeKey === columnKey;
	const ariaSort = isActive ? (direction === "asc" ? "ascending" : "descending") : "none";

	return (
		<th
			scope="col"
			aria-sort={ariaSort}
			className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 ${align === "right" ? "text-right" : "text-left"}`}
		>
			<button
				type="button"
				onClick={() => onSort(columnKey)}
				className={`inline-flex items-center gap-1 uppercase tracking-wide transition hover:text-gray-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded ${align === "right" ? "flex-row-reverse" : ""}`}
			>
				{label}
				{isActive ? (
					<svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
						{direction === "asc" ? (
							<path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
						) : (
							<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
						)}
					</svg>
				) : null}
			</button>
		</th>
	);
}
