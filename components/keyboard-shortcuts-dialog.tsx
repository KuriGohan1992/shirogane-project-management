import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type ShortcutSeparator = "plus" | "or";

type Shortcut = {
	keys: string[];
	label: string;
	separator?: ShortcutSeparator;
};

type ShortcutSection = {
	title: string;
	shortcuts: Shortcut[];
};

type KeyboardShortcutsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const SHORTCUT_SECTIONS: ShortcutSection[] = [
	{
		title: "General",
		shortcuts: [
			{
				keys: ["⌘/Ctrl", "K"],
				label: "Focus global search",
				separator: "plus",
			},
			{
				keys: ["⌘/Ctrl", "B"],
				label: "Toggle sidebar",
				separator: "plus",
			},
			{
				keys: ["?"],
				label: "Show keyboard shortcuts",
			},
		],
	},
	{
		title: "Navigation",
		shortcuts: [
			{
				keys: ["GD"],
				label: "Go to Dashboard",
			},
			{
				keys: ["GP"],
				label: "Go to Projects",
			},
			{
				keys: ["GT"],
				label: "Go to Team",
			},
			{
				keys: ["GA"],
				label: "Go to Analytics",
			},
			{
				keys: ["GC"],
				label: "Go to Calendar",
			},
			{
				keys: ["GS"],
				label: "Go to Settings",
			},
		],
	},
	{
		title: "Projects",
		shortcuts: [
			{
				keys: ["N"],
				label: "Create a new project from the Projects page",
			},
		],
	},
	{
		title: "Project board",
		shortcuts: [
			{
				keys: ["⌘/Ctrl", "/"],
				label: "Focus page filters",
				separator: "plus",
			},
			{
				keys: ["H", "←"],
				label: "Move focus to the previous stage",
				separator: "or",
			},
			{
				keys: ["J", "↓"],
				label: "Move focus to the next task",
				separator: "or",
			},
			{
				keys: ["K", "↑"],
				label: "Move focus to the previous task",
				separator: "or",
			},
			{
				keys: ["L", "→"],
				label: "Move focus to the next stage",
				separator: "or",
			},
			{
				keys: ["Enter"],
				label: "Open the focused task",
			},
			{
				keys: ["S"],
				label: "Enter or leave task selection mode",
			},
			{
				keys: ["Space"],
				label: "Select or deselect the focused task",
			},
			{
				keys: ["A"],
				label: "Archive selected tasks",
			},
			{
				keys: ["⌫", "Delete"],
				label: "Delete selected tasks",
				separator: "or",
			},
			{
				keys: ["Esc"],
				label: "Exit selection mode or clear task focus",
			},
		],
	},
];

function Key({ children }: { children: string }) {
	return (
		<kbd className="inline-flex min-w-7 items-center justify-center rounded-md border border-border bg-muted px-1.5 py-1 font-mono text-[11px] font-semibold text-foreground shadow-xs">
			{children}
		</kbd>
	);
}

function ShortcutKeys({ shortcut }: { shortcut: Shortcut }) {
	return (
		<div className="flex shrink-0 items-center gap-1">
			{shortcut.keys.map((key, index) => (
				<span
					key={`${shortcut.label}-${key}`}
					className="flex items-center gap-1"
				>
					{index > 0 && shortcut.separator && (
						<span
							aria-hidden="true"
							className="px-0.5 text-[11px] text-muted-foreground"
						>
							{shortcut.separator === "plus" ? "+" : "/"}
						</span>
					)}

					<Key>{key}</Key>
				</span>
			))}
		</div>
	);
}

export function KeyboardShortcutsDialog({
	open,
	onOpenChange,
}: KeyboardShortcutsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				headerVariant="primary"
				className="max-h-[85dvh] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden bg-background p-0 sm:max-w-2xl"
			>
				<DialogHeader variant="primary">
					<DialogTitle>Keyboard shortcuts</DialogTitle>

					<DialogDescription className="sr-only">
						Navigate Shiro and work with the current board without reaching for
						the mouse.
					</DialogDescription>
				</DialogHeader>

				<div className="scrollbar-thin min-h-0 space-y-6 overflow-y-auto px-6 py-5">
					{SHORTCUT_SECTIONS.map((section) => (
						<section key={section.title}>
							<h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								{section.title}
							</h2>

							<div className="divide-y divide-border rounded-lg border border-border">
								{section.shortcuts.map((shortcut) => (
									<div
										key={`${section.title}-${shortcut.label}`}
										className="flex items-center justify-between gap-4 px-3 py-2.5"
									>
										<span className="min-w-0 text-sm text-foreground">
											{shortcut.label}
										</span>

										<ShortcutKeys shortcut={shortcut} />
									</div>
								))}
							</div>
						</section>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
