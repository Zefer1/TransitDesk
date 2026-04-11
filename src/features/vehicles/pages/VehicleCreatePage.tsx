/**
 * VehicleCreatePage.tsx
 *
 * The page where users add a new vehicle to the fleet.
 * It renders the shared VehicleForm in "create" mode and handles what
 * happens after the form is submitted:
 *   - On success: saves the vehicle via the API, shows a success toast,
 *     and redirects to the new vehicle's detail page
 *   - On failure: shows an error message both inline and as a toast
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../components/useToast";
import { APP_ROUTES } from "../../../constants/routes";
import { VehicleForm } from "../components/VehicleForm";
import { createVehicle } from "../../../api/vehicles.api";
import type { ValidatedVehicleCreateValues, ValidatedVehicleUpdateValues } from "../schemas/vehicleForm.schema";

export function VehicleCreatePage() {
	const navigate = useNavigate();
	const { addToast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	/** Send the validated form data to the API, then navigate to the new vehicle's page */
	async function handleSubmit(values: ValidatedVehicleCreateValues | ValidatedVehicleUpdateValues) {
		setIsSubmitting(true);
		setError(null);
		try {
			const response = await createVehicle(values as ValidatedVehicleCreateValues);
			navigate(`/vehicles/${response.data.id}`);
			addToast("Vehicle created successfully", "success");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to create vehicle. Please try again.";
			setError(message);
			addToast(message, "error");
			setIsSubmitting(false);
		}
	}

	return (
		<section className="space-y-6">
			<div className="space-y-2">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Vehicle</h1>
				<p className="text-gray-600 dark:text-gray-400">Add a new vehicle to your fleet.</p>
			</div>

			{error && (
				<div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400" role="alert">
					{error}
				</div>
			)}

			<div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
				<VehicleForm
					onSubmit={handleSubmit}
					submitLabel="Create Vehicle"
					isSubmitting={isSubmitting}
					mode="create"
					cancelTo={APP_ROUTES.vehicles}
				/>
			</div>
		</section>
	);
}



