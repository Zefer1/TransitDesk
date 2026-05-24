import type { Service } from "../../../types/service.types";
import type { ServiceFormState } from "../components/serviceForm.types";

function toDateTimeLocalValue(value?: string): string {
	if (!value) {
		return "";
	}

	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return "";
	}

	const timezoneOffset = parsed.getTimezoneOffset() * 60_000;
	return new Date(parsed.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function fromDateTimeLocalValue(value: string): string {
	if (!value) {
		return "";
	}

	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

function toTextValue(value?: string | number): string {
	return value == null ? "" : String(value);
}

function normalizeOptionalText(value: string): string | undefined {
	const trimmed = value.trim();
	return trimmed ? trimmed : undefined;
}

function normalizeOptionalDate(value: string): string | undefined {
	const trimmed = value.trim();
	return trimmed ? trimmed : undefined;
}

export function buildInitialServiceFormState(initialData?: Partial<Omit<Service, "id">>): ServiceFormState {
	return {
		scheduledAt: toDateTimeLocalValue(initialData?.scheduledAt),
		description: initialData?.description ?? "",
		agencyName: initialData?.agencyName ?? "",
		stops: initialData?.stops?.length ? [...initialData.stops] : [""],
		distanceKm: toTextValue(initialData?.distanceKm),
		estimatedDurationMin: toTextValue(initialData?.estimatedDurationMin),
		status: initialData?.status ?? "scheduled",
		type: initialData?.type ?? "",
		vehicle: {
			id: toTextValue(initialData?.vehicle?.id),
			licensePlate: initialData?.vehicle?.licensePlate ?? "",
			brand: initialData?.vehicle?.brand ?? "",
			model: initialData?.vehicle?.model ?? "",
			year: toTextValue(initialData?.vehicle?.year),
			passengerCapacity: toTextValue(initialData?.vehicle?.passengerCapacity),
			type: initialData?.vehicle?.type ?? "",
			color: initialData?.vehicle?.color ?? "",
			registrationDate: initialData?.vehicle?.registrationDate ?? "",
			inspectionExpiry: initialData?.vehicle?.inspectionExpiry ?? "",
			active: initialData?.vehicle?.active ?? true,
			notes: initialData?.vehicle?.notes ?? "",
			suitedFor: initialData?.vehicle?.suitedFor ?? "",
		},
		passengerQuantity: toTextValue(initialData?.passengerQuantity),
		driver: {
			id: toTextValue(initialData?.driver?.id),
			name: initialData?.driver?.name ?? "",
			gender: initialData?.driver?.gender ?? "",
			license: initialData?.driver?.license ?? "",
			entitledToDrive: initialData?.driver?.entitledToDrive ?? "",
			phone: initialData?.driver?.phone ?? "",
		},
		includeGuide: Boolean(initialData?.guide),
		guide: {
			id: toTextValue(initialData?.guide?.id),
			name: initialData?.guide?.name ?? "",
			gender: initialData?.guide?.gender ?? "",
			phone: initialData?.guide?.phone ?? "",
			languages: initialData?.guide?.languages?.length ? [...initialData.guide.languages] : [""],
		},
		notes: initialData?.notes ?? "",
	};
}

export function createServiceFormPayload(formState: ServiceFormState): Record<string, unknown> {
	const guidePayload = formState.includeGuide
		? {
				id: formState.guide.id,
				name: formState.guide.name,
				gender: formState.guide.gender,
				phone: normalizeOptionalText(formState.guide.phone),
				languages: formState.guide.languages.filter((language) => language.trim() !== ""),
			}
		: undefined;

	return {
		scheduledAt: fromDateTimeLocalValue(formState.scheduledAt),
		description: formState.description,
		agencyName: normalizeOptionalText(formState.agencyName),
		stops: formState.stops,
		distanceKm: formState.distanceKm,
		estimatedDurationMin: formState.estimatedDurationMin,
		status: formState.status,
		type: formState.type,
		vehicle: {
			id: formState.vehicle.id,
			licensePlate: formState.vehicle.licensePlate,
			brand: formState.vehicle.brand,
			model: formState.vehicle.model,
			year: formState.vehicle.year,
			passengerCapacity: formState.vehicle.passengerCapacity,
			type: formState.vehicle.type,
			color: formState.vehicle.color,
			registrationDate: normalizeOptionalDate(formState.vehicle.registrationDate),
			inspectionExpiry: normalizeOptionalDate(formState.vehicle.inspectionExpiry),
			active: formState.vehicle.active,
			notes: normalizeOptionalText(formState.vehicle.notes),
			suitedFor: formState.vehicle.suitedFor || undefined,
		},
		passengerQuantity: formState.passengerQuantity,
		driver: {
			id: formState.driver.id,
			name: formState.driver.name,
			gender: formState.driver.gender,
			license: formState.driver.license,
			entitledToDrive: formState.driver.entitledToDrive,
			phone: normalizeOptionalText(formState.driver.phone),
		},
		guide: guidePayload,
		notes: normalizeOptionalText(formState.notes),
	};
}

export { mapZodErrors as mapServiceFormZodErrors } from "../../../lib/mapZodErrors";


