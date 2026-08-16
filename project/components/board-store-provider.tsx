"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
} from "react";
import { useStore } from "zustand";

import {
	type BoardStore,
	type BoardStoreApi,
	createBoardStore,
} from "@/stores/board-store";
import type { StageWithTasks } from "@/types/stage";

type BoardStoreProviderProps = {
	serverStages: StageWithTasks[];
	children: ReactNode;
};

const BoardStoreContext = createContext<BoardStoreApi | null>(null);

export function BoardStoreProvider({
	serverStages,
	children,
}: BoardStoreProviderProps) {
	const storeRef = useRef<BoardStoreApi | null>(null);

	if (storeRef.current === null) {
		storeRef.current = createBoardStore(serverStages);
	}

	const store = storeRef.current;

	useEffect(() => {
		store.getState().syncStages(serverStages);
	}, [serverStages, store]);

	return (
		<BoardStoreContext.Provider value={store}>
			{children}
		</BoardStoreContext.Provider>
	);
}

export function useBoardStore<T>(selector: (state: BoardStore) => T): T {
	const store = useContext(BoardStoreContext);

	if (!store) {
		throw new Error("useBoardStore must be used inside BoardStoreProvider.");
	}

	return useStore(store, selector);
}
