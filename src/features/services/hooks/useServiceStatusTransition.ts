/** Hook managing service status transitions (scheduled → ongoing → completed, or cancellation). Validates allowed transitions and calls the API. */
import { useEffect, useState } from "react";
import { ALLOWED_TRANSITIONS } from "../../../constants/serviceStatuses";
import { setServiceStatus, updateService } from "../../../api/services.api";
import { buildCancellationNotes } from "../utils/serviceFormatters";
import type { Service, ServiceStatus } from "../../../types/service.types";

// Coordinates transition side effects, enforcing allowed status changes before persistence.

type UseServiceStatusTransitionOptions = {
	service: Service | null;
	setService: React.Dispatch<React.SetStateAction<Service | null>>;
	addToast: (message: string, type: "success" | "error" | "info") => void;
};

export function useServiceStatusTransition({
	service,
	setService,
	addToast,
}: UseServiceStatusTransitionOptions) {
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [transitionError, setTransitionError] = useState<string | null>(null);
	const [pendingTransition, setPendingTransition] = useState<ServiceStatus | null>(null);

	const isTransitionAllowed = (nextStatus: ServiceStatus): boolean => {
		if (!service) {
			return false;
		}

		return ALLOWED_TRANSITIONS[service.status].includes(nextStatus);
	};

	const handleOpenTransition = (nextStatus: ServiceStatus) => {
		if (isTransitioning) {
			return;
		}

		if (!isTransitionAllowed(nextStatus)) {
			setTransitionError(`Transition from ${service?.status ?? "unknown"} to ${nextStatus} is not allowed.`);
			return;
		}

		setTransitionError(null);
		setPendingTransition(nextStatus);
	};

	const handleCloseTransition = () => {
		setPendingTransition(null);
	};

	useEffect(() => {
		if (!pendingTransition) {
			return;
		}

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !isTransitioning) {
				handleCloseTransition();
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [isTransitioning, pendingTransition]);

	const handleConfirmTransition = async (cancellationReason: string) => {
		if (!service || !pendingTransition) {
			return;
		}

		const transitionTarget = pendingTransition;
		const cancellationReasonValue = cancellationReason.trim();

		if (!isTransitionAllowed(transitionTarget)) {
			setTransitionError(`Transition from ${service.status} to ${transitionTarget} is not allowed.`);
			return;
		}

		if (transitionTarget === "cancelled" && cancellationReasonValue.length === 0) {
			setTransitionError("Please provide a cancellation reason before confirming.");
			return;
		}

		setIsTransitioning(true);
		setTransitionError(null);

		const previousService = service;
		setService((current) => current ? { ...current, status: transitionTarget } : current);

		try {
			const statusResponse = await setServiceStatus(service.id, transitionTarget);
			let updatedService = statusResponse.data;

			if (transitionTarget === "cancelled") {
				const notes = buildCancellationNotes(statusResponse.data.notes, cancellationReasonValue);

				try {
					const notesResponse = await updateService({ id: service.id, notes });
					updatedService = notesResponse.data;
				} catch {
					setService(statusResponse.data);
					handleCloseTransition();
					setTransitionError("Status changed, but cancellation reason could not be saved.");
					addToast("Status changed, but cancellation reason could not be saved.", "error");
					return;
				}
			}

			setService(updatedService);
			handleCloseTransition();
			addToast(`Status changed to ${transitionTarget}.`, "success");
		} catch (error) {
			setService(previousService);
			setTransitionError(error instanceof Error ? error.message : "Unable to update service status.");
			addToast("Status update failed. Changes reverted.", "error");
		} finally {
			setIsTransitioning(false);
		}
	};

	return {
		isTransitioning,
		transitionError,
		pendingTransition,
		handleOpenTransition,
		handleCloseTransition,
		handleConfirmTransition,
	};
}



