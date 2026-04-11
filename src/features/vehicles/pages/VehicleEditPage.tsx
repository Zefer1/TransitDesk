/** Standalone edit page for a vehicle. Loads by ID and submits updates via the API. */
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../../components/useToast";
import { VehicleForm } from "../components/VehicleForm";
import { EditSectionLayout } from "../../../components/EditSectionLayout";
import type { ValidatedVehicleUpdateValues } from "../schemas/vehicleForm.schema";
import { useLoadVehicle } from "../hooks/useLoadVehicle";
import { useSaveVehicle } from "../hooks/useSaveVehicle";


// Loads target vehicle, reuses shared form, and commits validated updates back to the API.

export function VehicleEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { addToast } = useToast();

	const vehicleId = Number(id);
	const { vehicle, isLoading, errorMessage } = useLoadVehicle(vehicleId);
	const { isSaving, saveVehicle } = useSaveVehicle();

	if (isLoading) {
		return (
			<section className="space-y-6" aria-busy="true" aria-live="polite">
				<span className="sr-only">Loading vehicle</span>
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
				<h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Vehicle</h2>
				<p className="text-sm text-red-700 dark:text-red-400">{errorMessage || "Vehicle not found."}</p>
			</section>
		);
	}

	return (
		<EditSectionLayout title="Edit Vehicle" description="Update vehicle information.">
			<VehicleForm
				initialData={vehicle}
				onSubmit={async (values) => {
					await saveVehicle(
						values as ValidatedVehicleUpdateValues,
						(updatedVehicle) => {
							navigate(`/vehicles/${updatedVehicle.id}`);
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



