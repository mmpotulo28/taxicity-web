"use client";
import { title } from "@/components/primitives";
import { Card } from "@heroui/card";
import { Chip } from "@heroui/react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="flex bg-background text-white gap-8">
			{/* Left Section: Branding or Additional Info */}
			<div className="flex flex-1 items-center justify-center p-0 relative w-fit">
				<Card className="w-fit max-w-md bg-background shadow-2xl p-0 dark:shadow-zinc-800 rounded-2xl">
					{children}
				</Card>
			</div>

			{/* Right Section: Sign-In Form */}
			<div className="flex flex-1 flex-col min-h-[calc(90vh-4rem)] gap-8 text-center justify-center items-center w-full bg-gradient-to-tl from-primary-50 via-secondary-50 to-background p-10 relative rounded-2xl">
				<h1 className={`${title({ color: "blue" })} text-center`}>
					Welcome to PulseCampus
				</h1>
				<p className="text-xl text-default-500">
					Connect, collaborate, and engage with your campus community like never before.
				</p>
				<ul className="space-y-4 text-lg text-foreground">
					<li>🚀 Create and manage proposals</li>
					<li>🌌 Engage in group discussions</li>
					<li>📊 Track metrics and insights</li>
				</ul>
				<Chip color="secondary" className="mt-8 text-lg">
					Empowering the Future
				</Chip>
			</div>
		</div>
	);
};

export default AuthLayout;
