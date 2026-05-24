function SkeletonBox({ className }: { className?: string }) {
	return (
		<div
			aria-hidden="true"
			className={`animate-pulse motion-reduce:animate-none rounded bg-gray-200 ${className ?? "h-4 w-full"}`}
		/>
	);
}

export function SkeletonTableRows({ rows = 5 }: { rows?: number }) {
	return (
		<>
			{Array.from({ length: rows }).map((_, i) => (
				<tr key={i}>
					<td className="px-4 py-3">
						<SkeletonBox className="h-4 w-48" />
					</td>
					<td className="px-4 py-3">
						<SkeletonBox className="h-4 w-20" />
					</td>
					<td className="px-4 py-3">
						<SkeletonBox className="h-6 w-20 rounded-full" />
					</td>
					<td className="px-4 py-3">
						<SkeletonBox className="h-4 w-36" />
					</td>
					<td className="px-4 py-3">
						<SkeletonBox className="h-4 w-10" />
					</td>
					<td className="px-4 py-3">
						<SkeletonBox className="h-8 w-36" />
					</td>
				</tr>
			))}
		</>
	);
}

export function SkeletonCardRows({ rows = 3 }: { rows?: number }) {
	return (
		<>
			{Array.from({ length: rows }).map((_, i) => (
				<div
					key={i}
					className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm space-y-3"
				>
					<div className="flex items-start justify-between gap-3">
						<div className="space-y-2 flex-1">
							<SkeletonBox className="h-5 w-48" />
							<SkeletonBox className="h-4 w-24" />
						</div>
						<SkeletonBox className="h-6 w-20 rounded-full" />
					</div>
					<div className="grid grid-cols-2 gap-3">
						<SkeletonBox className="h-4 w-full" />
						<SkeletonBox className="h-4 w-full" />
					</div>
				</div>
			))}
		</>
	);
}

export function SkeletonDetailPage() {
	return (
		<section
			className="space-y-6"
			aria-label="Loading service details"
			aria-busy="true"
			aria-live="polite"
			role="status"
		>
			<span className="sr-only">Loading service details</span>
			{/* Header card */}
			<div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
				<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<SkeletonBox className="h-7 w-64" />
							<SkeletonBox className="h-6 w-20 rounded-full" />
						</div>
						<SkeletonBox className="h-4 w-48" />
						<SkeletonBox className="h-4 w-32" />
					</div>
					<div className="flex gap-2">
						<SkeletonBox className="h-10 w-20 rounded-md" />
						<SkeletonBox className="h-10 w-16 rounded-md" />
					</div>
				</div>
			</div>

			{/* Derived metrics */}
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div
						key={i}
						className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm space-y-2"
					>
						<SkeletonBox className="h-3 w-24" />
						<SkeletonBox className="h-5 w-32" />
					</div>
				))}
			</div>

			{/* Service + Assignments cards */}
			<div className="grid gap-6 lg:grid-cols-2">
				{Array.from({ length: 2 }).map((_, i) => (
					<div
						key={i}
						className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm space-y-4"
					>
						<SkeletonBox className="h-5 w-24" />
						<div className="space-y-3">
							{Array.from({ length: 3 }).map((_, j) => (
								<SkeletonBox key={j} className="h-4 w-full" />
							))}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
