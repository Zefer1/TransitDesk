/**
 * useSaveDriver.ts
 *
 * A custom React hook that handles updating an existing driver via the API.
 * It provides:
 *   - isSaving:   a boolean the UI can use to disable buttons or show spinners.
 *   - saveDriver: a function that sends the update request, then calls either
 *                 onSuccess or onError so the consuming component can react
 *                 (e.g. show a toast, navigate away, update local state).
 *
 * This hook does NOT handle creating new drivers -- that is done directly
 * in DriverCreatePage because the create flow has a different shape
 * (no existing ID, different redirect behavior).
 */
import { useState } from "react";
import { updateDriver } from "../../../api/drivers.api";
import type { Driver } from "../../../types/service.types";
import type { ValidatedDriverUpdateValues } from "../schemas/driverForm.schema";

export function useSaveDriver() {
	const [isSaving, setIsSaving] = useState(false);

	/** Sends the validated payload to the API and delegates the result to callbacks. */
	const saveDriver = async (
		payload: ValidatedDriverUpdateValues,
		onSuccess: (driver: Driver) => void,
		onError: (message: string) => void,
	) => {
		setIsSaving(true);
		try {
			const response = await updateDriver(payload);
			onSuccess(response.data);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update driver";
			onError(message);
		} finally {
			setIsSaving(false);
		}
	};

	return { isSaving, saveDriver };
}
