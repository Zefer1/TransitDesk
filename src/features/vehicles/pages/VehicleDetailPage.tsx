/**
 * VehicleDetailPage.tsx
 *
 * The main detail page for a single vehicle. It supports three modes:
 *
 *   1. View mode (default): shows the vehicle's info in read-only cards
 *   2. Inline edit mode: swaps the view for the VehicleForm so users can
 *      edit without leaving the page
 *   3. Delete flow: opens a confirmation modal, but first checks whether
 *      the vehicle has any active service assignments (scheduled or ongoing).
 *      If it does, deletion is blocked to prevent breaking live services.
 *
 * This page composes several custom hooks:
 *   - useLoadVehicle:        fetches the vehicle data by ID
 *   - useVehicleAssignments: checks for active service assignments
 *   - useSaveVehicle:        handles the update API call
 */
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../../components/useToast";
import { APP_ROUTES } from "../../../constants/routes";
import { VehicleForm } from "../components/VehicleForm";
import { VehicleDetailContent } from "../components/VehicleDetailContent";
import { EntityHeaderActions } from "../../../components/EntityHeaderActions";
import { EntityDeleteModal } from "../../../components/EntityDeleteModal";
import { EditSectionLayout } from "../../../components/EditSectionLayout";
import { deleteVehicle } from "../../../api/vehicles.api";
import type { ValidatedVehicleUpdateValues } from "../schemas/vehicleForm.schema";
import { useLoadVehicle } from "../hooks/useLoadVehicle";
import { useVehicleAssignments } from "../hooks/useVehicleAssignments";
import { useSaveVehicle } from "../hooks/useSaveVehicle";


export function VehicleDetailPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { addToast } = useToast();
	const [isEditing, setIsEditing] = useState(false);
	const [isShowingDeleteConfirm, setIsShowingDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Load the vehicle, check its assignments, and prepare the save function
	const vehicleId = Number(id);
	const { vehicle, setVehicle, isLoading, errorMessage, reload } = useLoadVehicle(vehicleId);
	const { activeAssignments, isCheckingAssignments, assignmentCheckError, refreshAssignments } = useVehicleAssignments(vehicle?.id ?? null);
	const { isSaving, saveVehicle } = useSaveVehicle();

	// While the vehicle data is being fetched, show a placeholder skeleton
	if (isLoading) {
		return (
			<section className="space-y-6" aria-busy="true" aria-live="polite">
				<span className="sr-only">Loading vehicle details</span>
				<div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow">
					<div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
					<div className="mt-4 h-4 w-32 animate-pulse rounded bg-gray-200" />
				</div>
			</section>
		);
	}

	// If fetching failed or the vehicle was not found, show an error with a retry button
	if (errorMessage || !vehicle) {
		return (
			<section className="space-y-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 shadow">
				<h2 className="text-xl font-bold text-gray-900 dark:text-white">Vehicle Details</h2>
				<p className="text-sm text-red-700 dark:text-red-400">{errorMessage || "Vehicle not found."}</p>
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

	// Inline edit mode reuses shared form validation + payload shaping.
	if (isEditing) {
		return (
			<EditSectionLayout title="Edit Vehicle" description="Update vehicle information.">
				<VehicleForm
					initialData={vehicle}
					onSubmit={async (values) => {
						await saveVehicle(
							values as ValidatedVehicleUpdateValues,
							(updatedVehicle) => {
								setVehicle(updatedVehicle);
								setIsEditing(false);
								addToast("Vehicle updated successfully", "success");
							},
							(message) => addToast(message, "error"),
						);
					}}
					submitLabel="Update Vehicle"
					isSubmitting={isSaving}
					mode="edit"
					cancelTo={`/vehicles/${vehicle.id}`}
				/>
			</EditSectionLayout>
		);
	}

	// Final deletion guard: always re-check live assignments before delete.
	const handleDelete = async () => {
		if (assignmentCheckError) {
			addToast("Please retry assignment check before deleting this vehicle.", "error");
			return;
		}

		setIsDeleting(true);
		try {
			const latestAssignments = await refreshAssignments(vehicle.id);

			if (latestAssignments > 0) {
				addToast("Cannot delete vehicle while it has active service assignments.", "error");
				return;
			}

			await deleteVehicle(vehicle.id);
			addToast("Vehicle deleted successfully", "success");
			setIsShowingDeleteConfirm(false);
			navigate(APP_ROUTES.vehicles);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete vehicle";
			addToast(message, "error");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<section className="space-y-6">
			<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">{vehicle.licensePlate}</h1>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Fleet vehicle profile and configuration</p>
				</div>

				<EntityHeaderActions
					entityLabel="Vehicle"
					onEdit={() => setIsEditing(true)}
					onOpenDeleteConfirm={() => setIsShowingDeleteConfirm(true)}
					isCheckingAssignments={isCheckingAssignments}
					activeAssignments={activeAssignments}
					assignmentCheckError={assignmentCheckError}
				/>
			</div>

			{assignmentCheckError ? (
				<div className="rounded-md border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 text-sm text-yellow-700">
					Unable to verify active assignments. Please refresh and try again before deleting.
				</div>
			) : null}

			<VehicleDetailContent vehicle={vehicle} />

			<div className="flex gap-3">
				<Link
					to={APP_ROUTES.vehicles}
					className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700"
				>
					Back to Vehicles
				</Link>
			</div>

			<EntityDeleteModal
				isOpen={isShowingDeleteConfirm}
				entityLabel="Vehicle"
				entityName={vehicle.licensePlate}
				activeAssignments={activeAssignments}
				assignmentCheckError={assignmentCheckError}
				isDeleting={isDeleting}
				onCancel={() => setIsShowingDeleteConfirm(false)}
				onConfirm={handleDelete}
			/>
		</section>
	);
}



