/**
 * GuideEditPage.tsx
 *
 * A standalone page for editing an existing guide. It loads the guide by its
 * URL parameter ID, then renders the shared GuideForm in "edit" mode.
 *
 * This page is used when the user navigates to /guides/:id/edit directly.
 * (The detail page also has an inline edit mode that uses the same GuideForm,
 * but this page provides a dedicated URL for editing.)
 *
 * On successful save, the user is redirected to the guide's detail page.
 */
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../../components/useToast";
import type { ValidatedGuideUpdateValues } from "../schemas/guideForm.schema";
import { EditSectionLayout } from "../../../components/EditSectionLayout";
import { GuideForm } from "../components/GuideForm";
import { useLoadGuide } from "../hooks/useLoadGuide";
import { useSaveGuide } from "../hooks/useSaveGuide";

export function GuideEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { addToast } = useToast();

	const guideId = Number(id);
	const { guide, isLoading, errorMessage } = useLoadGuide(guideId);
	const { isSaving, saveGuide } = useSaveGuide();

	if (isLoading) {
		return (
			<section className="space-y-6" aria-busy="true" aria-live="polite">
				<span className="sr-only">Loading guide</span>
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
				<h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Guide</h2>
				<p className="text-sm text-red-700 dark:text-red-400">{errorMessage || "Guide not found."}</p>
			</section>
		);
	}

	return (
		<EditSectionLayout title="Edit Guide" description="Update guide information.">
			<GuideForm
				initialData={guide}
				onSubmit={async (values) => {
					await saveGuide(
						values as ValidatedGuideUpdateValues,
						(updatedGuide) => {
							navigate(`/guides/${updatedGuide.id}`);
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



