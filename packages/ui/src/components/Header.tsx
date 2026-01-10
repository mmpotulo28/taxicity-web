"use client";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import AuthButton from "./AuthButton";
import { cn } from "@taxicity/utils";

interface HeaderProps {
	endContent?: React.ReactNode;
	driverMode?: boolean;
}

const Header: React.FC<HeaderProps> = ({ endContent, driverMode }) => {
	const { user } = useUser();

	return (
		<header className={cn("absolute top-4 left-0 right-0 z-50 flex items-center justify-between pointer-events-none w-full max-w-lg mx-auto", !!driverMode && "mt-4")}>
			<SignedIn>
				<div className="flex justify-between w-full px-4	items-center">
					<div className="bg-background/70 backdrop-blur-sm rounded-full px-4 py-2 pointer-events-auto border border-default-100 shadow-sm">
						<p className="text-sm font-semibold">Hi, {user?.firstName || "Traveler"} 👋</p>
					</div>
					<div className="pointer-events-auto flex items-center gap-2 bg-background/70 backdrop-blur-sm rounded-full	px-2 py-0 shadow-sm">
						{endContent}
						<AuthButton />
					</div>
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
