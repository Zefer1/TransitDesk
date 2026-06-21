import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

type SortValue = string | number;

export type SortAccessors<T> = Record<string, (item: T) => SortValue>;

export function useTableSort<T>(items: T[], accessors: SortAccessors<T>) {
	const [sortKey, setSortKey] = useState<string | null>(null);
	const [direction, setDirection] = useState<SortDirection>("asc");

	function toggleSort(key: string) {
		if (sortKey === key) {
			setDirection(direction === "asc" ? "desc" : "asc");
		} else {
			setSortKey(key);
			setDirection("asc");
		}
	}

	const sorted = useMemo(() => {
		if (!sortKey) {
			return items;
		}
		const getValue = accessors[sortKey];
		return [...items].sort((a, b) => {
			const aValue = getValue(a);
			const bValue = getValue(b);
			const result =
				typeof aValue === "number" && typeof bValue === "number"
					? aValue - bValue
					: String(aValue).localeCompare(String(bValue));
			return direction === "asc" ? result : -result;
		});
	}, [items, sortKey, direction, accessors]);

	return { sorted, sortKey, direction, toggleSort };
}
