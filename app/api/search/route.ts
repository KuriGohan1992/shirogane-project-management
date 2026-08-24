import { NextResponse } from "next/server";

import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import { SEARCH_LIMITS } from "@/lib/constants/search";
import { searchProjectsAndTasksForUser } from "@/lib/db/search";
import type { GlobalSearchResults } from "@/types/search";

const emptyResults: GlobalSearchResults = {
	projects: [],
	tasks: [],
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);

	const query = searchParams.get("q")?.trim() ?? "";

	if (query.length < SEARCH_LIMITS.minQueryLength) {
		return NextResponse.json(emptyResults);
	}

	if (query.length > SEARCH_LIMITS.maxQueryLength) {
		return NextResponse.json(
			{
				message: `Search must be ${SEARCH_LIMITS.maxQueryLength} characters or fewer.`,
			},
			{
				status: 400,
			},
		);
	}

	const user = await getCurrentDatabaseUser();

	const results = await searchProjectsAndTasksForUser(user.id, query);

	return NextResponse.json(results);
}
