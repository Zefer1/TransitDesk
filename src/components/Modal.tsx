import { useEffect, useId } from "react";

type ModalProps = {
	isOpen: boolean;
	title: string;
	onClose: () => void;
	children: React.ReactNode;
};

export function Modal({ isOpen, title, onClose, children }: ModalProps) {
	useEffect(() => {
		if (!isOpen) {
			return;
		}
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	const titleId = useId();

	if (!isOpen) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 z-40 flex items-center justify-center bg-gray-950/50 px-4"
			onClick={onClose}
		>
			<div
				className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-xl"
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				onClick={(event) => event.stopPropagation()}
			>
				<div className="flex items-start justify-between gap-4">
					<h3 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-white">
						{title}
					</h3>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close dialog"
						className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
					>
						<span aria-hidden="true" className="text-xl leading-none">&times;</span>
					</button>
				</div>
				<div className="mt-4">{children}</div>
			</div>
		</div>
	);
}
