import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useToast } from "../../../components/useToast";
import { APP_ROUTES } from "../../../constants/routes";
import { VehicleForm } from "../components/VehicleForm";
import { VehicleDetailContent } from "../components/VehicleDetailContent";
import { EntityHeaderActions } from "../../../components/EntityHeaderActions";
import { EntityDeleteModal } from "../../../components/EntityDeleteModal";
import { InUseBadge } from "../../../components/InUseBadge";
import { extractApiError } from "../../../lib/apiError";
import { EditSectionLayout } from "../../../components/EditSectionLayout";
import { getVehicleById, updateVehicle, deleteVehicle } from "../../../api/vehicles.api";
import { listServices } from "../../../api/services.api";
import type { Vehicle } from "../../../types/service.types";
import type { ValidatedVehicleUpdateValues } from "../schemas/vehicleForm.schema";

export function VehicleDetailPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const [searchParams, setSearchParams] = useSearchParams();
	const { addToast } = useToast();

	const [vehicle, setVehicle] = useState<Vehicle | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [reloadKey, setReloadKey] = useState(0);

	const isEditing = searchParams.get("mode") === "edit";
	const [isSaving, setIsSaving] = useState(false);

	const beginEdit = () => {
		const next = new URLSearchParams(searchParams);
		next.set("mode", "edit");
		setSearchParams(next);
	};

	const exitEdit = () => {
		const next = new URLSearchParams(searchParams);
		next.delete("mode");
		setSearchParams(next);
	};

	const [isShowingDeleteConfirm, setIsShowingDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const [activeAssignments, setActiveAssignments] = useState(0);
	const [ongoingServiceId, setOngoingServiceId] = useState<number | null>(null);
	const [isCheckingAssignments, setIsCheckingAssignments] = useState(false);
	const [assignmentCheckError, setAssignmentCheckError] = useState<string | null>(null);

	const vehicleId = Number(id);
	const hasValidId = Number.isInteger(vehicleId) && vehicleId > 0;

	useEffect(() => {
		if (!hasValidId) {
			setIsLoading(false);
			setErrorMessage("Invalid vehicle ID.");
			return;
		}

		let cancelled = false;

		async function fetchVehicle() {
			try {
				setIsLoading(true);
				setErrorMessage(null);
				const response = await getVehicleById(vehicleId);
				if (!cancelled) setVehicle(response.data);
			} catch (error) {
				if (!cancelled) {
					const message = error instanceof Error ? error.message : "Unable to load vehicle.";
					setErrorMessage(message);
				}
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		}

		fetchVehicle();
		return () => { cancelled = true; };
	}, [vehicleId, hasValidId, reloadKey]);

	useEffect(() => {
		if (!vehicle) return;

		let cancelled = false;

		async function checkAssignments() {
			setIsCheckingAssignments(true);
			setAssignmentCheckError(null);
			try {
				const response = await listServices();
				if (!cancelled) {
					const forThisVehicle = response.data.filter(s => s.vehicle.id === vehicle!.id);
					const count = forThisVehicle.filter(
						s => s.status === "scheduled" || s.status === "ongoing"
					).length;
					setActiveAssignments(count);
					const ongoing = forThisVehicle.find(s => s.status === "ongoing");
					setOngoingServiceId(ongoing ? ongoing.id : null);
				}
			} catch {
				if (!cancelled) setAssignmentCheckError("Unable to verify active assignments right now.");
			} finally {
				if (!cancelled) setIsCheckingAssignments(false);
			}
		}

		checkAssignments();
		return () => { cancelled = true; };
	}, [vehicle]);

	async function handleSave(values: ValidatedVehicleUpdateValues) {
		setIsSaving(true);
		try {
			const response = await updateVehicle(values);
			setVehicle(response.data);
			exitEdit();
			addToast("Vehicle updated successfully", "success");
		} catch (error) {
			addToast(extractApiError(error, "Failed to update vehicle"), "error");
		} finally {
			setIsSaving(false);
		}
	}

	async function handleDelete() {
		if (assignmentCheckError) {
			addToast("Please retry assignment check before deleting this vehicle.", "error");
			return;
		}

		setIsDeleting(true);
		try {
			const response = await listServices();
			const count = response.data.filter(
				s => s.vehicle.id === vehicle!.id &&
				(s.status === "scheduled" || s.status === "ongoing")
			).length;

			if (count > 0) {
				setActiveAssignments(count);
				addToast("Cannot delete vehicle while it has active service assignments.", "error");
				return;
			}

			await deleteVehicle(vehicle!.id);
			addToast("Vehicle deleted successfully", "success");
			navigate(APP_ROUTES.vehicles);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete vehicle";
			addToast(message, "error");
		} finally {
			setIsDeleting(false);
		}
	}

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

	if (errorMessage || !vehicle) {
		return (
			<section className="space-y-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 shadow">
				<h2 className="text-xl font-bold text-gray-900 dark:text-white">Vehicle Details</h2>
				<p className="text-sm text-red-700 dark:text-red-400">{errorMessage || "Vehicle not found."}</p>
				<div>
					<button
						type="button"
						onClick={() => setReloadKey(k => k + 1)}
						className="rounded-md border border-red-300 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 transition hover:bg-red-100"
					>
						Retry
					</button>
				</div>
			</section>
		);
	}

	if (isEditing) {
		return (
			<EditSectionLayout title="Edit Vehicle" description="Update vehicle information.">
				<VehicleForm
					initialData={vehicle}
					onSubmit={async (values) => handleSave(values as ValidatedVehicleUpdateValues)}
					submitLabel="Update Vehicle"
					isSubmitting={isSaving}
					mode="edit"
					onCancel={exitEdit}
				/>
			</EditSectionLayout>
		);
	}

	return (
		<section className="space-y-6">
			<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">{vehicle.licensePlate}</h1>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Fleet vehicle profile and configuration</p>
					{!isCheckingAssignments ? (
						<div className="mt-2">
							<InUseBadge serviceId={ongoingServiceId} />
						</div>
					) : null}
				</div>
				<EntityHeaderActions
					entityLabel="Vehicle"
					onEdit={beginEdit}
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
