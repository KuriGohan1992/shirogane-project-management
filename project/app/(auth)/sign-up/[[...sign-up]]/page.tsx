import { SignUp } from "@clerk/nextjs";

import { AuthShell } from "@/components/auth/auth-shell";
import { shiroAuthAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
	return (
		<AuthShell>
			<SignUp appearance={shiroAuthAppearance} />
		</AuthShell>
	);
}