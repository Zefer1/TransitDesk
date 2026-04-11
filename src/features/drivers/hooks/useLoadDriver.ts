/**
 * useLoadDriver.ts
 *
 * A custom React hook that fetches a single driver from the API by its ID.
 * It manages three pieces of state that the consuming component can use:
 *   - driver:       the fetched driver object (or null while loading / on error).
 *   - isLoading:    true while the API request is in flight.
 *   - errorMessage: a human-readable error string if the fetch failed.
 *
 * It also exposes:
 *   - setDriver: lets the parent update the driver in state without refetching
 *                (useful after an inline edit saves successfully).
 *   - reload:    triggers a fresh fetch from the API.
 *
 * The hook validates the ID before making a request and uses a "cancelled" flag
 * to avoid updating state if the component unmounts before the fetch completes.
 */
import { useEffect, useState } from "react";
import { getDriverById } from "../../../api/drivers.api";
import type { Driver } from "../../../types/service.types";

export function useLoadDriver(id: number) {
	const [driver, setDriver] = useState<Driver | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [reloadKey, setReloadKey] = useState(0);

	// Only attempt to fetch if the ID looks like a valid positive integer
	const hasValidId = Number.isInteger(id) && id > 0;

	useEffect(() => {
		if (!hasValidId) {
			setIsLoading(false);
			setErrorMessage("Invalid driver ID.");
			setDriver(null);
			return;
		}

		// The cancelled flag prevents state updates if the component unmounts mid-fetch
		let cancelled = false;

		async function fetchDriver() {
			try {
				setIsLoading(true);
				setErrorMessage(null);
				const response = await getDriverById(id);
				if (!cancelled) {
					setDriver(response.data);
				}
			} catch (error) {
				if (!cancelled) {
					const message = error instanceof Error ? error.message : "Unable to load driver.";
					setErrorMessage(message);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		fetchDriver();

		return () => {
			cancelled = true;
		};
	}, [id, hasValidId, reloadKey]);

	/** Bumping the key causes the useEffect to re-run and fetch fresh data. */
	const reload = () => {
		setReloadKey((current) => current + 1);
	};

	return { driver, setDriver, isLoading, errorMessage, reload };
}
