/**
 * GuideCreatePage.tsx
 *
 * The page where a user creates a brand-new guide. It renders the shared
 * GuideForm in "create" mode. When the form is submitted:
 *   1. The validated data is sent to the API (createGuide)
 *   2. On success, the user is redirected to the new guide's detail page
 *   3. On failure, an error message is shown both inline and as a toast
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../components/useToast";
import { APP_ROUTES } from "../../../constants/routes";
import { createGuide } from "../../../api/guides.api";
import type { ValidatedGuideCreateValues, ValidatedGuideUpdateValues } from "../schemas/guideForm.schema";
import { GuideForm } from "../components/GuideForm";

export function GuideCreatePage() {
	const navigate = useNavigate();
	const { addToast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Sends the new guide data to the API, shows a toast, and navigates on success.
	async function handleSubmit(values: ValidatedGuideCreateValues | ValidatedGuideUpdateValues) {
		setIsSubmitting(true);
		setError(null);
		try {
			const response = await createGuide(values as ValidatedGuideCreateValues);
			navigate(`/guides/${response.data.id}`);
			addToast("Guide created successfully", "success");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to create guide. Please try again.";
			setError(message);
			addToast(message, "error");
			setIsSubmitting(false);
		}
	}

	return (
		<section className="space-y-6">
			<div className="space-y-2">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Guide</h1>
				<p className="text-gray-600 dark:text-gray-400">Add a new guide to your team.</p>
			</div>

			{error && (
				<div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400" role="alert">
					{error}
				</div>
			)}

			<div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
				<GuideForm
					onSubmit={handleSubmit}
					submitLabel="Create Guide"
					isSubmitting={isSubmitting}
					mode="create"
					cancelTo={APP_ROUTES.guides}
				/>
			</div>
		</section>
	);
}



