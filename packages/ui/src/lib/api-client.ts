import axios from "axios";

const DEFAULT_API_ORIGIN = "http://localhost:3006";

interface ClerkSession {
	getToken?: () => Promise<string | null>;
}

interface ClerkClient {
	session?: ClerkSession;
}

interface WindowWithClerk extends Window {
	Clerk?: ClerkClient;
}

function getApiOrigin() {
	const configured = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || DEFAULT_API_ORIGIN;
	return configured.replace(/\/$/, "");
}

function resolveApiUrl(url: string) {
	if (/^https?:\/\//i.test(url)) {
		return url;
	}

	const base = getApiOrigin();
	if (url.startsWith("/")) {
		return `${base}${url}`;
	}

	return `${base}/${url}`;
}

async function getClerkToken() {
	if (globalThis.window === undefined) {
		return null;
	}

	try {
		const clerk = (window as WindowWithClerk).Clerk;
		if (!clerk?.session?.getToken) {
			return null;
		}

		return await clerk.session.getToken();
	} catch {
		return null;
	}
}

export const apiClient = axios.create({
	timeout: 10000,
	withCredentials: true,
});

apiClient.interceptors.request.use(async (config) => {
	const originalUrl = typeof config.url === "string" ? config.url : "";
	config.url = resolveApiUrl(originalUrl);

	const token = await getClerkToken();
	if (token) {
		const headers = axios.AxiosHeaders.from(config.headers);
		if (!headers.has("Authorization")) {
			headers.set("Authorization", `Bearer ${token}`);
		}
		config.headers = headers;
	}

	return config;
});
