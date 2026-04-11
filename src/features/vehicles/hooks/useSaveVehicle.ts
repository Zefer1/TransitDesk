/** Hook for saving vehicle updates. Manages isSaving state. */
import { useState } from "react";
import { updateVehicle } from "../../../api/vehicles.api";
import type { Vehicle } from "../../../types/service.types";
import type { ValidatedVehicleUpdateValues } from "../schemas/vehicleForm.schema";

export function useSaveVehicle() {
	const [isSaving, setIsSaving] = useState(false);

	const saveVehicle = async (
		payload: ValidatedVehicleUpdateValues,
		onSuccess: (vehicle: Vehicle) => void,
		onError: (message: string) => void,
	) => {
		setIsSaving(true);
		try {
			const response = await updateVehicle(payload);
			onSuccess(response.data);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update vehicle";
			onError(message);
		} finally {
			setIsSaving(false);
		}
	};

	return { isSaving, saveVehicle };
}
