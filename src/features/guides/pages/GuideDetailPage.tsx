import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../../components/useToast";
import { APP_ROUTES } from "../../../constants/routes";
import { getGuideById, updateGuide, deleteGuide } from "../../../api/guides.api";
import { listServices } from "../../../api/services.api";
import type { Guide } from "../../../types/service.types";
import type { ValidatedGuideUpdateValues } from "../schemas/guideForm.schema";
import { GuideDetailContent } from "../components/GuideDetailContent";
import { EntityDeleteModal } from "../../../components/EntityDeleteModal";
import { EditSectionLayout } from "../../../components/EditSectionLayout";
import { GuideForm } from "../components/GuideForm";
import { EntityHeaderActions } from "../../../components/EntityHeaderActions";

export function GuideDetailPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { addToast } = useToast();

	const [guide, setGuide] = useState<Guide | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [reloadKey, setReloadKey] = useState(0);

	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const [isShowingDeleteConfirm, setIsShowingDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const [activeAssignments, setActiveAssignments] = useState(0);
	const [isCheckingAssignments, setIsCheckingAssignments] = useState(false);
	const [assignmentCheckError, setAssignmentCheckError] = useState<string | null>(null);

	const guideId = Number(id);
	const hasValidId = Number.isInteger(guideId) && guideId > 0;

	useEffect(() => {
		if (!hasValidId) {
			setIsLoading(false);
			setErrorMessage("Invalid guide ID.");
			return;
		}

		let cancelled = false;

		async function fetchGuide() {
			try {
				setIsLoading(true);
				setErrorMessage(null);
				const response = await getGuideById(guideId);
				if (!cancelled) setGuide(response.data);
			} catch (error) {
				if (!cancelled) {
					const message = error instanceof Error ? error.message : "Unable to load guide.";
					setErrorMessage(message);
				}
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		}

		fetchGuide();
		return () => { cancelled = true; };
	}, [guideId, hasValidId, reloadKey]);

	useEffect(() => {
		if (!guide) return;

		let cancelled = false;

		async function checkAssignments() {
			setIsCheckingAssignments(true);
			setAssignmentCheckError(null);
			try {
				const response = await listServices();
				if (!cancelled) {
					const count = response.data.filter(
						s => s.guide?.id === guide!.id &&
						(s.status === "scheduled" || s.status === "ongoing")
					).length;
					setActiveAssignments(count);
				}
			} catch {
				if (!cancelled) setAssignmentCheckError("Unable to verify active assignments right now.");
			} finally {
				if (!cancelled) setIsCheckingAssignments(false);
			}
		}

		checkAssignments();
		return () => { cancelled = true; };
	}, [guide]);

	async function handleSave(values: ValidatedGuideUpdateValues) {
		setIsSaving(true);
		try {
			const response = await updateGuide(values);
			setGuide(response.data);
			setIsEditing(false);
			addToast("Guide updated successfully", "success");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update guide";
			addToast(message, "error");
		} finally {
			setIsSaving(false);
		}
	}

	async function handleDelete() {
		if (assignmentCheckError) {
			addToast("Please retry assignment check before deleting this guide.", "error");
			return;
		}

		setIsDeleting(true);
		try {
			const response = await listServices();
			const count = response.data.filter(
				s => s.guide?.id === guide!.id &&
				(s.status === "scheduled" || s.status === "ongoing")
			).length;

			if (count > 0) {
				setActiveAssignments(count);
				addToast("Cannot delete guide while it has active service assignments.", "error");
				return;
			}

			await deleteGuide(guide!.id);
			addToast("Guide deleted successfully", "success");
			navigate(APP_ROUTES.guides);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete guide";
			addToast(message, "error");
		} finally {
			setIsDeleting(false);
		}
	}

	if (isLoading) {
		return (
			<section className="space-y-6" aria-busy="true" aria-live="polite">
				<span className="sr-only">Loading guide details</span>
				<div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow">
					<div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
					<div className="mt-4 h-4 w-32 animate-pulse rounded bg-gray-200" />
				</div>
			</section>
		);
	}

	if (errorMessage || !guide) {
		return (
			<section className="space-y-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 shadow">
				<h2 className="text-xl font-bold text-gray-900 dark:text-white">Guide Details</h2>
				<p className="text-sm text-red-700 dark:text-red-400">{errorMessage || "Guide not found."}</p>
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
			<EditSectionLayout title="Edit Guide" description="Update guide information.">
				<GuideForm
					initialData={guide}
					onSubmit={async (values) => handleSave(values as ValidatedGuideUpdateValues)}
					submitLabel="Update Guide"
					isSubmitting={isSaving}
					mode="edit"
					cancelTo={`/guides/${guide.id}`}
				/>
			</EditSectionLayout>
		);
	}

	return (
		<section className="space-y-6">
			<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">{guide.name}</h1>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Guide profile and assignment information</p>
				</div>
				<EntityHeaderActions
					entityLabel="Guide"
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

			<GuideDetailContent
				guide={guide}
				isCheckingAssignments={isCheckingAssignments}
				activeAssignments={activeAssignments}
			/>

			<div className="flex gap-3">
				<Link
					to={APP_ROUTES.guides}
					className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700"
				>
					Back to Guides
				</Link>
			</div>

			<EntityDeleteModal
				isOpen={isShowingDeleteConfirm}
				entityLabel="Guide"
				entityName={guide.name}
				activeAssignments={activeAssignments}
				assignmentCheckError={assignmentCheckError}
				isDeleting={isDeleting}
				onCancel={() => setIsShowingDeleteConfirm(false)}
				onConfirm={handleDelete}
			/>
		</section>
	);
}
