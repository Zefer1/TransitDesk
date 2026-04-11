import { type ServiceStatus } from "../types/service.types";

/**
 * Service status transition matrix.
 *
 * Defines which status transitions are valid:
 *   scheduled → ongoing | cancelled
 *   ongoing   → completed | cancelled
 *   completed → (terminal, no further transitions)
 *   cancelled → (terminal, no further transitions)
 *
 * Cancellation is allowed from `scheduled` or `ongoing` only.
 * Never allow arbitrary status jumps - always validate with `canTransition()`.
 */
export const ALLOWED_TRANSITIONS: Record<ServiceStatus, ServiceStatus[]> = {
	scheduled: ["ongoing", "cancelled"],
	ongoing: ["cancelled", "completed"],
	cancelled: [],
	completed: [],
};

/** Returns `true` if transitioning from `from` to `to` is a valid status change. */
export function canTransition(from: ServiceStatus, to: ServiceStatus): boolean {
	return ALLOWED_TRANSITIONS[from].includes(to);
}



