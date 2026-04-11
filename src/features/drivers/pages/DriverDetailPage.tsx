/**
 * DriverDetailPage.tsx
 *
 * The detail page for a single driver. It supports three main interactions:
 *
 *   1. VIEW mode (default) -- shows read-only driver info via DriverDetailContent.
 *   2. EDIT mode -- swaps the read-only view for a DriverForm so the user can
 *      update the driver inline without navigating to a separate page.
 *   3. DELETE -- opens a confirmation modal. Before actually deleting, the page
 *      re-checks whether the driver has active service assignments (scheduled or
 *      ongoing). If they do, deletion is blocked to prevent orphaned services.
 *
 * Three custom hooks split the logic into focused pieces:
 *   - useLoadDriver:        fetches the driver by ID from the API.
 *   - useSaveDriver:        handles the update API call.
 *   - useDriverAssignments: checks for active services assigned to this driver.
 */
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../../components/useToast";
import { APP_ROUTES } from "../../../constants/routes";
import { DriverForm } from "../components/DriverForm";
import { DriverDetailContent } from "../components/DriverDetailContent";
import { EntityHeaderActions } from "../../../components/EntityHeaderActions";
import { EntityDeleteModal } from "../../../components/EntityDeleteModal";
import { EditSectionLayout } from "../../../components/EditSectionLayout";
import { deleteDriver } from "../../../api/drivers.api";
import type { ValidatedDriverUpdateValues } from "../schemas/driverForm.schema";
import { useLoadDriver } from "../hooks/useLoadDriver";
import { useDriverAssignments } from "../hooks/useDriverAssignments";
import { useSaveDriver } from "../hooks/useSaveDriver";

export function DriverDetailPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { addToast } = useToast();
	const [isEditing, setIsEditing] = useState(false);
	const [isShowingDeleteConfirm, setIsShowingDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Convert the URL param from string to number so we can pass it to hooks and API calls
	const driverId = Number(id);
	const { driver, setDriver, isLoading, errorMessage, reload } = useLoadDriver(driverId);
	const { activeAssignments, isCheckingAssignments, assignmentCheckError, refreshAssignments } = useDriverAssignments(driver?.id ?? null);
	const { isSaving, saveDriver } = useSaveDriver();

	// While the API is loading, show a skeleton placeholder to avoid layout jumps
	if (isLoading) {
		return (
			<section className="space-y-6" aria-busy="true" aria-live="polite">
				<span className="sr-only">Loading driver details</span>
				<div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow">
					<div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
					<div className="mt-4 h-4 w-32 animate-pulse rounded bg-gray-200" />
				</div>
			</section>
		);
	}

	// If the fetch failed or the driver was not found, show an error with a retry button
	if (errorMessage || !driver) {
		return (
			<section className="space-y-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 shadow">
				<h2 className="text-xl font-bold text-gray-900 dark:text-white">Driver Details</h2>
				<p className="text-sm text-red-700 dark:text-red-400">{errorMessage || "Driver not found."}</p>
				<div>
					<button
						type="button"
						onClick={reload}
						className="rounded-md border border-red-300 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 transition hover:bg-red-100"
					>
						Retry
					</button>
				</div>
			</section>
		);
	}

	// When the user clicks "Edit", swap the read-only view for an editable form
	if (isEditing) {
		return (
			<EditSectionLayout title="Edit Driver" description="Update driver information.">
				<DriverForm
					initialData={driver}
					onSubmit={async (values) => {
						await saveDriver(
							values as ValidatedDriverUpdateValues,
							(updatedDriver) => {
								setDriver(updatedDriver);
								setIsEditing(false);
								addToast("Driver updated successfully", "success");
							},
							(message) => addToast(message, "error"),
						);
					}}
					submitLabel="Update Driver"
					isSubmitting={isSaving}
					mode="edit"
					cancelTo={`/drivers/${driver.id}`}
				/>
			</EditSectionLayout>
		);
	}

	/**
	 * Handles driver deletion. Before deleting, it does a fresh check for active
	 * service assignments. This matters because another user could have assigned
	 * this driver to a service between the time the page loaded and now.
	 * If the driver still has active assignments, the delete is blocked.
	 */
	const handleDelete = async () => {
		if (assignmentCheckError) {
			addToast("Please retry assignment check before deleting this driver.", "error");
			return;
		}

		setIsDeleting(true);
		try {
			const latestAssignments = await refreshAssignments(driver.id);

			if (latestAssignments > 0) {
				addToast("Cannot delete driver while it has active service assignments.", "error");
				return;
			}

			await deleteDriver(driver.id);
			addToast("Driver deleted successfully", "success");
			setIsShowingDeleteConfirm(false);
			navigate(APP_ROUTES.drivers);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete driver";
			addToast(message, "error");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<section className="space-y-6">
			<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">{driver.name}</h1>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Driver profile and assignment information</p>
				</div>

				<EntityHeaderActions
					entityLabel="Driver"
					onEdit={() => setIsEditing(true)}
					onOpenDeleteConfirm={() => setIsShowingDeleteConfirm(true)}
					isCheckingAssignments={isCheckingAssignments}
					activeAssignments={activeAssignments}
					assignmentCheckError={assignmentCheckError}
				/>
			</div>

			<DriverDetailContent driver={driver} />

			<div className="flex gap-3">
				<Link
					to={APP_ROUTES.drivers}
					className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700"
				>
					Back to Drivers
				</Link>
			</div>

			<EntityDeleteModal
				isOpen={isShowingDeleteConfirm}
				entityLabel="Driver"
				entityName={driver.name}
				activeAssignments={activeAssignments}
				assignmentCheckError={assignmentCheckError}
				isDeleting={isDeleting}
				onCancel={() => setIsShowingDeleteConfirm(false)}
				onConfirm={handleDelete}
			/>
		</section>
	);
}



