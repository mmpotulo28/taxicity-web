"use client";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";

import AuthButton from "./AuthButton";

const Header: React.FC = () => {
	const { user } = useUser();

	return (
		<header className="flex items-center justify-between px-4 pt-4 pb-2 bg-background/90 backdrop-blur-sm">
			<SignedIn>
				<div>
					<h1 className="text-xl font-bold">Welcome, {user?.firstName || "User"} 👋</h1>
					<p className="text-xs text-default-500">
						Ready to travel? Find a taxi or view your recent trips.
					</p>
				</div>
				<AuthButton />
			</SignedIn>
			<SignedOut>
				<div>
					<h1 className="text-xl font-bold">Welcome to TaxiCity 🚖</h1>
					<p className="text-xs text-default-500">
						Sign in to book rides and track your trips.
					</p>
				</div>
				<AuthButton />
			</SignedOut>
		</header>
	);
};

export default Header;
