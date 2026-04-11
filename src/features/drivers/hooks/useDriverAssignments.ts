/**
 * useDriverAssignments.ts
 *
 * A custom React hook that checks whether a driver currently has active service
 * assignments. "Active" means services with a status of "scheduled" or "ongoing"
 * (i.e., not yet completed or cancelled).
 *
 * This is primarily used as a safety check before deleting a driver. If the driver
 * is assigned to any live services, the app blocks deletion to avoid leaving
 * services without a driver.
 *
 * How it works:
 *   - It fetches ALL services from the API, then filters client-side for ones
 *     that belong to this driver and are still active.
 *   - It runs automatically when the driverId changes, and can also be triggered
 *     manually via refreshAssignments (used right before a delete attempt).
 */
import { useCallback, useEffect, useState } from "react";
import { listServices } from "../../../api/services.api";

export function useDriverAssignments(driverId: number | null) {
	const [activeAssignments, setActiveAssignments] = useState(0);
	const [isCheckingAssignments, setIsCheckingAssignments] = useState(false);
	const [assignmentCheckError, setAssignmentCheckError] = useState<string | null>(null);

	/**
	 * Fetches all services and counts how many are actively assigned to this driver.
	 * Returns the count so callers can use it directly (e.g. in the delete handler).
	 */
	const refreshAssignments = useCallback(async () => {
		if (!driverId) {
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
					service.driver.id === driverId &&
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
	}, [driverId]);

	// Run the assignment check automatically whenever the driver ID changes
	useEffect(() => {
		if (!driverId) {
			setActiveAssignments(0);
			setAssignmentCheckError(null);
			return;
		}

		refreshAssignments();
	}, [driverId, refreshAssignments]);

	return { activeAssignments, isCheckingAssignments, assignmentCheckError, refreshAssignments };
}
