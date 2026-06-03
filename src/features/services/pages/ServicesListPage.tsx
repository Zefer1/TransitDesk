import { useEffect, useState } from "react";
import { SERVICE_STATUSES } from "../../../types/service.types";
import { APP_ROUTES } from "../../../constants/routes";
import { CrudListLayout } from "../../../components/CrudListLayout";
import { EmptyState } from "../../../components/EmptyState";
import { Modal } from "../../../components/Modal";
import { useToast } from "../../../components/useToast";
import { useServiceFilters } from "../../../hooks/useServiceFilters";
import { deleteService, listServices } from "../../../api/services.api";
import type { Service } from "../../../types/service.types";
import { ServiceTable } from "../components/ServiceTable";

export function ServicesListPage() {
	const [services, setServices] = useState<Service[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [reloadKey, setReloadKey] = useState(0);
	const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const { addToast } = useToast();

	const {
		filters,
		filteredServices,
		hasActiveFilters,
		setStatusFilter,
		setSearchFilter,
		setDateRange,
		resetFilters,
	} = useServiceFilters(services);

	useEffect(() => {
		let isMounted = true;

		const loadServices = async () => {
			try {
				setIsLoading(true);
				setErrorMessage(null);

				const response = await listServices();

				if (!isMounted) {
					return;
				}

				setServices(response.data);
			} catch (error) {
				if (!isMounted) {
					return;
				}

				const message = error instanceof Error ? error.message : "Unable to load services.";
				setErrorMessage(message);
				addToast(message, "error");
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadServices();

		return () => {
			isMounted = false;
		};
	}, [addToast, reloadKey]);

	const openDelete = (serviceId: number) => {
		const service = services.find((item) => item.id === serviceId);
		if (service) {
			setDeleteTarget(service);
		}
	};

	const confirmDelete = async () => {
		if (!deleteTarget) {
			return;
		}

		setIsDeleting(true);
		try {
			setErrorMessage(null);
			await deleteService(deleteTarget.id);
			setServices((currentServices) => currentServices.filter((service) => service.id !== deleteTarget.id));
			addToast("Service deleted successfully", "success");
			setDeleteTarget(null);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unable to delete service.";
			setErrorMessage(message);
			addToast(message, "error");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleRetry = () => {
		setReloadKey((value) => value + 1);
	};

	const filtersNode = (
		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
			<label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 xl:col-span-1">
				Search description
				<input
					type="search"
					value={filters.search}
					onChange={(event) => setSearchFilter(event.target.value)}
					placeholder="Search services"
					className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				/>
			</label>

			<label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 xl:col-span-1">
				Status
				<select
					value={filters.status}
					onChange={(event) => setStatusFilter(event.target.value as typeof filters.status)}
					className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				>
					<option value="all">All statuses</option>
					{SERVICE_STATUSES.map((status) => (
						<option key={status} value={status}>
							{status.charAt(0).toUpperCase() + status.slice(1)}
						</option>
					))}
				</select>
			</label>

			<label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 xl:col-span-1">
				Start date
				<input
					type="date"
					value={filters.startDate}
					onChange={(event) => setDateRange(event.target.value, filters.endDate)}
					className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				/>
			</label>

			<label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 xl:col-span-1">
				End date
				<input
					type="date"
					value={filters.endDate}
					onChange={(event) => setDateRange(filters.startDate, event.target.value)}
					className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				/>
			</label>

			<div className="flex items-end xl:col-span-1">
				<button
					type="button"
					onClick={resetFilters}
					disabled={!hasActiveFilters}
					className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Reset filters
				</button>
			</div>
		</div>
	);

	return (
		<>
			<CrudListLayout
				title="Services"
				description="Browse scheduled routes, monitor status, and open any service for details."
				primaryAction={{ label: "Create Service", to: APP_ROUTES.newService }}
				isLoading={isLoading}
				errorMessage={errorMessage}
				onRetry={handleRetry}
				loadingLabel="Loading services"
				filters={filtersNode}
				isEmpty={services.length === 0}
				emptyState={{
					title: "No services yet",
					description: "Create your first service to start managing routes.",
					action: { label: "Create Service", to: APP_ROUTES.newService },
				}}
			>
				{filteredServices.length === 0 ? (
					<EmptyState
						title="No matching services"
						description="No services match your current filters. Try broadening your search criteria."
						action={{ label: "Reset filters", onClick: resetFilters }}
					/>
				) : (
					<ServiceTable services={filteredServices} onDelete={openDelete} />
				)}
			</CrudListLayout>

			<Modal isOpen={deleteTarget !== null} title="Delete service" onClose={() => setDeleteTarget(null)}>
				<p className="text-sm text-gray-600 dark:text-gray-400">
					Are you sure you want to delete <strong>{deleteTarget?.description}</strong>? This action cannot be undone.
				</p>
				<div className="mt-6 flex justify-end gap-2">
					<button
						type="button"
						onClick={() => setDeleteTarget(null)}
						disabled={isDeleting}
						className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={() => void confirmDelete()}
						disabled={isDeleting}
						className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isDeleting ? "Deleting..." : "Delete service"}
					</button>
				</div>
			</Modal>
		</>
	);
}



