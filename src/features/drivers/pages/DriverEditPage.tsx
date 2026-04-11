/**
 * DriverEditPage.tsx
 *
 * A standalone page for editing an existing driver. This is an alternative to
 * the inline edit mode available on the DriverDetailPage. Both approaches use
 * the same DriverForm component and useSaveDriver hook, so the behavior is
 * identical -- only the navigation flow differs.
 *
 * Flow: load driver by ID from URL -> show form pre-filled with current data
 *       -> on save, redirect to the driver's detail page.
 */
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../../components/useToast";
import { DriverForm } from "../components/DriverForm";
import { EditSectionLayout } from "../../../components/EditSectionLayout";
import type { ValidatedDriverUpdateValues } from "../schemas/driverForm.schema";
import { useLoadDriver } from "../hooks/useLoadDriver";
import { useSaveDriver } from "../hooks/useSaveDriver";

export function DriverEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { addToast } = useToast();

	const driverId = Number(id);
	const { driver, isLoading, errorMessage } = useLoadDriver(driverId);
	const { isSaving, saveDriver } = useSaveDriver();

	if (isLoading) {
		return (
			<section className="space-y-6" aria-busy="true" aria-live="polite">
				<span className="sr-only">Loading driver details</span>
				<div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow">
					<div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
				</div>
			</section>
		);
	}

	if (errorMessage || !driver) {
		return (
			<section className="space-y-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 shadow">
				<h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Driver</h2>
				<p className="text-sm text-red-700 dark:text-red-400">{errorMessage || "Driver not found."}</p>
			</section>
		);
	}

	return (
		<EditSectionLayout title="Edit Driver" description="Update driver information.">
			<DriverForm
				initialData={driver}
				onSubmit={async (values) => {
					await saveDriver(
						values as ValidatedDriverUpdateValues,
						(updatedDriver) => {
							navigate(`/drivers/${updatedDriver.id}`);
							addToast("Driver updated successfully", "success");
						},
						(message) => addToast(message, "error"),
					);
				}}
				submitLabel="Save Changes"
				isSubmitting={isSaving}
				mode="edit"
				cancelTo={`/drivers/${driver.id}`}
			/>
		</EditSectionLayout>
	);
}



