/** Toast context and hook. Use `useToast()` inside a `ToastProvider` to show notifications. */
import { createContext, useContext } from "react";

// Core flow note: the block below contains the main behavior used by this module.

// Exposes toast context as a hook and enforces provider usage boundaries.

export type ToastType = "success" | "error" | "info";

export type ToastContextValue = {
	addToast: (message: string, type?: ToastType) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
	const ctx = useContext(ToastContext);
	if (!ctx) {
		throw new Error("useToast must be used within a ToastProvider");
	}

	return ctx;
}



