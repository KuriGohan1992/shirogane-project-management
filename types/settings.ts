export type ProfileSettingsActionState = {
	success: boolean;
	message?: string;
	errors?: Partial<Record<"firstName" | "lastName" | "jobTitle", string[]>>;
};

export type SettingsMutationResult = {
	success: boolean;
	message?: string;
};
