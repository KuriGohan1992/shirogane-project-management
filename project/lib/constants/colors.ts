export const COLOR_VALUES = [
	"cyan",
	"blue",
	"violet",
	"rose",
	"orange",
	"emerald",
	"yellow",
	"slate",
] as const;

export type ColorValue = (typeof COLOR_VALUES)[number];

export const DEFAULT_COLOR: ColorValue = "cyan";

export const COLOR_OPTIONS: ReadonlyArray<{
	value: ColorValue;
	label: string;
	hex: string;
}> = [
	{
		value: "cyan",
		label: "Cyan",
		hex: "#06b6d4",
	},
	{
		value: "blue",
		label: "Blue",
		hex: "#3b82f6",
	},
	{
		value: "violet",
		label: "Violet",
		hex: "#8b5cf6",
	},
	{
		value: "rose",
		label: "Rose",
		hex: "#f43f5e",
	},
	{
		value: "orange",
		label: "Orange",
		hex: "#f97316",
	},
	{
		value: "emerald",
		label: "Emerald",
		hex: "#10b981",
	},
	{
		value: "yellow",
		label: "Yellow",
		hex: "#eab308",
	},
	{
		value: "slate",
		label: "Slate",
		hex: "#64748b",
	},
];

export function getColorHex(color: string) {
	return (
		COLOR_OPTIONS.find((option) => option.value === color)?.hex ??
		COLOR_OPTIONS[0].hex
	);
}