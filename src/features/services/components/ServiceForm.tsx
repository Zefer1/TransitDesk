/**
 * ServiceForm.tsx
 *
 * The main "orchestrator" component for creating or editing a service.
 * Think of it as the brain of the form -- it does NOT render individual fields itself.
 * Instead, it:
 *
 * 1. Sets up the form state (via useServiceFormState hook)
 * 2. Loads the dropdown options for vehicles, drivers, and guides (via useServiceAssignmentOptions)
 * 3. Handles form submission: validates with Zod, checks status transition rules, then calls the API
 * 4. Delegates the actual field rendering to section components (ServiceDetailsSection, VehicleSection, etc.)
 *
 * It supports two modes:
 * - "create" mode: empty form, all fields editable
 * - "edit" mode: pre-filled from existing service data, locked if the service is completed/cancelled
 */
import { useMemo, useState } from "react";
import { canTransition } from "../../../constants/serviceStatuses";
import { SERVICE_STATUSES } from "../../../types/service.types";
import {
	DRIVER_LICENSES,
	GENDERS,
	SERVICE_TYPES,
	VEHICLE_TYPES,
	serviceCreateSchema,
} from "../schemas/serviceForm.schema";
import type { ServiceFormErrors, ServiceFormMode, ServiceFormProps } from "./serviceForm.types";
import { useServiceFormState } from "../hooks/useServiceFormState";
import {
	useServiceAssignmentOptions,
	useStaleServiceAssignmentWarnings,
} from "../hooks/useServiceAssignmentOptions";
import {
	buildInitialServiceFormState,
	createServiceFormPayload,
	mapServiceFormZodErrors,
} from "../hooks/useServiceFormPayload";
import {
	ServiceDetailsSection,
	VehicleSection,
	DriverSection,
	GuideSection,
} from "./ServiceFormSections";

