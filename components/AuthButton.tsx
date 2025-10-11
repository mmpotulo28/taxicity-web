"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";

export default function AuthButton() {
	return (
		<>
			<SignedOut>
				<SignInButton mode="modal">
					<Button
						color="primary"
						startContent={<Icon icon="lucide:user" />}
						variant="flat">
						Sign In
					</Button>
				</SignInButton>
			</SignedOut>
			<SignedIn>
				<UserButton
					appearance={{
						elements: {
							avatarBox: "w-10 h-10",
						},
					}}
					showName={false}
					userProfileMode="modal"
				/>
			</SignedIn>
		</>
	);
}
