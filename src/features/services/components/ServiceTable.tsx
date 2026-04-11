/**
 * ServiceTable.tsx
 *
 * Displays a list of services in two layouts:
 * - On mobile: a vertical card grid (each service is a clickable card)
 * - On desktop: a traditional data table with columns for description, type, status, etc.
 *
 * Each service row/card includes View, Edit, and Delete action buttons.
 * Clicking anywhere on a row (except the action buttons) navigates to the detail page.
 */
import type { Service } from "../../../types/service.types";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
import { EmptyState } from "../../../components/EmptyState";

type Props = {
  services: Service[];
  onDelete?: (serviceId: number) => void;
};

// Convert an ISO date string to a human-readable local date/time for display in the table.
function formatScheduledAt(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return parsed.toLocaleString();
}

export function ServiceTable({ services, onDelete }: Props) {
  const navigate = useNavigate();

  const goToDetail = (serviceId: number) => {
    navigate(`/services/${serviceId}`);
  };

  const goToEdit = (serviceId: number) => {
    navigate(`/services/${serviceId}?mode=edit`);
  };

  // The action buttons (View, Edit, Delete) are shared between mobile cards and desktop rows.
  // stopPropagation prevents the row/card click handler from firing when a button is clicked.
  const renderActions = (serviceId: number) => (
    <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => goToDetail(serviceId)}
        aria-label={`View service ${serviceId}`}
      >
        View
      </button>
      <button
        type="button"
        className="rounded-md border border-blue-300 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
        onClick={() => goToEdit(serviceId)}
        aria-label={`Edit service ${serviceId}`}
      >
        Edit
      </button>
      <button
        type="button"
        className="rounded-md border border-red-300 dark:border-red-600 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => onDelete?.(serviceId)}
        disabled={!onDelete}
        aria-label={`Delete service ${serviceId}`}
      >
        Delete
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {services.length === 0 ? (
        <EmptyState
          title="No services found"
          description="Try changing the current filters or create a new service."
        />
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {services.map((service) => (
              <article
                key={service.id}
                className="cursor-pointer rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm transition hover:border-blue-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus-within:border-blue-300"
                role="button"
                tabIndex={0}
                aria-label={`Open details for ${service.description}`}
                onClick={() => goToDetail(service.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    goToDetail(service.id);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{service.description}</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{service.type}</p>
                  </div>
                  <StatusBadge status={service.status} />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Scheduled</dt>
                    <dd className="mt-1 text-gray-800">{formatScheduledAt(service.scheduledAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Passengers</dt>
                    <dd className="mt-1 text-gray-800">{service.passengerQuantity ?? 0}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  {renderActions(service.id)}
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow md:block">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Description</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Type</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Status</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Scheduled</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Passengers</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {services.map((service) => (
                  <tr
                    key={service.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 focus-within:bg-gray-50"
                    role="button"
                    tabIndex={0}
                    aria-label={`Open details for ${service.description}`}
                    onClick={() => goToDetail(service.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        goToDetail(service.id);
                      }
                    }}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{service.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{service.type}</td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={service.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{formatScheduledAt(service.scheduledAt)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{service.passengerQuantity ?? 0}</td>
                    <td className="px-4 py-3 text-sm">{renderActions(service.id)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}



