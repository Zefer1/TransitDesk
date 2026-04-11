/**
 * GuideDetailPage.tsx
 *
 * Shows everything about a single guide. This page has three possible states:
 *   1. View mode (default) -- displays read-only guide info via GuideDetailContent
 *   2. Edit mode -- swaps to the GuideForm so the user can update fields inline
 *   3. Delete flow -- opens a confirmation modal, then deletes if safe to do so
 *
 * Before a guide can be deleted, the page checks whether the guide is assigned
 * to any active services (scheduled or ongoing). If they are, deletion is blocked
 * and the user sees a warning. This is the "assignment guardrail" pattern used
 * across the app for vehicles, drivers, and guides.
 */
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../../components/useToast";
import { APP_ROUTES } from "../../../constants/routes";
import { deleteGuide } from "../../../api/guides.api";
import type { ValidatedGuideUpdateValues } from "../schemas/guideForm.schema";
import { GuideDetailContent } from "../components/GuideDetailContent";
import { EntityDeleteModal } from "../../../components/EntityDeleteModal";
import { EditSectionLayout } from "../../../components/EditSectionLayout";
import { GuideForm } from "../components/GuideForm";
import { EntityHeaderActions } from "../../../components/EntityHeaderActions";
import { useLoadGuide } from "../hooks/useLoadGuide";
import { useGuideAssignments } from "../hooks/useGuideAssignments";
import { useSaveGuide } from "../hooks/useSaveGuide";

export function GuideDetailPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { addToast } = useToast();
	const [isEditing, setIsEditing] = useState(false);
	const [isShowingDeleteConfirm, setIsShowingDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// These three hooks split responsibilities cleanly:
	//   useLoadGuide        -- fetches the guide's data by ID
	//   useGuideAssignments -- counts active services this guide is assigned to
	//   useSaveGuide        -- handles the API call when saving edits
	const guideId = Number(id);
	const { guide, setGuide, isLoading, errorMessage, reload } = useLoadGuide(guideId);
	const { activeAssignments, isCheckingAssignments, assignmentCheckError, refreshAssignments } = useGuideAssignments(guide?.id ?? null);
	const { isSaving, saveGuide } = useSaveGuide();

	// While the guide data is loading, show a skeleton placeholder to avoid layout jumps.
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

	// If the fetch failed or the guide was not found, show an error with a retry button.
	if (errorMessage || !guide) {
		return (
			<section className="space-y-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 shadow">
				<h2 className="text-xl font-bold text-gray-900 dark:text-white">Guide Details</h2>
				<p className="text-sm text-red-700 dark:text-red-400">{errorMessage || "Guide not found."}</p>
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

	// When the user clicks "Edit", we swap the read-only view for the full GuideForm.
	if (isEditing) {
		return (
			<EditSectionLayout title="Edit Guide" description="Update guide information.">
				<GuideForm
					initialData={guide}
					onSubmit={async (values) => {
						await saveGuide(
							values as ValidatedGuideUpdateValues,
							(updatedGuide) => {
								setGuide(updatedGuide);
								setIsEditing(false);
								addToast("Guide updated successfully", "success");
							},
							(message) => addToast(message, "error"),
						);
					}}
					submitLabel="Update Guide"
					isSubmitting={isSaving}
					mode="edit"
					cancelTo={`/guides/${guide.id}`}
				/>
			</EditSectionLayout>
		);
	}

	/**
	 * Handles the actual deletion after the user confirms in the modal.
	 * Safety steps:
	 *   1. Re-checks active assignments right before deleting (they may have changed)
	 *   2. If the guide still has active assignments, blocks the delete and warns the user
	 *   3. Otherwise, calls the API to delete and navigates back to the guides list
	 */
	const handleDelete = async () => {
		if (assignmentCheckError) {
			addToast("Please retry assignment check before deleting this guide.", "error");
			return;
		}

		setIsDeleting(true);
		try {
			const latestAssignments = await refreshAssignments(guide.id);

			if (latestAssignments > 0) {
				addToast("Cannot delete guide while it has active service assignments.", "error");
				return;
			}

			await deleteGuide(guide.id);
			addToast("Guide deleted successfully", "success");
			setIsShowingDeleteConfirm(false);
			navigate(APP_ROUTES.guides);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete guide";
			addToast(message, "error");
		} finally {
			setIsDeleting(false);
		}
	};

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



