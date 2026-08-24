import type { ReactNode } from "react";

type ProjectLayoutProps = {
	children: ReactNode;
	taskModal: ReactNode;
};

export default function ProjectLayout({
	children,
	taskModal,
}: ProjectLayoutProps) {
	return (
		<>
			{children}
			{taskModal}
		</>
	);
}
