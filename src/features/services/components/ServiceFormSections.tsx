/**
 * ServiceFormSections.tsx
 *
 * Contains the four major sections of the service form, each as its own component:
 * - ServiceDetailsSection: scheduling, route stops, passenger count, and notes
 * - VehicleSection: vehicle assignment dropdown and all vehicle detail fields
 * - DriverSection: driver assignment dropdown and driver detail fields
 * - GuideSection: optional guide assignment with language management
 *
 * Each section receives its slice of form state and error messages as props from
 * ServiceForm (the parent orchestrator). The sections use the primitive input
 * components from ServiceFormPrimitives.tsx to render actual fields.
 */
import {
	AssignmentSelectInput,
	Section,
	SelectInput,
	TextAreaInput,
	TextInput,
} from "./ServiceFormPrimitives";
import { helpTextClassName, sectionTitleClassName } from "./serviceForm.styles";
import type {
	AssignmentOption,
	DriverLicense,
	ServiceFormErrors,
	ServiceFormState,
} from "./serviceForm.types";
import type { Gender, ServiceStatus, ServiceType, VehicleType } from "../../../types/service.types";

type SetFormState = React.Dispatch<React.SetStateAction<ServiceFormState>>;

type ServiceDetailsSectionProps = {
	formState: ServiceFormState;
	errors: ServiceFormErrors;
	statusOptions: ServiceStatus[];
	serviceTypes: readonly ServiceType[];
	setFormState: SetFormState;
	clearFieldError: (path: string) => void;
	addStop: () => void;
	updateStop: (index: number, value: string) => void;
	removeStop: (index: number) => void;
};

// Renders the core service planning fields: date/time, type, status, passengers,
// distance, duration, description, agency, route stops, and free-form notes.
export function ServiceDetailsSection({
	formState,
	errors,
	statusOptions,
	serviceTypes,
	setFormState,
	clearFieldError,
	addStop,
	updateStop,
	removeStop,
}: ServiceDetailsSectionProps) {
	return (
		<Section title="Service details" description="Core scheduling, route, and passenger data.">
			{/* Top grid for required and high-signal planning fields. */}
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<TextInput
					label="Scheduled time"
					type="datetime-local"
					value={formState.scheduledAt}
					onChange={(value) => {
						setFormState((current) => ({ ...current, scheduledAt: value }));
						clearFieldError("scheduledAt");
					}}
					error={errors.scheduledAt}
				/>

				<SelectInput
					label="Service type"
					value={formState.type}
					onChange={(value) => {
						setFormState((current) => ({ ...current, type: value as ServiceType | "" }));
						clearFieldError("type");
					}}
					options={serviceTypes}
					error={errors.type}
					placeholder="Select a type"
				/>

				<SelectInput
					label="Status"
					value={formState.status}
					onChange={(value) => {
						setFormState((current) => ({ ...current, status: value as ServiceStatus }));
						clearFieldError("status");
					}}
					options={statusOptions}
					error={errors.status}
					placeholder="Select status"
				/>

				<TextInput
					label="Passenger quantity"
					type="number"
					value={formState.passengerQuantity}
					onChange={(value) => {
						setFormState((current) => ({ ...current, passengerQuantity: value }));
						clearFieldError("passengerQuantity");
					}}
					error={errors.passengerQuantity}
					placeholder="e.g. 12"
				/>

				<TextInput
					label="Distance (km)"
					type="number"
					value={formState.distanceKm}
					onChange={(value) => {
						setFormState((current) => ({ ...current, distanceKm: value }));
						clearFieldError("distanceKm");
					}}
					error={errors.distanceKm}
					placeholder="Optional"
				/>

				<TextInput
					label="Estimated duration (min)"
					type="number"
					value={formState.estimatedDurationMin}
					onChange={(value) => {
						setFormState((current) => ({ ...current, estimatedDurationMin: value }));
						clearFieldError("estimatedDurationMin");
					}}
					error={errors.estimatedDurationMin}
					placeholder="Optional"
				/>
			</div>

			{/* Secondary fields that are usually optional but useful for operations. */}
			<div className="grid gap-4 md:grid-cols-2">
				<TextInput
					label="Description"
					value={formState.description}
					onChange={(value) => {
						setFormState((current) => ({ ...current, description: value }));
						clearFieldError("description");
					}}
					error={errors.description}
					placeholder="e.g. Funchal to Santana"
				/>

				<TextInput
					label="Agency name"
					value={formState.agencyName}
					onChange={(value) => {
						setFormState((current) => ({ ...current, agencyName: value }));
						clearFieldError("agencyName");
					}}
					error={errors.agencyName}
					placeholder="Optional"
				/>
			</div>

			{/* Dynamic list: at least one stop is always kept to match schema expectations. */}
			<div className="space-y-3">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div>
						<h4 className={sectionTitleClassName()}>Stops</h4>
						<p className={helpTextClassName()}>Add the planned route in order.</p>
					</div>
					<button
						type="button"
						onClick={addStop}
						className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 sm:w-auto"
					>
						Add stop
					</button>
				</div>

				{formState.stops.map((stop, index) => (
					<div key={`stop-${index}`} className="flex flex-col gap-2 sm:flex-row sm:items-start">
						<div className="flex-1">
							<TextInput
								label={`Stop ${index + 1}`}
								value={stop}
								onChange={(value) => {
									updateStop(index, value);
									clearFieldError(`stops.${index}`);
									clearFieldError("stops");
								}}
								error={errors[`stops.${index}`] ?? (index === 0 ? errors.stops : undefined)}
								placeholder="Enter a stop or landmark"
							/>
						</div>
						<button
							type="button"
							onClick={() => removeStop(index)}
							className="self-end rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700"
						>
							Remove
						</button>
					</div>
				))}
			</div>

			{/* Free-form operator notes for this service. */}
			<TextAreaInput
				label="Notes"
				value={formState.notes}
				onChange={(value) => setFormState((current) => ({ ...current, notes: value }))}
				error={errors.notes}
				placeholder="Optional operational notes"
			/>
		</Section>
	);
}

