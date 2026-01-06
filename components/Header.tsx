"use client";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";

import AuthButton from "./AuthButton";

const Header: React.FC = () => {
	const { user } = useUser();

	return (
		<header className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
			<SignedIn>
				<div className="bg-background/80 backdrop-blur-md rounded-full px-4 py-2 pointer-events-auto border border-default-100 shadow-sm">
					<p className="text-sm font-semibold">Hi, {user?.firstName || "Traveler"} 👋</p>
				</div>
				<div className="pointer-events-auto">
					<AuthButton />
				</div>
			</SignedIn>
			<SignedOut>
				{/* Empty header for signed out state to let the landing page focus on the bottom sheet */}
				<div className="bg-background/80 backdrop-blur-md rounded-full px-3 py-1.5 pointer-events-auto border border-default-100 shadow-sm flex items-center gap-2">
					<span className="text-sm font-bold bg-gradient-to-tr from-primary to-secondary bg-clip-text text-transparent">
						TaxiCity
					</span>
				</div>
				<div className="pointer-events-auto">
					<AuthButton />
				</div>
			</SignedOut>
		</header>
	);
};

export default Header;
