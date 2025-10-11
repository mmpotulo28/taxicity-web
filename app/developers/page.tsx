import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Link } from "@heroui/link";
import { ExternalLinkIcon, BookIcon, CodeIcon, DatabaseIcon } from "lucide-react";

export default function DeveloperPage() {
	return (
		<div className="container mx-auto px-4 py-8 max-w-6xl">
			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold mb-4">TaxiCity Developer Resources</h1>
				<p className="text-xl text-default-600 max-w-2xl mx-auto">
					Everything you need to integrate with the TaxiCity platform. Explore our APIs,
					documentation, and developer tools.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
				{/* API Documentation */}
				<Card className="p-2">
					<CardHeader className="flex items-start gap-3">
						<div className="flex-shrink-0">
							<BookIcon className="h-8 w-8 text-primary" />
						</div>
						<div>
							<h3 className="text-xl font-semibold">Interactive API Docs</h3>
							<p className="text-sm text-default-600">
								Explore our complete REST API with interactive examples
							</p>
						</div>
					</CardHeader>
					<CardBody>
						<ul className="space-y-2 text-sm">
							<li>• Authentication with Clerk JWT</li>
							<li>• Real-time testing interface</li>
							<li>• Request/response examples</li>
							<li>• OpenAPI 3.0 specification</li>
						</ul>
					</CardBody>
					<CardFooter>
						<Button
							as={Link}
							href="/api-docs"
							color="primary"
							variant="flat"
							className="w-full"
							endContent={<ExternalLinkIcon className="h-4 w-4" />}>
							View API Docs
						</Button>
					</CardFooter>
				</Card>

				{/* API Status */}
				<Card className="p-2">
					<CardHeader className="flex items-start gap-3">
						<div className="flex-shrink-0">
							<DatabaseIcon className="h-8 w-8 text-success" />
						</div>
						<div>
							<h3 className="text-xl font-semibold">API Status</h3>
							<p className="text-sm text-default-600">
								Check the current status and health of our APIs
							</p>
						</div>
					</CardHeader>
					<CardBody>
						<ul className="space-y-2 text-sm">
							<li>• Real-time system status</li>
							<li>• API endpoint availability</li>
							<li>• Performance metrics</li>
							<li>• Version information</li>
						</ul>
					</CardBody>
					<CardFooter>
						<Button
							as={Link}
							href="/api/status"
							color="success"
							variant="flat"
							className="w-full"
							endContent={<ExternalLinkIcon className="h-4 w-4" />}>
							Check Status
						</Button>
					</CardFooter>
				</Card>

				{/* OpenAPI Spec */}
				<Card className="p-2">
					<CardHeader className="flex items-start gap-3">
						<div className="flex-shrink-0">
							<CodeIcon className="h-8 w-8 text-warning" />
						</div>
						<div>
							<h3 className="text-xl font-semibold">OpenAPI Specification</h3>
							<p className="text-sm text-default-600">
								Download or import our OpenAPI 3.0 specification
							</p>
						</div>
					</CardHeader>
					<CardBody>
						<ul className="space-y-2 text-sm">
							<li>• OpenAPI 3.0 format</li>
							<li>• Import into Postman</li>
							<li>• Generate client SDKs</li>
							<li>• Schema definitions</li>
						</ul>
					</CardBody>
					<CardFooter>
						<Button
							as={Link}
							href="/api/openapi"
							color="warning"
							variant="flat"
							className="w-full"
							endContent={<ExternalLinkIcon className="h-4 w-4" />}>
							Get OpenAPI Spec
						</Button>
					</CardFooter>
				</Card>
			</div>

			{/* Quick Start Guide */}
			<Card className="mb-8">
				<CardHeader>
					<h2 className="text-2xl font-bold">Quick Start Guide</h2>
				</CardHeader>
				<CardBody>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<div>
							<h3 className="text-lg font-semibold mb-3">1. Authentication</h3>
							<div className="bg-default-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
								<pre>{`import { useAuth } from '@clerk/nextjs';

const { getToken } = useAuth();
const token = await getToken();`}</pre>
							</div>
						</div>
						<div>
							<h3 className="text-lg font-semibold mb-3">2. Make API Request</h3>
							<div className="bg-default-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
								<pre>{`const response = await fetch('/api/taxis', {
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  }
});`}</pre>
							</div>
						</div>
					</div>
				</CardBody>
			</Card>

			{/* Available APIs */}
			<Card>
				<CardHeader>
					<h2 className="text-2xl font-bold">Available APIs</h2>
				</CardHeader>
				<CardBody>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{[
							{
								name: "Users",
								endpoint: "/api/users",
								description: "User profiles and locations",
							},
							{
								name: "Drivers",
								endpoint: "/api/drivers",
								description: "Driver management",
							},
							{
								name: "Taxis",
								endpoint: "/api/taxis",
								description: "Fleet tracking and status",
							},
							{
								name: "Routes",
								endpoint: "/api/routes",
								description: "Route management",
							},
							{
								name: "Ranks",
								endpoint: "/api/ranks",
								description: "Taxi rank stations",
							},
							{
								name: "Reports",
								endpoint: "/api/reports",
								description: "User reporting system",
							},
							{
								name: "Support",
								endpoint: "/api/support",
								description: "Support tickets",
							},
							{
								name: "Search",
								endpoint: "/api/search",
								description: "Universal search",
							},
						].map((api) => (
							<div
								key={api.name}
								className="border border-default-200 rounded-lg p-4">
								<h4 className="font-semibold text-primary">{api.name}</h4>
								<p className="text-sm text-default-600 mb-2">{api.description}</p>
								<code className="text-xs bg-default-100 px-2 py-1 rounded">
									{api.endpoint}
								</code>
							</div>
						))}
					</div>
				</CardBody>
			</Card>

			{/* Footer */}
			<div className="text-center mt-12 text-default-600">
				<p>
					Need help? Contact our support team or check out the{" "}
					<Link href="/docs/API.md" color="primary">
						detailed documentation
					</Link>
				</p>
			</div>
		</div>
	);
}
