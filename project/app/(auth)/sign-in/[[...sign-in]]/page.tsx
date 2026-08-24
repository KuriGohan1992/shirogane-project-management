import { SignIn } from "@clerk/nextjs";

import { AuthShell } from "@/components/auth/auth-shell";
import { shiroAuthAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
	return (
		<AuthShell>
			<SignIn appearance={shiroAuthAppearance} />
		</AuthShell>
	);
}