import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ServiceForm } from "../components/ServiceForm";
import { StatusBadge } from "../components/StatusBadge";
import { ServiceDetailContent } from "../components/ServiceDetailContent";
import { ServiceTransitionModal } from "../components/ServiceTransitionModal";
import { SkeletonDetailPage } from "../../../components/Skeleton";
import { useToast } from "../../../components/useToast";
import { getServiceById, updateService } from "../../../api/services.api";
import type { Service } from "../../../types/service.types";
import type { ValidatedServiceCreateValues } from "../schemas/serviceForm.schema";
import { formatDateTime } from "../utils/serviceFormatters";
import { useServiceStatusTransition } from "../hooks/useServiceStatusTransition";
import { ServicePrintSheet } from "../components/ServicePrintSheet";

export function ServiceDetailPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const [searchParams, setSearchParams] = useSearchParams();
	const { addToast } = useToast();

	const [service, setService] = useState<Service | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(searchParams.get("mode") === "edit");
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [reloadKey, setReloadKey] = useState(0);

	const serviceId = Number(id);
	const hasValidServiceId = Number.isInteger(serviceId) && serviceId > 0;

	const {
		isTransitioning,
		transitionError,
		pendingTransition,
		handleOpenTransition,
		handleCloseTransition,
		handleConfirmTransition,
	} = useServiceStatusTransition({ service, setService, addToast });

	useEffect(() => {
		setIsEditing(searchParams.get("mode") === "edit");
	}, [searchParams]);

	useEffect(() => {
		if (!hasValidServiceId) {
			setIsLoading(false);
			setErrorMessage("Invalid service ID.");
			setService(null);
			return;
		}

		let isMounted = true;

		const loadService = async () => {
			try {
				setIsLoading(true);
				setErrorMessage(null);

				const response = await getServiceById(serviceId);

				if (!isMounted) {
					return;
				}

				setService(response.data);
			} catch (error) {
				if (!isMounted) {
					return;
				}

				const message = error instanceof Error ? error.message : "Unable to load service details.";
				setErrorMessage(message);
				addToast(message, "error");
				setService(null);
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadService();

		return () => {
			isMounted = false;
		};
	}, [addToast, hasValidServiceId, reloadKey, serviceId]);

	const handleRetryLoad = () => {
		if (!hasValidServiceId) {
			return;
		}

		setReloadKey((value) => value + 1);
	};

	const isEditLocked = service?.status === "completed" || service?.status === "cancelled";

	const beginEdit = () => {
		if (isEditLocked) {
			addToast("Completed or cancelled services cannot be edited.", "info");
			return;
		}

		const next = new URLSearchParams(searchParams);
		next.set("mode", "edit");
		setSearchParams(next);
	};

	const exitEdit = () => {
		const next = new URLSearchParams(searchParams);
		next.delete("mode");
		setSearchParams(next);
	};

	const handleSave = async (values: ValidatedServiceCreateValues) => {
		if (!service) {
			return;
		}

		setIsSaving(true);

		try {
			const response = await updateService({
				id: service.id,
				...values,
			});

			setService(response.data);
			exitEdit();
			addToast("Service updated successfully.", "success");
		} catch (error) {
			addToast("Unable to save service updates.", "error");
			throw error;
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return <SkeletonDetailPage />;
	}

	if (errorMessage || !service) {
		return (
			<section className="space-y-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 shadow-sm">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Service Detail</h2>
				<p className="text-sm text-red-700 dark:text-red-400">{errorMessage ?? "Service not found."}</p>
				<div className="flex gap-3">
					<button
						type="button"
						onClick={handleRetryLoad}
						disabled={!hasValidServiceId}
						className="inline-flex items-center rounded-md border border-red-300 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Retry
					</button>
					<Link
						to="/services"
						className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
					>
						Back to services
					</Link>
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-6">
			<div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
				<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
					<div className="space-y-2">
						<div className="flex flex-wrap items-center gap-2 sm:gap-3">
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white wrap-break-word">{service.description}</h1>
							<StatusBadge status={service.status} />
						</div>
						<p className="text-sm text-gray-600 dark:text-gray-400">Scheduled for {formatDateTime(service.scheduledAt)}</p>
						<p className="text-sm text-gray-600 dark:text-gray-400">Type: {service.type}</p>
					</div>

					<div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
						<button
							type="button"
							onClick={() => navigate("/services")}
							className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 sm:w-auto"
						>
							Back
						</button>

						{isEditing ? (
							<button
								type="button"
								onClick={exitEdit}
								className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 sm:w-auto"
							>
								Cancel edit
							</button>
						) : (
							<button
								type="button"
								onClick={beginEdit}
								disabled={isEditLocked || isTransitioning}
								className="w-full rounded-md border border-blue-300 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
							>
								Edit
							</button>
						)}

						<button
							type="button"
							onClick={() => window.print()}
							className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 sm:w-auto"
						>
							Print / Export PDF
						</button>
					</div>
				</div>

				{transitionError ? (
					<div className="mt-4 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
						{transitionError}
					</div>
				) : null}
			</div>

			{isEditing ? (
				<ServiceForm
					mode="edit"
					initialData={service}
					onSubmit={handleSave}
					submitLabel="Save changes"
					isSubmitting={isSaving}
				/>
			) : (
				<ServiceDetailContent
					service={service}
					isTransitioning={isTransitioning}
					onTransitionClick={handleOpenTransition}
				/>
			)}

			{pendingTransition ? (
				<ServiceTransitionModal
					pendingTransition={pendingTransition}
					currentStatus={service.status}
					isTransitioning={isTransitioning}
					transitionError={transitionError}
					onConfirm={handleConfirmTransition}
					onClose={handleCloseTransition}
				/>
			) : null}

			<ServicePrintSheet service={service} />
		</section>
	);
}



