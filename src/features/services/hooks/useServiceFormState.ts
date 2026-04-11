/** useReducer-based state management for ServiceForm. Handles field updates, dynamic stops/languages lists, and vehicle/driver/guide assignment application. */
import { useEffect, useReducer } from "react";

import type { SetStateAction } from "react";
import type { Driver, Guide, Vehicle } from "../../../types/service.types";
import type { ServiceFormState } from "../components/serviceForm.types";

type ServiceFormStateAction =
	| { type: "replace"; payload: ServiceFormState }
	| { type: "set"; payload: React.SetStateAction<ServiceFormState> }
	| { type: "updateStop"; index: number; value: string }
	| { type: "addStop" }
	| { type: "removeStop"; index: number }
	| { type: "updateGuideLanguage"; index: number; value: string }
	| { type: "addGuideLanguage" }
	| { type: "removeGuideLanguage"; index: number }
	| { type: "applyVehicle"; payload: Vehicle | null }
	| { type: "applyDriver"; payload: Driver | null }
	| { type: "applyGuide"; payload: Guide | null; selectedGuideId: string };

// Central reducer keeps form transitions explicit and easy to test.
function serviceFormStateReducer(state: ServiceFormState, action: ServiceFormStateAction): ServiceFormState {
	switch (action.type) {
		case "replace":
			return action.payload;
		case "set":
			// Supports both direct objects and functional updaters from React state APIs.
			return typeof action.payload === "function"
				? action.payload(state)
				: action.payload;
		case "updateStop":
			return {
				...state,
				stops: state.stops.map((stop, index) => (index === action.index ? action.value : stop)),
			};
		case "addStop":
			return {
				...state,
				stops: [...state.stops, ""],
			};
		case "removeStop":
			// Keep at least one stop input mounted so the UI and schema stay aligned.
			return {
				...state,
				stops: state.stops.length === 1 ? [""] : state.stops.filter((_, index) => index !== action.index),
			};
		case "updateGuideLanguage":
			return {
				...state,
				guide: {
					...state.guide,
					languages: state.guide.languages.map((language, index) =>
						index === action.index ? action.value : language,
					),
				},
			};
		case "addGuideLanguage":
			// Adding a language implicitly enables guide inclusion.
			return {
				...state,
				includeGuide: true,
				guide: {
					...state.guide,
					languages: [...state.guide.languages, ""],
				},
			};
		case "removeGuideLanguage":
			return {
				...state,
				guide: {
					...state.guide,
					languages:
						state.guide.languages.length === 1
							? [""]
							: state.guide.languages.filter((_, index) => index !== action.index),
				},
			};
		case "applyVehicle": {
			// When selection is cleared, preserve typed manual fields and only clear id.
			if (!action.payload) {
				return {
					...state,
					vehicle: {
						...state.vehicle,
						id: "",
					},
				};
			}

			return {
				...state,
				vehicle: {
					id: String(action.payload.id),
					licensePlate: action.payload.licensePlate,
					brand: action.payload.brand,
					model: action.payload.model,
					year: String(action.payload.year),
					passengerCapacity: String(action.payload.passengerCapacity),
					type: action.payload.type,
					color: action.payload.color,
					registrationDate: action.payload.registrationDate ?? "",
					inspectionExpiry: action.payload.inspectionExpiry ?? "",
					active: action.payload.active ?? true,
					notes: action.payload.notes ?? "",
					suitedFor: action.payload.suitedFor ?? "",
				},
			};
		}
		case "applyDriver": {
			// Hydrates the nested driver object from selected assignment option.
			if (!action.payload) {
				return {
					...state,
					driver: {
						...state.driver,
						id: "",
					},
				};
			}

			return {
				...state,
				driver: {
					id: String(action.payload.id),
					name: action.payload.name,
					gender: action.payload.gender,
					license: action.payload.license,
					entitledToDrive: action.payload.entitledToDrive,
					phone: action.payload.phone ?? "",
				},
			};
		}
		case "applyGuide": {
			// Guide inclusion follows selectedGuideId so users can explicitly clear guide.
			if (!action.payload) {
				return {
					...state,
					includeGuide: Boolean(action.selectedGuideId),
					guide: {
						...state.guide,
						id: "",
					},
				};
			}

			return {
				...state,
				includeGuide: Boolean(action.selectedGuideId),
				guide: {
					id: String(action.payload.id),
					name: action.payload.name,
					gender: action.payload.gender,
					phone: action.payload.phone ?? "",
					languages: action.payload.languages?.length ? [...action.payload.languages] : [""],
				},
			};
		}
		default:
			return state;
	}
}

type UseServiceFormStateResult = {
	formState: ServiceFormState;
	setFormState: (updater: SetStateAction<ServiceFormState>) => void;
	updateStop: (index: number, value: string) => void;
	addStop: () => void;
	removeStop: (index: number) => void;
	updateGuideLanguage: (index: number, value: string) => void;
	addGuideLanguage: () => void;
	removeGuideLanguage: (index: number) => void;
	applySelectedVehicle: (vehicleId: string, vehicleOptions: Vehicle[]) => void;
	applySelectedDriver: (driverId: string, driverOptions: Driver[]) => void;
	applySelectedGuide: (guideId: string, guideOptions: Guide[]) => void;
	resetFormState: (nextInitialState: ServiceFormState) => void;
};

export function useServiceFormState(initialState: ServiceFormState): UseServiceFormStateResult {
	const [formState, dispatch] = useReducer(serviceFormStateReducer, initialState);

	// Re-seed reducer when parent provides new initial data (e.g., switching entity in edit mode).
	useEffect(() => {
		dispatch({ type: "replace", payload: initialState });
	}, [initialState]);

	return {
		formState,
		setFormState: (updater) => {
			dispatch({ type: "set", payload: updater });
		},
		updateStop: (index, value) => {
			dispatch({ type: "updateStop", index, value });
		},
		addStop: () => {
			dispatch({ type: "addStop" });
		},
		removeStop: (index) => {
			dispatch({ type: "removeStop", index });
		},
		updateGuideLanguage: (index, value) => {
			dispatch({ type: "updateGuideLanguage", index, value });
		},
		addGuideLanguage: () => {
			dispatch({ type: "addGuideLanguage" });
		},
		removeGuideLanguage: (index) => {
			dispatch({ type: "removeGuideLanguage", index });
		},
		applySelectedVehicle: (vehicleId, vehicleOptions) => {
			const selectedVehicle = vehicleOptions.find((vehicle) => String(vehicle.id) === vehicleId) ?? null;
			dispatch({ type: "applyVehicle", payload: selectedVehicle });
		},
		applySelectedDriver: (driverId, driverOptions) => {
			const selectedDriver = driverOptions.find((driver) => String(driver.id) === driverId) ?? null;
			dispatch({ type: "applyDriver", payload: selectedDriver });
		},
		applySelectedGuide: (guideId, guideOptions) => {
			const selectedGuide = guideOptions.find((guide) => String(guide.id) === guideId) ?? null;
			dispatch({ type: "applyGuide", payload: selectedGuide, selectedGuideId: guideId });
		},
		resetFormState: (nextInitialState) => {
			dispatch({ type: "replace", payload: nextInitialState });
		},
	};
}


