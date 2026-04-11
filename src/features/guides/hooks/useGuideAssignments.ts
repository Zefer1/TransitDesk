/**
 * useGuideAssignments.ts
 *
 * Checks how many active services a guide is currently assigned to.
 * An "active" service is one with a status of "scheduled" or "ongoing".
 *
 * This is used as a safety check before deleting a guide -- if a guide
 * has active assignments, the app blocks deletion to avoid orphaning
 * services that depend on that guide.
 *
 * The hook fetches ALL services from the API and filters client-side.
 * (In a production app with many services, you would add a server-side
 * filter endpoint instead.)
 */
import { useCallback, useEffect, useState } from "react";
import { listServices } from "../../../api/services.api";

export function useGuideAssignments(guideId: number | null) {
	const [activeAssignments, setActiveAssignments] = useState(0);
	const [isCheckingAssignments, setIsCheckingAssignments] = useState(false);
	const [assignmentCheckError, setAssignmentCheckError] = useState<string | null>(null);

	// Fetches all services, then counts how many are assigned to this guide
	// and have an active status. Can be called manually (e.g. right before delete).
	const refreshAssignments = useCallback(async () => {
		if (!guideId) {
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
					service.guide?.id === guideId &&
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
	}, [guideId]);

	// Automatically check assignments when the guide ID becomes available.
	useEffect(() => {
		if (!guideId) {
			setActiveAssignments(0);
			setAssignmentCheckError(null);
			return;
		}

		refreshAssignments();
	}, [guideId, refreshAssignments]);

	return { activeAssignments, isCheckingAssignments, assignmentCheckError, refreshAssignments };
}
