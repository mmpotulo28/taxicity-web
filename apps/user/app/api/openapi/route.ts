import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";

export async function GET() {
	try {
		const filePath = path.join(process.cwd(), "docs", "openapi.json");
		const fileContents = fs.readFileSync(filePath, "utf8");
		const openApiSpec = JSON.parse(fileContents);

		return NextResponse.json(openApiSpec, {
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET",
				"Access-Control-Allow-Headers": "Content-Type",
				"Cache-Control": "public, max-age=3600", // Cache for 1 hour
			},
		});
	} catch (error) {
		console.error("Error serving OpenAPI spec:", error);

		return NextResponse.json({ error: "Failed to load API specification" }, { status: 500 });
	}
}
