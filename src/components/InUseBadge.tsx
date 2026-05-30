import { Link } from "react-router-dom";

type InUseBadgeProps = {
	serviceId: number | null;
	activeLabel?: string;
};

export function InUseBadge({ serviceId, activeLabel = "In use" }: InUseBadgeProps) {
	if (serviceId === null) {
		return (
			<span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-300">
				Available
			</span>
		);
	}

	return (
		<Link
			to={`/services/${serviceId}`}
			className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-sm font-medium text-amber-800 dark:text-amber-300 underline-offset-2 transition hover:bg-amber-200 hover:underline dark:hover:bg-amber-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
		>
			{activeLabel}
		</Link>
	);
}
