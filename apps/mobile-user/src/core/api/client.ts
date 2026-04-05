import { ApiError } from "./errors";
import {
identityRequestInterceptor,
identityResponseInterceptor,
type RequestInterceptor,
type ResponseInterceptor,
} from "./interceptors";

const DEFAULT_API_ORIGIN = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3006";

type AccessTokenProvider = () => Promise<string | null>;

let accessTokenProvider: AccessTokenProvider = async () => null;

export function setAccessTokenProvider(provider: AccessTokenProvider) {
accessTokenProvider = provider;
}

function resolveUrl(path: string): string {
if (/^https?:\/\//i.test(path)) {
return path;
}

const normalized = DEFAULT_API_ORIGIN.replace(/\/$/, "");
return path.startsWith("/") ? `${normalized}${path}` : `${normalized}/${path}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
return typeof value === "object" && value !== null;
}

async function parseJsonSafe(response: Response): Promise<unknown> {
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

export interface ApiClientConfig {
requestInterceptor?: RequestInterceptor;
responseInterceptor?: ResponseInterceptor;
}

class ApiClient {
private readonly requestInterceptor: RequestInterceptor;
private readonly responseInterceptor: ResponseInterceptor;

constructor(config: ApiClientConfig = {}) {
this.requestInterceptor = config.requestInterceptor ?? identityRequestInterceptor;
this.responseInterceptor = config.responseInterceptor ?? identityResponseInterceptor;
}

private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
const url = resolveUrl(path);
const token = await accessTokenProvider();
const headers = new Headers(init.headers);

if (token && !headers.has("Authorization")) {
headers.set("Authorization", `Bearer ${token}`);
}

if (!headers.has("Content-Type") && init.body && typeof init.body === "string") {
headers.set("Content-Type", "application/json");
}

const interceptedReq = await this.requestInterceptor({
url,
init: {
...init,
headers,
},
});

const response = await fetch(interceptedReq.url, interceptedReq.init);
const interceptedRes = await this.responseInterceptor({
url: interceptedReq.url,
response,
});
const payload = await parseJsonSafe(interceptedRes.response);

if (!interceptedRes.response.ok) {
let message = `Request failed with status ${interceptedRes.response.status}`;
if (isRecord(payload) && typeof payload.message === "string") {
message = payload.message;
}
throw new ApiError({
message,
status: interceptedRes.response.status,
details: payload,
});
}

return payload as T;
}

get<T>(path: string, init: Omit<RequestInit, "method"> = {}) {
return this.request<T>(path, { ...init, method: "GET" });
}

post<T, TBody>(path: string, body: TBody, init: Omit<RequestInit, "method" | "body"> = {}) {
return this.request<T>(path, {
...init,
method: "POST",
body: JSON.stringify(body),
});
}
}

export const apiClient = new ApiClient();
