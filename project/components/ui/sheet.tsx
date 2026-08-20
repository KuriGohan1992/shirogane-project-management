"use client";

import { XIcon } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
	return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
	...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
	return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
	...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
	return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
	...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
	return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
	return (
		<SheetPrimitive.Overlay
			data-slot="sheet-overlay"
			className={cn(
				"fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
				className,
			)}
			{...props}
		/>
	);
}

function SheetContent({
	className,
	children,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Content>) {
	return (
		<SheetPortal>
			<SheetOverlay />

			<SheetPrimitive.Content
				data-slot="sheet-content"
				className={cn(
					"fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-xl outline-none duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:animate-in data-[state=open]:slide-in-from-right",
					className,
				)}
				{...props}
			>
				{children}

				<SheetPrimitive.Close className="absolute top-4 right-4 rounded-sm text-muted-foreground opacity-70 transition-opacity hover:text-foreground hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none">
					<XIcon className="size-4" />

					<span className="sr-only">Close</span>
				</SheetPrimitive.Close>
			</SheetPrimitive.Content>
		</SheetPortal>
	);
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-header"
			className={cn("border-b border-border px-6 py-5 pr-12", className)}
			{...props}
		/>
	);
}

function SheetTitle({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
	return (
		<SheetPrimitive.Title
			data-slot="sheet-title"
			className={cn("text-lg font-semibold text-foreground", className)}
			{...props}
		/>
	);
}

function SheetDescription({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
	return (
		<SheetPrimitive.Description
			data-slot="sheet-description"
			className={cn("mt-1 text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

export {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetOverlay,
	SheetPortal,
	SheetTitle,
	SheetTrigger,
};
