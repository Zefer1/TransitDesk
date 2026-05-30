import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../../components/useToast";
import { APP_ROUTES } from "../../../constants/routes";
import { DriverForm } from "../components/DriverForm";
import { DriverDetailContent } from "../components/DriverDetailContent";
import { EntityHeaderActions } from "../../../components/EntityHeaderActions";
import { EntityDeleteModal } from "../../../components/EntityDeleteModal";
import { EditSectionLayout } from "../../../components/EditSectionLayout";
import { InUseBadge } from "../../../components/InUseBadge";
import { getDriverById, updateDriver, deleteDriver } from "../../../api/drivers.api";
import { listServices } from "../../../api/services.api";
import type { Driver } from "../../../types/service.types";
import type { ValidatedDriverUpdateValues } from "../schemas/driverForm.schema";

export function DriverDetailPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { addToast } = useToast();

	const [driver, setDriver] = useState<Driver | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [reloadKey, setReloadKey] = useState(0);

	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const [isShowingDeleteConfirm, setIsShowingDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const [activeAssignments, setActiveAssignments] = useState(0);
	const [ongoingServiceId, setOngoingServiceId] = useState<number | null>(null);
	const [isCheckingAssignments, setIsCheckingAssignments] = useState(false);
	const [assignmentCheckError, setAssignmentCheckError] = useState<string | null>(null);

	const driverId = Number(id);
	const hasValidId = Number.isInteger(driverId) && driverId > 0;

	useEffect(() => {
		if (!hasValidId) {
			setIsLoading(false);
			setErrorMessage("Invalid driver ID.");
			return;
		}

		let cancelled = false;

		async function fetchDriver() {
			try {
				setIsLoading(true);
				setErrorMessage(null);
				const response = await getDriverById(driverId);
				if (!cancelled) setDriver(response.data);
			} catch (error) {
				if (!cancelled) {
					const message = error instanceof Error ? error.message : "Unable to load driver.";
					setErrorMessage(message);
				}
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		}

		fetchDriver();
		return () => { cancelled = true; };
	}, [driverId, hasValidId, reloadKey]);

	useEffect(() => {
		if (!driver) return;

		let cancelled = false;

		async function checkAssignments() {
			setIsCheckingAssignments(true);
			setAssignmentCheckError(null);
			try {
				const response = await listServices();
				if (!cancelled) {
					const forThisDriver = response.data.filter(s => s.driver.id === driver!.id);
					const count = forThisDriver.filter(
						s => s.status === "scheduled" || s.status === "ongoing"
					).length;
					setActiveAssignments(count);
					const ongoing = forThisDriver.find(s => s.status === "ongoing");
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
	}, [driver]);

	async function handleSave(values: ValidatedDriverUpdateValues) {
		setIsSaving(true);
		try {
			const response = await updateDriver(values);
			setDriver(response.data);
			setIsEditing(false);
			addToast("Driver updated successfully", "success");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update driver";
			addToast(message, "error");
		} finally {
			setIsSaving(false);
		}
	}

	async function handleDelete() {
		if (assignmentCheckError) {
			addToast("Please retry assignment check before deleting this driver.", "error");
			return;
		}

		setIsDeleting(true);
		try {
			const response = await listServices();
			const count = response.data.filter(
				s => s.driver.id === driver!.id &&
				(s.status === "scheduled" || s.status === "ongoing")
			).length;

			if (count > 0) {
				setActiveAssignments(count);
				addToast("Cannot delete driver while it has active service assignments.", "error");
				return;
			}

			await deleteDriver(driver!.id);
			addToast("Driver deleted successfully", "success");
			navigate(APP_ROUTES.drivers);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete driver";
			addToast(message, "error");
		} finally {
			setIsDeleting(false);
		}
	}

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

	if (errorMessage || !driver) {
		return (
			<section className="space-y-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 shadow">
				<h2 className="text-xl font-bold text-gray-900 dark:text-white">Driver Details</h2>
				<p className="text-sm text-red-700 dark:text-red-400">{errorMessage || "Driver not found."}</p>
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
			<EditSectionLayout title="Edit Driver" description="Update driver information.">
				<DriverForm
					initialData={driver}
					onSubmit={async (values) => handleSave(values as ValidatedDriverUpdateValues)}
					submitLabel="Update Driver"
					isSubmitting={isSaving}
					mode="edit"
					cancelTo={`/drivers/${driver.id}`}
				/>
			</EditSectionLayout>
		);
	}

	return (
		<section className="space-y-6">
			<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">{driver.name}</h1>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Driver profile and assignment information</p>
					{!isCheckingAssignments ? (
						<div className="mt-2">
							<InUseBadge serviceId={ongoingServiceId} activeLabel="Active" />
						</div>
					) : null}
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
