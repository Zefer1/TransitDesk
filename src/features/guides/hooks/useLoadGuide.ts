/**
 * useLoadGuide.ts
 *
 * A custom React hook that fetches a single guide from the API by its numeric ID.
 *
 * What it gives you:
 *   - guide: the loaded guide object (or null while loading / on error)
 *   - setGuide: lets you update the local guide data without re-fetching
 *              (useful after an inline edit so the UI updates immediately)
 *   - isLoading: true while the API request is in flight
 *   - errorMessage: a human-readable error string if something went wrong
 *   - reload: call this to re-fetch the guide (e.g. after an error, to retry)
 *
 * It also validates the ID before making the request -- if someone navigates
 * to /guides/abc, it will immediately show an "Invalid guide ID" error.
 */
import { useEffect, useState } from "react";
import { getGuideById } from "../../../api/guides.api";
import type { Guide } from "../../../types/service.types";

export function useLoadGuide(id: number) {
	const [guide, setGuide] = useState<Guide | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [reloadKey, setReloadKey] = useState(0);

	const hasValidId = Number.isInteger(id) && id > 0;

	// The `cancelled` flag inside the effect prevents stale responses from
	// overwriting state if the component unmounts or the ID changes mid-request.
	useEffect(() => {
		if (!hasValidId) {
			setIsLoading(false);
			setErrorMessage("Invalid guide ID.");
			setGuide(null);
			return;
		}

		let cancelled = false;

		async function fetchGuide() {
			try {
				setIsLoading(true);
				setErrorMessage(null);
				const response = await getGuideById(id);
				if (!cancelled) {
					setGuide(response.data);
				}
			} catch (error) {
				if (!cancelled) {
					const message = error instanceof Error ? error.message : "Unable to load guide.";
					setErrorMessage(message);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		fetchGuide();

		return () => {
			cancelled = true;
		};
	}, [id, hasValidId, reloadKey]);

	const reload = () => {
		setReloadKey((current) => current + 1);
	};

	return { guide, setGuide, isLoading, errorMessage, reload };
}
