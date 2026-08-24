const TASK_SLUG_LENGTH = 72;

export function slugifyTaskTitle(title: string) {
	const slug = title
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, TASK_SLUG_LENGTH)
		.replace(/-+$/g, "");

	return slug || "task";
}

export function getTaskHref(projectId: string, taskId: string, title: string) {
	return `/projects/${projectId}/tasks/${taskId}/${slugifyTaskTitle(title)}`;
}
