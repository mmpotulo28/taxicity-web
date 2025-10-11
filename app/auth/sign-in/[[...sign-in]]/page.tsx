import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
	return <SignIn path="/auth/sign-in" routing="path" oauthFlow="popup" />;
}
