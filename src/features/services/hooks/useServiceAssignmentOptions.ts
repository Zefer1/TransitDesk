import { useEffect, useMemo, useState } from "react";

import { listDrivers } from "../../../api/drivers.api";
import { listGuides } from "../../../api/guides.api";
import { listVehicles } from "../../../api/vehicles.api";
import type { Driver, Guide, Vehicle } from "../../../types/service.types";

type UseServiceAssignmentOptionsResult = {
	vehicleOptions: Vehicle[];
	driverOptions: Driver[];
	guideOptions: Guide[];
	isLoadingAssignments: boolean;
	assignmentError: string | null;
};

type UseStaleServiceAssignmentWarningsOptions = {
	initialVehicleId?: number;
	initialDriverId?: number;
	initialGuideId?: number;
	vehicleOptions: Vehicle[];
	driverOptions: Driver[];
	guideOptions: Guide[];
};

type UseStaleServiceAssignmentWarningsResult = {
	staleVehicleWarning: string | null;
	staleDriverWarning: string | null;
	staleGuideWarning: string | null;
};

export function useServiceAssignmentOptions(): UseServiceAssignmentOptionsResult {
	const [vehicleOptions, setVehicleOptions] = useState<Vehicle[]>([]);
	const [driverOptions, setDriverOptions] = useState<Driver[]>([]);
	const [guideOptions, setGuideOptions] = useState<Guide[]>([]);
	const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);
	const [assignmentError, setAssignmentError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const loadAssignments = async () => {
			try {
				setIsLoadingAssignments(true);
				setAssignmentError(null);

				const [vehiclesResponse, driversResponse, guidesResponse] = await Promise.all([
					listVehicles(),
					listDrivers(),
					listGuides(),
				]);

				if (!isMounted) {
					return;
				}

				setVehicleOptions(vehiclesResponse.data);
				setDriverOptions(driversResponse.data);
				setGuideOptions(guidesResponse.data);
			} catch (error) {
				if (!isMounted) {
					return;
				}

				setAssignmentError(error instanceof Error ? error.message : "Unable to load assignment options.");
			} finally {
				if (isMounted) {
					setIsLoadingAssignments(false);
				}
			}
		};

		void loadAssignments();

		return () => {
			isMounted = false;
		};
	}, []);

	return {
		vehicleOptions,
		driverOptions,
		guideOptions,
		isLoadingAssignments,
		assignmentError,
	};
}

export function useStaleServiceAssignmentWarnings({
	initialVehicleId,
	initialDriverId,
	initialGuideId,
	vehicleOptions,
	driverOptions,
	guideOptions,
}: UseStaleServiceAssignmentWarningsOptions): UseStaleServiceAssignmentWarningsResult {
	return useMemo(() => {
		const hasVehicle = initialVehicleId
			? vehicleOptions.some((vehicle) => vehicle.id === initialVehicleId)
			: true;
		const hasDriver = initialDriverId
			? driverOptions.some((driver) => driver.id === initialDriverId)
			: true;
		const hasGuide = initialGuideId
			? guideOptions.some((guide) => guide.id === initialGuideId)
			: true;

		return {
			staleVehicleWarning:
				initialVehicleId && !hasVehicle
					? `The previously assigned vehicle (ID ${initialVehicleId}) no longer exists. Please select a new vehicle.`
					: null,
			staleDriverWarning:
				initialDriverId && !hasDriver
					? `The previously assigned driver (ID ${initialDriverId}) no longer exists. Please select a new driver.`
					: null,
			staleGuideWarning:
				initialGuideId && !hasGuide
					? `The previously assigned guide (ID ${initialGuideId}) no longer exists. Please select a new guide or remove the guide assignment.`
					: null,
		};
	}, [initialVehicleId, initialDriverId, initialGuideId, vehicleOptions, driverOptions, guideOptions]);
}



