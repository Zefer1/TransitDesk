import { useCallback, useRef, useState } from "react";
import { ToastContext, type ToastType } from "./useToast";

type Toast = {
	id: number;
	message: string;
	type: ToastType;
};

const TOAST_DURATION_MS = 4000;

const toastStyles: Record<ToastType, string> = {
	success: "bg-green-600 text-white",
	error: "bg-red-600 text-white",
	info: "bg-gray-800 text-white",
};

const toastIcon: Record<ToastType, string> = {
	success: "✓",
	error: "✕",
	info: "ℹ",
};

function ToastItem({
	toast,
	onDismiss,
}: {
	toast: Toast;
	onDismiss: () => void;
}) {
	return (
		<div
			role="status"
			aria-live="polite"
			className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3 shadow-lg text-sm font-medium max-w-sm w-full ${toastStyles[toast.type]}`}
		>
			<span className="flex items-center gap-2">
				<span aria-hidden="true">{toastIcon[toast.type]}</span>
				{toast.message}
			</span>
			<button
				type="button"
				onClick={onDismiss}
				aria-label="Dismiss notification"
				className="shrink-0 opacity-75 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
			>
				✕
			</button>
		</div>
	);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);
	const nextId = useRef(0);

	const dismiss = useCallback((id: number) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const addToast = useCallback(
		(message: string, type: ToastType = "info") => {
			const id = ++nextId.current;
			setToasts((prev) => [...prev, { id, message, type }]);
			setTimeout(() => dismiss(id), TOAST_DURATION_MS);
		},
		[dismiss],
	);

	return (
		<ToastContext.Provider value={{ addToast }}>
			{children}
			<div
				className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end"
				aria-label="Notifications"
				role="region"
				aria-live="polite"
				aria-atomic="true"
			>
				{toasts.map((toast) => (
					<ToastItem
						key={toast.id}
						toast={toast}
						onDismiss={() => dismiss(toast.id)}
					/>
				))}
			</div>
		</ToastContext.Provider>
	);
}
