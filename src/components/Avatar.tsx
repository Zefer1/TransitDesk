function getInitials(name: string): string {
	const tokens = name.trim().split(/\s+/).filter(Boolean);
	if (tokens.length === 0) {
		return "?";
	}
	const first = tokens[0][0];
	const last = tokens.length > 1 ? tokens[tokens.length - 1][0] : "";
	return (first + last).toUpperCase();
}

type AvatarProps = {
	name: string;
	size?: "sm" | "md";
};

export function Avatar({ name, size = "sm" }: AvatarProps) {
	const sizeClass = size === "md" ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs";

	return (
		<span
			aria-hidden="true"
			className={`${sizeClass} inline-flex items-center justify-center rounded-full bg-blue-600 font-semibold text-white select-none`}
		>
			{getInitials(name)}
		</span>
	);
}
