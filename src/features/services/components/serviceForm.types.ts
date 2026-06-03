import type {
	Driver,
	Gender,
	Service,
	ServiceStatus,
	ServiceType,
	VehicleType,
} from "../../../types/service.types";
import type { ValidatedServiceCreateValues } from "../schemas/serviceForm.schema";
import type { serviceCreateSchema } from "../schemas/serviceForm.schema";
export type DriverLicense = Driver["license"];

export type ServiceFormMode = "create" | "edit";

export type ServiceFormProps = {
	initialData?: Partial<Omit<Service, "id">>;
	onSubmit: (values: ValidatedServiceCreateValues) => Promise<void> | void;
	submitLabel?: string;
	isSubmitting?: boolean;
	validationSchema?: typeof serviceCreateSchema;
	mode?: ServiceFormMode;
	onCancel?: () => void;
};

export type ServiceFormErrors = Record<string, string>;

export type AssignmentOption = {
	value: string;
	label: string;
};

export type ServiceFormState = {
	scheduledAt: string;
	description: string;
	agencyName: string;
	stops: string[];
	distanceKm: string;
	estimatedDurationMin: string;
	status: ServiceStatus;
	type: ServiceType | "";
	vehicle: {
		id: string;
		licensePlate: string;
		brand: string;
		model: string;
		year: string;
		passengerCapacity: string;
		type: VehicleType | "";
		color: string;
		registrationDate: string;
		inspectionExpiry: string;
		active: boolean;
		notes: string;
		suitedFor: ServiceType | "";
	};
	passengerQuantity: string;
	driver: {
		id: string;
		name: string;
		gender: Gender | "";
		license: DriverLicense | "";
		entitledToDrive: VehicleType | "";
		phone: string;
	};
	includeGuide: boolean;
	guide: {
		id: string;
		name: string;
		gender: Gender | "";
		phone: string;
		languages: string[];
	};
	notes: string;
};



