import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";

import { upsertUser } from "@/lib/db/users";

export async function POST(request: NextRequest) {
	let event: Awaited<ReturnType<typeof verifyWebhook>>;

	try {
		event = await verifyWebhook(request);
	} catch (error) {
		console.error("Failed to verify Clerk webhook:", error);

		return new Response("Invalid webhook", {
			status: 400,
		});
	}

	if (event.type !== "user.created" && event.type !== "user.updated") {
		return new Response("Webhook ignored", {
			status: 200,
		});
	}

	const {
		id: clerkId,
		email_addresses: emailAddresses,
		primary_email_address_id: primaryEmailAddressId,
		first_name: firstName,
		last_name: lastName,
		image_url: imageUrl,
	} = event.data;

	const email = emailAddresses.find(
		(address) => address.id === primaryEmailAddressId,
	)?.email_address;

	if (!email) {
		return new Response("Primary email address not found", {
			status: 400,
		});
	}

	const name = [firstName, lastName].filter(Boolean).join(" ") || null;

	try {
		await upsertUser({
			clerkId,
			email,
			name,
			imageUrl: imageUrl ?? null,
		});

		return new Response("User synchronized", {
			status: 200,
		});
	} catch (error) {
		console.error("Failed to synchronize Clerk user:", error);

		return new Response("Failed to synchronize user", {
			status: 500,
		});
	}
}
