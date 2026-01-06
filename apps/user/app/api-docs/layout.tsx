import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "API Documentation - TaxiCity",
	description: "Comprehensive API documentation for the TaxiCity platform",
};

export default function ApiDocsLayout({ children }: { children: React.ReactNode }) {
	return <div className="h-screen overflow-hidden">{children}</div>;
}
