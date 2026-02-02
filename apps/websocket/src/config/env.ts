import "dotenv/config";

export const config = {
	port: process.env.PORT || 3006,
	nodeEnv: process.env.NODE_ENV || "development",
	internalApiKey: process.env.WS_INTERNAL_API_KEY || "taxicity-secret-key",
	corsOrigin: process.env.NODE_ENV === "production" ? "*.taxyciti.net" : "*",
};
