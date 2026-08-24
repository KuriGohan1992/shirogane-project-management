import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { UserSummary } from "@/types/user";

type UserAvatarProps = {
	user: UserSummary;
	className?: string;
};

function getUserInitials(user: UserSummary) {
	const name = user.name?.trim();

	if (name) {
		return name
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part[0])
			.join("")
			.toUpperCase();
	}

	return user.email.slice(0, 2).toUpperCase();
}

export function UserAvatar({ user, className }: UserAvatarProps) {
	return (
		<Avatar className={cn("size-8", className)}>
			{user.imageUrl && (
				<AvatarImage src={user.imageUrl} alt={user.name ?? user.email} />
			)}

			<AvatarFallback className="text-xs">
				{getUserInitials(user)}
			</AvatarFallback>
		</Avatar>
	);
}