type VehicleSectionProps = {
	assignmentError: string | null;
	staleVehicleWarning: string | null;
	formState: ServiceFormState;
	errors: ServiceFormErrors;
	isLoadingAssignments: boolean;
	vehicleSelectOptions: AssignmentOption[];
	serviceTypes: readonly ServiceType[];
	vehicleTypes: readonly VehicleType[];
	setFormState: SetFormState;
	clearFieldError: (path: string) => void;
	applySelectedVehicle: (vehicleId: string) => void;
};

// Renders the vehicle assignment section. When the user picks a vehicle from the dropdown,
// all the detail fields (plate, brand, model, etc.) are auto-filled and disabled.
// If no vehicles are available from the API, the fields become manually editable.
export function VehicleSection({
	assignmentError,
	staleVehicleWarning,
	formState,
	errors,
	isLoadingAssignments,
	vehicleSelectOptions,
	serviceTypes,
	vehicleTypes,
	setFormState,
	clearFieldError,
	applySelectedVehicle,
}: VehicleSectionProps) {
	return (
		<Section title="Vehicle" description="Vehicle assignment and operating profile.">
			{/* API assignment loading/error feedback shown above controls for visibility. */}
			{assignmentError ? (
				<div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
					{assignmentError}
				</div>
			) : null}

			{/* Warns when initial edit data references an entity that no longer exists in options. */}
			{staleVehicleWarning ? (
				<div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
					{staleVehicleWarning}
				</div>
			) : null}

			{/* Primary assignment entrypoint: selecting here hydrates all vehicle subfields. */}
			<AssignmentSelectInput
				label="Choose vehicle"
				value={formState.vehicle.id}
				onChange={applySelectedVehicle}
				options={vehicleSelectOptions}
				error={errors["vehicle.id"] ?? errors.vehicle}
				placeholder={isLoadingAssignments ? "Loading vehicles..." : "Select a vehicle"}
				disabled={isLoadingAssignments || vehicleSelectOptions.length === 0}
				helpText="Options show plate, model, and passenger capacity."
			/>

			{/* Detailed vehicle payload fields; disabled when selection comes from known options. */}
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<TextInput
					label="Vehicle ID"
					type="number"
					value={formState.vehicle.id}
					onChange={(value) => {
						setFormState((current) => ({ ...current, vehicle: { ...current.vehicle, id: value } }));
						clearFieldError("vehicle.id");
						clearFieldError("vehicle");
					}}
					error={errors["vehicle.id"] ?? errors.vehicle}
					disabled={vehicleSelectOptions.length > 0}
				/>
				<TextInput
					label="License plate"
					value={formState.vehicle.licensePlate}
					onChange={(value) => {
						setFormState((current) => ({ ...current, vehicle: { ...current.vehicle, licensePlate: value } }));
						clearFieldError("vehicle.licensePlate");
					}}
					error={errors["vehicle.licensePlate"]}
					disabled={vehicleSelectOptions.length > 0}
				/>
				<TextInput
					label="Brand"
					value={formState.vehicle.brand}
					onChange={(value) => {
						setFormState((current) => ({ ...current, vehicle: { ...current.vehicle, brand: value } }));
						clearFieldError("vehicle.brand");
					}}
					error={errors["vehicle.brand"]}
					disabled={vehicleSelectOptions.length > 0}
				/>
				<TextInput
					label="Model"
					value={formState.vehicle.model}
					onChange={(value) => {
						setFormState((current) => ({ ...current, vehicle: { ...current.vehicle, model: value } }));
						clearFieldError("vehicle.model");
					}}
					error={errors["vehicle.model"]}
					disabled={vehicleSelectOptions.length > 0}
				/>
				<TextInput
					label="Year"
					type="number"
					value={formState.vehicle.year}
					onChange={(value) => {
						setFormState((current) => ({ ...current, vehicle: { ...current.vehicle, year: value } }));
						clearFieldError("vehicle.year");
					}}
					error={errors["vehicle.year"]}
					disabled={vehicleSelectOptions.length > 0}
				/>
				<TextInput
					label="Passenger capacity"
					type="number"
					value={formState.vehicle.passengerCapacity}
					onChange={(value) => {
						setFormState((current) => ({ ...current, vehicle: { ...current.vehicle, passengerCapacity: value } }));
						clearFieldError("vehicle.passengerCapacity");
					}}
					error={errors["vehicle.passengerCapacity"]}
					disabled={vehicleSelectOptions.length > 0}
				/>
				<SelectInput
					label="Vehicle type"
					value={formState.vehicle.type}
					onChange={(value) => {
						setFormState((current) => ({ ...current, vehicle: { ...current.vehicle, type: value as VehicleType | "" } }));
						clearFieldError("vehicle.type");
					}}
					options={vehicleTypes}
					error={errors["vehicle.type"]}
					placeholder="Select a vehicle type"
					disabled={vehicleSelectOptions.length > 0}
				/>
				<TextInput
					label="Color"
					value={formState.vehicle.color}
					onChange={(value) => {
						setFormState((current) => ({ ...current, vehicle: { ...current.vehicle, color: value } }));
						clearFieldError("vehicle.color");
					}}
					error={errors["vehicle.color"]}
					disabled={vehicleSelectOptions.length > 0}
				/>
				<TextInput
					label="Registration date"
					type="date"
					value={formState.vehicle.registrationDate}
					onChange={(value) =>
						setFormState((current) => ({ ...current, vehicle: { ...current.vehicle, registrationDate: value } }))
					}
					error={errors["vehicle.registrationDate"]}
					disabled={vehicleSelectOptions.length > 0}
				/>
				<TextInput
					label="Inspection expiry"
					type="date"
					value={formState.vehicle.inspectionExpiry}
					onChange={(value) =>
						setFormState((current) => ({ ...current, vehicle: { ...current.vehicle, inspectionExpiry: value } }))
					}
					error={errors["vehicle.inspectionExpiry"]}
					disabled={vehicleSelectOptions.length > 0}
				/>
				<SelectInput
					label="Best suited for"
					value={formState.vehicle.suitedFor}
					onChange={(value) =>
						setFormState((current) => ({ ...current, vehicle: { ...current.vehicle, suitedFor: value as ServiceType | "" } }))
					}
					options={serviceTypes}
					error={errors["vehicle.suitedFor"]}
					placeholder="Optional"
					disabled={vehicleSelectOptions.length > 0}
				/>
			</div>

			<label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
				<input
					type="checkbox"
					checked={formState.vehicle.active}
					onChange={(event) =>
						setFormState((current) => ({
							...current,
							vehicle: { ...current.vehicle, active: event.target.checked },
						}))
					}
					className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
				/>
				Vehicle is active and available
			</label>

			<TextAreaInput
				label="Vehicle notes"
				value={formState.vehicle.notes}
				onChange={(value) =>
					setFormState((current) => ({ ...current, vehicle: { ...current.vehicle, notes: value } }))
				}
				error={errors["vehicle.notes"]}
				placeholder="Optional vehicle-specific notes"
			/>
		</Section>
	);
}

