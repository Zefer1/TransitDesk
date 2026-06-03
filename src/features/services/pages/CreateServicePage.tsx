import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ServiceForm } from "../components/ServiceForm";
import { useToast } from "../../../components/useToast";
import { createService } from "../../../api/services.api";
import { extractApiError } from "../../../lib/apiError";
import type { ValidatedServiceCreateValues } from "../schemas/serviceForm.schema";

export function CreateServicePage() {
	const navigate = useNavigate();
	const { addToast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(values: ValidatedServiceCreateValues) {
		setIsSubmitting(true);
		setError(null);
		try {
			const response = await createService(values);
			navigate(`/services/${response.data.id}`);
			addToast("Service created successfully", "success");
		} catch (err) {
			const message = extractApiError(err, "Failed to create service. Please try again.");
			setError(message);
			addToast(message, "error");
			setIsSubmitting(false);
		}
	}

	return (
		<div>
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Service</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">Fill in the details to schedule a new service.</p>
			</div>

			{error && (
				<div
					className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md"
					role="alert"
				>
					{error}
				</div>
			)}

			<div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow sm:p-6">
				<ServiceForm
					onSubmit={handleSubmit}
					submitLabel="Create Service"
					isSubmitting={isSubmitting}
					onCancel={() => navigate("/services")}
				/>
			</div>
		</div>
	);
}




