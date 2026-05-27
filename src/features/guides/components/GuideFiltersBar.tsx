import type { GuideFiltersState } from "../../../hooks/useGuideFilters";

type GuideFiltersBarProps = {
	filters: GuideFiltersState;
	hasActiveFilters: boolean;
	availableLanguages: string[];
	onSearchChange: (value: string) => void;
	onLanguageChange: (value: string) => void;
	onReset: () => void;
};

export function GuideFiltersBar({
	filters,
	hasActiveFilters,
	availableLanguages,
	onSearchChange,
	onLanguageChange,
	onReset,
}: GuideFiltersBarProps) {
	return (
		<div className="grid gap-4 md:grid-cols-3">
			<label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
				Search
				<input
					type="search"
					value={filters.search}
					onChange={(event) => onSearchChange(event.target.value)}
					placeholder="Search by name or phone"
					className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				/>
			</label>
			<label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
				Language
				<select
					value={filters.language}
					onChange={(event) => onLanguageChange(event.target.value)}
					className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				>
					<option value="all">All languages</option>
					{availableLanguages.map((language) => (
						<option key={language} value={language}>
							{language}
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
