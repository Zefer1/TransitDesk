/** Hook to check if a vehicle has active service assignments (scheduled or ongoing). */
import { useCallback, useEffect, useState } from "react";
import { listServices } from "../../../api/services.api";

export function useVehicleAssignments(vehicleId: number | null) {
	const [activeAssignments, setActiveAssignments] = useState(0);
	const [isCheckingAssignments, setIsCheckingAssignments] = useState(false);
	const [assignmentCheckError, setAssignmentCheckError] = useState<string | null>(null);

	const refreshAssignments = useCallback(async () => {
		if (!vehicleId) {
			setActiveAssignments(0);
			setAssignmentCheckError(null);
			return 0;
		}

		setIsCheckingAssignments(true);
		setAssignmentCheckError(null);

		try {
			const response = await listServices();
			const activeCount = response.data.filter(
				(service) =>
					service.vehicle.id === vehicleId &&
					(service.status === "scheduled" || service.status === "ongoing"),
			).length;

			setActiveAssignments(activeCount);
			return activeCount;
		} catch {
			setActiveAssignments(0);
			setAssignmentCheckError("Unable to verify active assignments right now.");
			return 0;
		} finally {
			setIsCheckingAssignments(false);
		}
	}, [vehicleId]);

	useEffect(() => {
		if (!vehicleId) {
			setActiveAssignments(0);
			setAssignmentCheckError(null);
			return;
		}

		refreshAssignments();
	}, [vehicleId, refreshAssignments]);

	return { activeAssignments, isCheckingAssignments, assignmentCheckError, refreshAssignments };
}
