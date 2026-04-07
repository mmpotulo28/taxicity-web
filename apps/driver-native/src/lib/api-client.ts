export class ApiError extends Error {
	status: number;
	details?: unknown;

	constructor(status: number, message: string, details?: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.details = details;
	}
}

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
	body?: BodyInit | Record<string, unknown>;
	timeoutMs?: number;
	retries?: number;
}

const DEFAULT_API_ORIGIN = "http://localhost:3006";

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

async function getClerkToken(): Promise<string | null> {
	if (globalThis.window === undefined) {
		return null;
	}

	try {
		const clerk = (globalThis as typeof globalThis & { Clerk?: { session?: { getToken?: () => Promise<string | null> } } }).Clerk;
		if (!clerk?.session?.getToken) {
			return null;
		}

		return await clerk.session.getToken();
	} catch {
		return null;
	}
}

function isRetryableStatus(status: number) {
	return status >= 500 || status === 429;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

async function parseJsonSafely(response: Response): Promise<unknown> {
	const text = await response.text();
	if (!text) {
		return null;
	}

	try {
		return JSON.parse(text) as unknown;
	} catch {
		return text;
	}
}

async function executeRequest<T>(url: string, options: ApiRequestOptions): Promise<T> {
	const controller = new AbortController();
	const timeoutMs = options.timeoutMs ?? 10000;
	const timeout = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const headers = new Headers(options.headers);
		const token = await getClerkToken();
		let requestBody: BodyInit | undefined;
		const rawBody = options.body;
		const resolvedUrl = resolveApiUrl(url);

		if (token && !headers.has("Authorization")) {
			headers.set("Authorization", `Bearer ${token}`);
		}

		if (rawBody instanceof FormData || rawBody instanceof URLSearchParams || rawBody instanceof Blob || rawBody instanceof ArrayBuffer || typeof rawBody === "string") {
			requestBody = rawBody;
		} else if (rawBody !== undefined) {
			headers.set("Content-Type", "application/json");
			requestBody = JSON.stringify(rawBody);
		}

		const response = await fetch(resolvedUrl, {
			...options,
			headers,
			body: requestBody,
			credentials: options.credentials ?? "include",
			signal: controller.signal,
		});

		const payload = await parseJsonSafely(response);

		if (!response.ok) {
			let message = `Request failed with status ${response.status}`;
			if (isRecord(payload)) {
				const errorText = payload.error ?? payload.message;
				if (typeof errorText === "string" && errorText.length > 0) {
					message = errorText;
				}
			}

			throw new ApiError(response.status, message, payload);
		}

		return payload as T;
	} finally {
		clearTimeout(timeout);
	}
}

export async function apiRequest<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
	const retries = Math.max(0, options.retries ?? (options.method?.toUpperCase() === "GET" ? 1 : 0));

	for (let attempt = 0; attempt <= retries; attempt += 1) {
		try {
			return await executeRequest<T>(url, options);
		} catch (error) {
			const isLastAttempt = attempt === retries;
			if (isLastAttempt) {
				throw error;
			}

			if (error instanceof ApiError && !isRetryableStatus(error.status)) {
				throw error;
			}
		}
	}

	throw new ApiError(500, "Request failed");
}

export const apiGet = <T>(url: string, options: Omit<ApiRequestOptions, "method" | "body"> = {}) => apiRequest<T>(url, { ...options, method: "GET" });

export const apiPost = <T>(url: string, body?: ApiRequestOptions["body"], options: Omit<ApiRequestOptions, "method" | "body"> = {}) => apiRequest<T>(url, { ...options, method: "POST", body });

export const apiPatch = <T>(url: string, body?: ApiRequestOptions["body"], options: Omit<ApiRequestOptions, "method" | "body"> = {}) => apiRequest<T>(url, { ...options, method: "PATCH", body });
