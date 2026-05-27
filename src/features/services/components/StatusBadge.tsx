import type { ServiceStatus } from "../../../types/service.types";

const statusStyles: Record<ServiceStatus, string> = {
  scheduled: 'bg-status-scheduled-light text-status-scheduled-dark',
  ongoing:   'bg-status-ongoing-light text-status-ongoing-dark',
  completed: 'bg-status-completed-light text-status-completed-dark',
  cancelled: 'bg-status-cancelled-light text-status-cancelled-dark',
}

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



