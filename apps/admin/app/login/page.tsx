"use client";

import { SignIn } from "@clerk/nextjs";
import { Icon } from "@iconify/react";

export default function AdminLogin() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
			<div className="w-full max-w-md mb-8 text-center">
				<div className="flex items-center justify-center gap-2 mb-2">
					<Icon className="text-primary text-4xl" icon="lucide:taxi" />
					<h1 className="text-3xl font-bold">TaxiCity Admin</h1>
				</div>
				<p className="text-default-500">Sign in to manage the platform</p>
			</div>

			<SignIn
				appearance={{
					elements: {
						rootBox: "mx-auto w-full",
						card: "shadow-lg border border-default-100",
					}
				}}
				fallbackRedirectUrl="/dashboard"
			/>
		</div>
	);
}
