"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";
import { useEffect, useState } from "react";

export default function ApiDocsPage() {
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		// Small delay to ensure the component is properly mounted
		const timer = setTimeout(() => setIsLoaded(true), 100);

		return () => clearTimeout(timer);
	}, []);

	if (!isLoaded) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mb-4" />
					<p className="text-lg">Loading API Documentation...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<ApiReferenceReact
				configuration={{
					spec: {
						url: "/api/openapi",
					},
					theme: "purple",
					layout: "modern",
					darkMode: true,
					showSidebar: true,
					hideModels: false,
					hideDownloadButton: false,
					metaData: {
						title: "TaxiCity API Documentation",
						description: "Complete REST API documentation for the TaxiCity platform",
						logo: "https://img.heroui.chat/logo.svg",
					},
					servers: [
						{
							url: "http://localhost:3000/api",
							description: "Development server",
						},
						{
							url: "https://taxicity.vercel.app/api",
							description: "Production server",
						},
					],
					authentication: {
						preferredSecurityScheme: "ClerkAuth",
						http: {
							bearer: {
								token: "your-clerk-jwt-token-here",
							},
						},
					},
				}}
			/>
		</div>
	);
}
