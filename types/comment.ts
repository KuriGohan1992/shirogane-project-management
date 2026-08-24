import type { TaskComment } from "@/lib/db/schema";
import type { UserSummary } from "@/types/user";

export type CommentActionState = {
	success: boolean;
	message?: string;
	errors?: {
		content?: string[];
	};
};

export type TaskCommentWithAuthor = TaskComment & {
	author: UserSummary;
};