export function ServiceForm({
	initialData,
	onSubmit,
	submitLabel = "Save service",
	isSubmitting = false,
	validationSchema = serviceCreateSchema,
	mode,
}: ServiceFormProps) {
	// Figure out whether we are creating or editing, and whether the form should be locked.
	// A service that is already "completed" or "cancelled" cannot be changed -- its fields
	// become read-only. We use the ORIGINAL status (not one the user might pick in the form)
	// to decide this, so changing the status dropdown does not unlock the form.
	const resolvedMode: ServiceFormMode = mode ?? (initialData ? "edit" : "create");
	const initialStatus = initialData?.status ?? "scheduled";
	const isLockedByStatus =
		resolvedMode === "edit" && (initialStatus === "completed" || initialStatus === "cancelled");

	// Build the starting values for the form once. useMemo ensures we do not rebuild
	// (and reset the form) on every parent re-render -- only when initialData actually changes.
	const initialState = useMemo(() => buildInitialServiceFormState(initialData), [initialData]);

	const {
		formState,
		setFormState,
		updateStop,
		addStop,
		removeStop,
		updateGuideLanguage,
		addGuideLanguage,
		removeGuideLanguage,
		applySelectedVehicle: applyVehicle,
		applySelectedDriver: applyDriver,
		applySelectedGuide: applyGuide,
	} = useServiceFormState(initialState);

	const [errors, setErrors] = useState<ServiceFormErrors>({});
	const [submitError, setSubmitError] = useState<string | null>(null);

	// Fetch the lists of available vehicles, drivers, and guides for the dropdown selectors.
	// These are loaded once when the form mounts and shared across all sections.
	const { vehicleOptions, driverOptions, guideOptions, isLoadingAssignments, assignmentError } =
		useServiceAssignmentOptions();

	// In edit mode, warn the user if the originally assigned vehicle/driver/guide no longer
	// exists in the current options (e.g. it was deleted since the service was created).
	const { staleVehicleWarning, staleDriverWarning, staleGuideWarning } =
		useStaleServiceAssignmentWarnings({
			initialVehicleId: initialData?.vehicle?.id,
			initialDriverId: initialData?.driver?.id,
			initialGuideId: initialData?.guide?.id,
			vehicleOptions,
			driverOptions,
			guideOptions,
		});

	// Transform the raw entity arrays into the { value, label } format that our
	// dropdown components expect. useMemo avoids re-creating these on every render.
	const vehicleSelectOptions = useMemo(
		() =>
			vehicleOptions.map((vehicle) => ({
				value: String(vehicle.id),
				label: `${vehicle.licensePlate} - ${vehicle.brand} ${vehicle.model} - ${vehicle.passengerCapacity} seats`,
			})),
		[vehicleOptions],
	);

	const driverSelectOptions = useMemo(
		() =>
			driverOptions.map((driver) => ({
				value: String(driver.id),
				label: `${driver.name} - License ${driver.license} - ${driver.entitledToDrive}`,
			})),
		[driverOptions],
	);

	const guideSelectOptions = useMemo(
		() =>
			guideOptions.map((guide) => ({
				value: String(guide.id),
				label: `${guide.name} (${guide.gender})${
					guide.languages?.length ? ` - ${guide.languages.join(", ")}` : ""
				}`,
			})),
		[guideOptions],
	);

	// When editing, the status dropdown only shows statuses that are valid transitions
	// from the original status. For example, a "scheduled" service can become "ongoing"
	// or "cancelled", but not jump straight to "completed".
	const statusOptions = useMemo(
		() =>
			SERVICE_STATUSES.filter(
				(status) => resolvedMode !== "edit" || status === initialStatus || canTransition(initialStatus, status),
			),
		[initialStatus, resolvedMode],
	);

	// When the user starts typing in a field that had a validation error, clear that
	// error immediately so they get instant feedback that their correction was noticed.
	const clearFieldError = (path: string) => {
		setErrors((current) => {
			if (!current[path]) {
				return current;
			}

			const nextErrors = { ...current };
			delete nextErrors[path];
			return nextErrors;
		});
	};

	// When the user picks a vehicle/driver/guide from the dropdown, fill in all the related
	// fields automatically and clear any validation errors on those fields.
	const applySelectedVehicle = (vehicleId: string) => {
		applyVehicle(vehicleId, vehicleOptions);
		clearFieldError("vehicle");
		clearFieldError("vehicle.id");
	};

	const applySelectedDriver = (driverId: string) => {
		applyDriver(driverId, driverOptions);
		clearFieldError("driver");
		clearFieldError("driver.id");
	};

	const applySelectedGuide = (guideId: string) => {
		applyGuide(guideId, guideOptions);
		clearFieldError("guide");
		clearFieldError("guide.id");
	};

	// The submit handler runs through several safety checks in order:
	// 1. Block submission if the service is locked (completed/cancelled)
	// 2. Validate all fields against the Zod schema
	// 3. In edit mode, verify the status change is an allowed transition
	// 4. If everything passes, call the parent's onSubmit callback (which hits the API)
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSubmitError(null);

		if (isLockedByStatus) {
			setSubmitError("Completed or cancelled services are locked and cannot be edited.");
			return;
		}

		const result = validationSchema.safeParse(createServiceFormPayload(formState));

		if (!result.success) {
			setErrors(mapServiceFormZodErrors(result.error));
			return;
		}

		if (
			resolvedMode === "edit" &&
			result.data.status !== initialStatus &&
			!canTransition(initialStatus, result.data.status)
		) {
			setSubmitError(`Transition from ${initialStatus} to ${result.data.status} is not allowed.`);
			return;
		}

		setErrors({});

		try {
			await onSubmit(result.data);
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : "Unable to save service.");
		}
	};

	return (
		<form className="space-y-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm" onSubmit={handleSubmit}>
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Service form</h2>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
						Capture service details, transport assignment, staffing, and passenger planning in one place.
					</p>
				</div>
				<button
					type="submit"
					disabled={isSubmitting || isLockedByStatus}
					className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
				>
					{isLockedByStatus ? "Locked" : isSubmitting ? "Saving..." : submitLabel}
				</button>
			</div>

			{isLockedByStatus ? (
				<div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
					This service is {initialStatus} and its fields are read-only.
				</div>
			) : null}

			{submitError ? (
				<div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
					{submitError}
				</div>
			) : null}

			<fieldset disabled={isLockedByStatus} className="space-y-6 disabled:opacity-90">
				<ServiceDetailsSection
					formState={formState}
					errors={errors}
					statusOptions={statusOptions}
					serviceTypes={SERVICE_TYPES}
					setFormState={setFormState}
					clearFieldError={clearFieldError}
					addStop={addStop}
					updateStop={updateStop}
					removeStop={removeStop}
				/>

				<VehicleSection
					assignmentError={assignmentError}
					staleVehicleWarning={staleVehicleWarning}
					formState={formState}
					errors={errors}
					isLoadingAssignments={isLoadingAssignments}
					vehicleSelectOptions={vehicleSelectOptions}
					serviceTypes={SERVICE_TYPES}
					vehicleTypes={VEHICLE_TYPES}
					setFormState={setFormState}
					clearFieldError={clearFieldError}
					applySelectedVehicle={applySelectedVehicle}
				/>

				<DriverSection
					staleDriverWarning={staleDriverWarning}
					formState={formState}
					errors={errors}
					isLoadingAssignments={isLoadingAssignments}
					driverSelectOptions={driverSelectOptions}
					vehicleTypes={VEHICLE_TYPES}
					genders={GENDERS}
					driverLicenses={DRIVER_LICENSES}
					setFormState={setFormState}
					clearFieldError={clearFieldError}
					applySelectedDriver={applySelectedDriver}
				/>

				<GuideSection
					staleGuideWarning={staleGuideWarning}
					assignmentError={assignmentError}
					formState={formState}
					errors={errors}
					isLoadingAssignments={isLoadingAssignments}
					guideSelectOptions={guideSelectOptions}
					genders={GENDERS}
					setFormState={setFormState}
					clearFieldError={clearFieldError}
					applySelectedGuide={applySelectedGuide}
					updateGuideLanguage={updateGuideLanguage}
					addGuideLanguage={addGuideLanguage}
					removeGuideLanguage={removeGuideLanguage}
				/>
			</fieldset>
		</form>
	);
}



