import { useMemo, useState } from "react";
import type { Guide } from "../types/service.types";

export type GuideFiltersState = {
	search: string;
	language: string; // "all" or a specific language string
};

const INITIAL_FILTERS: GuideFiltersState = {
	search: "",
	language: "all",
};

export function useGuideFilters(guides: Guide[]) {
	const [filters, setFilters] = useState<GuideFiltersState>(INITIAL_FILTERS);

	const availableLanguages = useMemo(() => {
		const seen = new Set<string>();
		for (const guide of guides) {
			for (const lang of guide.languages ?? []) {
				seen.add(lang);
			}
		}
		return Array.from(seen).sort();
	}, [guides]);

	const filteredGuides = useMemo(() => {
		const normalizedSearch = filters.search.trim().toLowerCase();

		return guides.filter((guide) => {
			const matchesSearch =
				normalizedSearch.length === 0 ||
				guide.name.toLowerCase().includes(normalizedSearch) ||
				(guide.phone ?? "").toLowerCase().includes(normalizedSearch);

			const matchesLanguage =
				filters.language === "all" ||
				(guide.languages ?? []).includes(filters.language);

			return matchesSearch && matchesLanguage;
		});
	}, [guides, filters]);

	const hasActiveFilters =
		filters.search.trim().length > 0 || filters.language !== "all";

	const setSearchFilter = (search: string) => {
		setFilters((current) => ({ ...current, search }));
	};

	const setLanguageFilter = (language: string) => {
		setFilters((current) => ({ ...current, language }));
	};

	const resetFilters = () => {
		setFilters(INITIAL_FILTERS);
	};

	return {
		filters,
		filteredGuides,
		availableLanguages,
		hasActiveFilters,
		setSearchFilter,
		setLanguageFilter,
		resetFilters,
	};
}



