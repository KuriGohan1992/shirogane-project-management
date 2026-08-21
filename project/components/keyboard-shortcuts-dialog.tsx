import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type KeyboardShortcutsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

type Shortcut = {
	keys: string[];
	label: string;
};

type ShortcutSection = {
	title: string;
	shortcuts: Shortcut[];
};

const SHORTCUT_SECTIONS: ShortcutSection[] = [
	{
		title: "General",
		shortcuts: [
			{
				keys: ["⌘/Ctrl", "K"],
				label: "Focus global search",
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
				keys: ["G", "D"],
				label: "Go to Dashboard",
			},
			{
				keys: ["G", "P"],
				label: "Go to Projects",
			},
			{
				keys: ["G", "T"],
				label: "Go to Team",
			},
			{
				keys: ["G", "A"],
				label: "Go to Analytics",
			},
			{
				keys: ["G", "C"],
				label: "Go to Calendar",
			},
			{
				keys: ["G", "S"],
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
			},
			{
				keys: ["H", "←"],
				label: "Move focus to the previous stage",
			},
			{
				keys: ["J", "↓"],
				label: "Move focus to the next task",
			},
			{
				keys: ["K", "↑"],
				label: "Move focus to the previous task",
			},
			{
				keys: ["L", "→"],
				label: "Move focus to the next stage",
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

export function KeyboardShortcutsDialog({
	open,
	onOpenChange,
}: KeyboardShortcutsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Keyboard shortcuts</DialogTitle>

					<DialogDescription>
						Navigate Shiro and work with the current board without reaching for
						the mouse.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
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
										<span className="text-sm text-foreground">
											{shortcut.label}
										</span>

										<div className="flex shrink-0 items-center gap-1">
											{shortcut.keys.map((key, index) => (
												<span
													key={`${shortcut.label}-${key}`}
													className="flex items-center gap-1"
												>
													{index > 0 && (
														<span
															aria-hidden="true"
															className="text-[10px] text-muted-foreground"
														>
															{shortcut.keys[0] === "G" ? "then" : "/"}
														</span>
													)}

													<Key>{key}</Key>
												</span>
											))}
										</div>
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
