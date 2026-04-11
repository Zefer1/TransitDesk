/**
 * useSaveGuide.ts
 *
 * A small hook that wraps the "update guide" API call. It manages an
 * isSaving flag so the UI can disable buttons and show loading indicators
 * while the save is in progress.
 *
 * Instead of returning the result directly, it uses callback parameters
 * (onSuccess and onError) so the calling code can decide what to do next
 * -- for example, show a toast, navigate to another page, or update local state.
 */
import { useState } from "react";
import { updateGuide } from "../../../api/guides.api";
import type { Guide } from "../../../types/service.types";
import type { ValidatedGuideUpdateValues } from "../schemas/guideForm.schema";

export function useSaveGuide() {
	const [isSaving, setIsSaving] = useState(false);

	const saveGuide = async (
		payload: ValidatedGuideUpdateValues,
		onSuccess: (guide: Guide) => void,
		onError: (message: string) => void,
	) => {
		setIsSaving(true);
		try {
			const response = await updateGuide(payload);
			onSuccess(response.data);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update guide";
			onError(message);
		} finally {
			setIsSaving(false);
		}
	};

	return { isSaving, saveGuide };
}
