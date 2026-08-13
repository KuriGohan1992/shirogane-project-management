type CharacterCountProps = {
	current: number;
	max: number;
};

export function CharacterCount({ current, max }: CharacterCountProps) {
	return (
		<span
			className={
				current >= max
					? "text-xs tabular-nums text-destructive"
					: "text-xs tabular-nums text-muted-foreground"
			}
		>
			{current} / {max}
		</span>
	);
}
