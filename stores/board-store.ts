import { createStore } from "zustand/vanilla";

import type { StageWithTasks } from "@/types/stage";

type BoardState = {
	stages: StageWithTasks[];
};

type BoardActions = {
	syncStages: (stages: StageWithTasks[]) => void;
};

export type BoardStore = BoardState & BoardActions;

export function createBoardStore(initialStages: StageWithTasks[]) {
	return createStore<BoardStore>()((set) => ({
		stages: initialStages,

		syncStages: (stages) => {
			set({ stages });
		},
	}));
}

export type BoardStoreApi = ReturnType<typeof createBoardStore>;