type DriverSectionProps = {
	staleDriverWarning: string | null;
	formState: ServiceFormState;
	errors: ServiceFormErrors;
	isLoadingAssignments: boolean;
	driverSelectOptions: AssignmentOption[];
	vehicleTypes: readonly VehicleType[];
	genders: readonly Gender[];
	driverLicenses: readonly DriverLicense[];
	setFormState: SetFormState;
	clearFieldError: (path: string) => void;
	applySelectedDriver: (driverId: string) => void;
};

export function DriverSection({
	staleDriverWarning,
	formState,
	errors,
	isLoadingAssignments,
	driverSelectOptions,
	vehicleTypes,
	genders,
	driverLicenses,
	setFormState,
	clearFieldError,
	applySelectedDriver,
}: DriverSectionProps) {
	return (
		<Section title="Driver" description="Primary assigned driver for the service.">
			{staleDriverWarning ? (
				<div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
					{staleDriverWarning}
				</div>
			) : null}

			<AssignmentSelectInput
				label="Choose driver"
				value={formState.driver.id}
				onChange={applySelectedDriver}
				options={driverSelectOptions}
				error={errors["driver.id"] ?? errors.driver}
				placeholder={isLoadingAssignments ? "Loading drivers..." : "Select a driver"}
				disabled={isLoadingAssignments || driverSelectOptions.length === 0}
				helpText="Options show driver name, license, and entitled vehicle type."
			/>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				<TextInput
					label="Driver ID"
					type="number"
					value={formState.driver.id}
					onChange={(value) => {
						setFormState((current) => ({ ...current, driver: { ...current.driver, id: value } }));
						clearFieldError("driver.id");
						clearFieldError("driver");
					}}
					error={errors["driver.id"] ?? errors.driver}
					disabled={driverSelectOptions.length > 0}
				/>
				<TextInput
					label="Driver name"
					value={formState.driver.name}
					onChange={(value) => {
						setFormState((current) => ({ ...current, driver: { ...current.driver, name: value } }));
						clearFieldError("driver.name");
					}}
					error={errors["driver.name"]}
					disabled={driverSelectOptions.length > 0}
				/>
				<TextInput
					label="Phone"
					type="tel"
					value={formState.driver.phone}
					onChange={(value) =>
						setFormState((current) => ({ ...current, driver: { ...current.driver, phone: value } }))
					}
					error={errors["driver.phone"]}
					placeholder="Optional"
					disabled={driverSelectOptions.length > 0}
				/>
				<SelectInput
					label="Gender"
					value={formState.driver.gender}
					onChange={(value) => {
						setFormState((current) => ({ ...current, driver: { ...current.driver, gender: value as Gender | "" } }));
						clearFieldError("driver.gender");
					}}
					options={genders}
					error={errors["driver.gender"]}
					placeholder="Select gender"
					disabled={driverSelectOptions.length > 0}
				/>
				<SelectInput
					label="License"
					value={formState.driver.license}
					onChange={(value) => {
						setFormState((current) => ({ ...current, driver: { ...current.driver, license: value as DriverLicense | "" } }));
						clearFieldError("driver.license");
					}}
					options={driverLicenses}
					error={errors["driver.license"]}
					placeholder="Select license"
					disabled={driverSelectOptions.length > 0}
				/>
				<SelectInput
					label="Entitled vehicle type"
					value={formState.driver.entitledToDrive}
					onChange={(value) => {
						setFormState((current) => ({
							...current,
							driver: { ...current.driver, entitledToDrive: value as VehicleType | "" },
						}));
						clearFieldError("driver.entitledToDrive");
					}}
					options={vehicleTypes}
					error={errors["driver.entitledToDrive"]}
					placeholder="Select entitlement"
					disabled={driverSelectOptions.length > 0}
				/>
			</div>
		</Section>
	);
}

