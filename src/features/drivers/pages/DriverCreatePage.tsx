import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../components/useToast";
import { APP_ROUTES } from "../../../constants/routes";
import { DriverForm } from "../components/DriverForm";
import { createDriver } from "../../../api/drivers.api";
import type { ValidatedDriverCreateValues, ValidatedDriverUpdateValues } from "../schemas/driverForm.schema";

export function DriverCreatePage() {
	const navigate = useNavigate();
	const { addToast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(values: ValidatedDriverCreateValues | ValidatedDriverUpdateValues) {
		setIsSubmitting(true);
		setError(null);
		try {
			const response = await createDriver(values as ValidatedDriverCreateValues);
			navigate(`/drivers/${response.data.id}`);
			addToast("Driver created successfully", "success");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to create driver. Please try again.";
			setError(message);
			addToast(message, "error");
			setIsSubmitting(false);
		}
	}

	return (
		<section className="space-y-6">
			<div className="space-y-2">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Driver</h1>
				<p className="text-gray-600 dark:text-gray-400">Add a new driver to your team.</p>
			</div>

			{error && (
				<div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400" role="alert">
					{error}
				</div>
			)}

			<div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
				<DriverForm
					onSubmit={handleSubmit}
					submitLabel="Create Driver"
					isSubmitting={isSubmitting}
					mode="create"
					cancelTo={APP_ROUTES.drivers}
				/>
			</div>
		</section>
	);
}
