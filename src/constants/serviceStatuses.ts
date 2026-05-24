import { type ServiceStatus } from "../types/service.types";

export const ALLOWED_TRANSITIONS: Record<ServiceStatus, ServiceStatus[]> = {
	scheduled: ["ongoing", "cancelled"],
	ongoing: ["cancelled", "completed"],
	cancelled: [],
	completed: [],
};

export function canTransition(from: ServiceStatus, to: ServiceStatus): boolean {
	return ALLOWED_TRANSITIONS[from].includes(to);
}
