"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

import { loadAssignmentCandidatesAction } from "@/lib/actions/project-panel-data";
import type { AssignmentCandidate } from "@/types/member";

type AssignmentCandidatesContextValue = {
	candidates: AssignmentCandidate[];
	isLoading: boolean;
	ensureTeamCandidates: () => Promise<void>;
};

const AssignmentCandidatesContext =
	createContext<AssignmentCandidatesContextValue | null>(null);

type AssignmentCandidatesProviderProps = {
	projectId: string;
	initialCandidates: AssignmentCandidate[];
	canLoadTeamCandidates: boolean;
	children: ReactNode;
};

export function AssignmentCandidatesProvider({
	projectId,
	initialCandidates,
	canLoadTeamCandidates,
	children,
}: AssignmentCandidatesProviderProps) {
	const [candidates, setCandidates] = useState(initialCandidates);
	const [isLoading, setIsLoading] = useState(false);

	const loadedRef = useRef(!canLoadTeamCandidates);
	const pendingRef = useRef<Promise<void> | null>(null);

	useEffect(() => {
		setCandidates(initialCandidates);
		loadedRef.current = !canLoadTeamCandidates;
	}, [canLoadTeamCandidates, initialCandidates]);

	const ensureTeamCandidates = useCallback(async () => {
		if (loadedRef.current) {
			return;
		}

		if (pendingRef.current) {
			return pendingRef.current;
		}

		setIsLoading(true);

		const request = loadAssignmentCandidatesAction(projectId)
			.then((nextCandidates) => {
				setCandidates(nextCandidates);
				loadedRef.current = true;
			})
			.catch((error) => {
				console.error("Failed to load Team assignment candidates:", error);
			})
			.finally(() => {
				setIsLoading(false);
				pendingRef.current = null;
			});

		pendingRef.current = request;

		return request;
	}, [projectId]);

	return (
		<AssignmentCandidatesContext.Provider
			value={{
				candidates,
				isLoading,
				ensureTeamCandidates,
			}}
		>
			{children}
		</AssignmentCandidatesContext.Provider>
	);
}

export function useAssignmentCandidatesContext() {
	return useContext(AssignmentCandidatesContext);
}
