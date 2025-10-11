import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
	return <SignUp path="/auth/sign-up" routing="path" oauthFlow="popup" />;
}
