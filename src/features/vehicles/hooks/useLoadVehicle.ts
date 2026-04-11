/** Hook to fetch a single vehicle by ID. Handles loading, error, and reload. */
import { useEffect, useState } from "react";
import { getVehicleById } from "../../../api/vehicles.api";
import type { Vehicle } from "../../../types/service.types";

export function useLoadVehicle(id: number) {
	const [vehicle, setVehicle] = useState<Vehicle | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [reloadKey, setReloadKey] = useState(0);

	const hasValidId = Number.isInteger(id) && id > 0;

	useEffect(() => {
		if (!hasValidId) {
			setIsLoading(false);
			setErrorMessage("Invalid vehicle ID.");
			setVehicle(null);
			return;
		}

		let cancelled = false;

		async function fetchVehicle() {
			try {
				setIsLoading(true);
				setErrorMessage(null);
				const response = await getVehicleById(id);
				if (!cancelled) {
					setVehicle(response.data);
				}
			} catch (error) {
				if (!cancelled) {
					const message = error instanceof Error ? error.message : "Unable to load vehicle.";
					setErrorMessage(message);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		fetchVehicle();

		return () => {
			cancelled = true;
		};
	}, [id, hasValidId, reloadKey]);

	const reload = () => {
		setReloadKey((current) => current + 1);
	};

	return { vehicle, setVehicle, isLoading, errorMessage, reload };
}
