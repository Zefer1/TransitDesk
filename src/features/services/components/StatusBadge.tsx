/**
 * StatusBadge.tsx
 *
 * A small colored pill that shows the current status of a service
 * (e.g. "Scheduled", "Ongoing", "Completed", "Cancelled").
 *
 * Each status gets its own background and text color, defined using custom
 * CSS theme tokens in src/index.css (like --color-status-scheduled-light).
 * This keeps the color palette centralized and easy to update.
 */
import type { ServiceStatus } from "../../../types/service.types";

// Maps each status to its Tailwind color classes (background + text).
const statusStyles: Record<ServiceStatus, string> = {
  scheduled: 'bg-status-scheduled-light text-status-scheduled-dark',
  ongoing:   'bg-status-ongoing-light text-status-ongoing-dark',
  completed: 'bg-status-completed-light text-status-completed-dark',
  cancelled: 'bg-status-cancelled-light text-status-cancelled-dark',
}

// Human-readable labels for each status (used as both display text and aria labels).
const statusLabels: Record<ServiceStatus, string> = {
  scheduled: "Scheduled",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: ServiceStatus }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full font-semibold text-sm ${statusStyles[status]}`}
      aria-label={`Service status: ${statusLabels[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}