type GuideSectionProps = {
	staleGuideWarning: string | null;
	assignmentError: string | null;
	formState: ServiceFormState;
	errors: ServiceFormErrors;
	isLoadingAssignments: boolean;
	guideSelectOptions: AssignmentOption[];
	genders: readonly Gender[];
	setFormState: SetFormState;
	clearFieldError: (path: string) => void;
	applySelectedGuide: (guideId: string) => void;
	updateGuideLanguage: (index: number, value: string) => void;
	addGuideLanguage: () => void;
	removeGuideLanguage: (index: number) => void;
};

export function GuideSection({
	staleGuideWarning,
	assignmentError,
	formState,
	errors,
	isLoadingAssignments,
	guideSelectOptions,
	genders,
	setFormState,
	clearFieldError,
	applySelectedGuide,
	updateGuideLanguage,
	addGuideLanguage,
	removeGuideLanguage,
}: GuideSectionProps) {
	return (
		<Section title="Guide" description="Optional guide information for tours or escorted services.">
			{staleGuideWarning ? (
				<div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
					{staleGuideWarning}
				</div>
			) : null}

			{assignmentError ? null : (
				<AssignmentSelectInput
					label="Choose guide (optional)"
					value={formState.guide.id}
					onChange={applySelectedGuide}
					options={guideSelectOptions}
					error={errors["guide.id"] ?? errors.guide}
					placeholder={isLoadingAssignments ? "Loading guides..." : "Select a guide (or leave blank)"}
					disabled={isLoadingAssignments}
					helpText="Options show guide name, gender, and spoken languages."
				/>
			)}

			<label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
				<input
					type="checkbox"
					checked={formState.includeGuide}
					onChange={(event) => {
						setFormState((current) => ({ ...current, includeGuide: event.target.checked }));
						if (!event.target.checked) {
							setFormState((current) => ({
								...current,
								includeGuide: false,
								guide: { id: "", name: "", gender: "", phone: "", languages: [""] },
							}));
						}
					}}
					className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
				/>
				Include guide details
			</label>

			{formState.includeGuide ? (
				<div className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						<TextInput
							label="Guide ID"
							type="number"
							value={formState.guide.id}
							onChange={(value) => {
								setFormState((current) => ({ ...current, guide: { ...current.guide, id: value } }));
								clearFieldError("guide.id");
							}}
							error={errors["guide.id"]}
							disabled={guideSelectOptions.length > 0}
						/>
						<TextInput
							label="Guide name"
							value={formState.guide.name}
							onChange={(value) => {
								setFormState((current) => ({ ...current, guide: { ...current.guide, name: value } }));
								clearFieldError("guide.name");
							}}
							error={errors["guide.name"]}
							disabled={guideSelectOptions.length > 0}
						/>
						<TextInput
							label="Phone"
							type="tel"
							value={formState.guide.phone}
							onChange={(value) =>
								setFormState((current) => ({ ...current, guide: { ...current.guide, phone: value } }))
							}
							error={errors["guide.phone"]}
							placeholder="Optional"
							disabled={guideSelectOptions.length > 0}
						/>
						<SelectInput
							label="Gender"
							value={formState.guide.gender}
							onChange={(value) => {
								setFormState((current) => ({ ...current, guide: { ...current.guide, gender: value as Gender | "" } }));
								clearFieldError("guide.gender");
							}}
							options={genders}
							error={errors["guide.gender"]}
							placeholder="Select gender"
							disabled={guideSelectOptions.length > 0}
						/>
					</div>

					<div className="space-y-3">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<div>
								<h4 className={sectionTitleClassName()}>Languages</h4>
								<p className={helpTextClassName()}>Languages spoken by this guide.</p>
							</div>
							{guideSelectOptions.length === 0 ? (
								<button
									type="button"
									onClick={addGuideLanguage}
									className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 sm:w-auto"
								>
									Add language
								</button>
							) : null}
						</div>

						{formState.guide.languages.map((language, index) => (
							<div key={`guide-language-${index}`} className="flex flex-col gap-2 sm:flex-row sm:items-start">
								<div className="flex-1">
									<TextInput
										label={`Language ${index + 1}`}
										value={language}
										onChange={(value) => {
											updateGuideLanguage(index, value);
											clearFieldError(`guide.languages.${index}`);
										}}
										error={errors[`guide.languages.${index}`]}
										placeholder="e.g. English"
										disabled={guideSelectOptions.length > 0}
									/>
								</div>
								{guideSelectOptions.length === 0 ? (
									<button
										type="button"
										onClick={() => removeGuideLanguage(index)}
										className="self-end rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										Remove
									</button>
								) : null}
							</div>
						))}
					</div>
				</div>
			) : (
				<p className="text-sm text-gray-500 dark:text-gray-400">Leave this disabled unless the service requires a guide.</p>
			)}
		</Section>
	);
}


