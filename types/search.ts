export type ProjectSearchResult = {
	id: string;
	name: string;
	description: string | null;
};

export type TaskSearchResult = {
	id: string;
	title: string;
	projectId: string;
	projectName: string;
	stageName: string;
};

export type GlobalSearchResults = {
	projects: ProjectSearchResult[];
	tasks: TaskSearchResult[];
};
