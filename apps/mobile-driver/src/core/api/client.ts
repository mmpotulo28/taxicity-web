import { tokenCache } from "../auth/token-cache";
import { createAuthInterceptor, defaultResponseInterceptor, type RequestInterceptor, type ResponseInterceptor } from "./interceptors";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

class ApiClient {
  private readonly baseUrl: string;
  private readonly requestInterceptors: RequestInterceptor[];
  private readonly responseInterceptors: ResponseInterceptor[];

  constructor(baseUrl: string, requestInterceptors: RequestInterceptor[] = [], responseInterceptors: ResponseInterceptor[] = []) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.requestInterceptors = requestInterceptors;
    this.responseInterceptors = responseInterceptors;
  }

  async get<TResponse>(path: string, init: Omit<RequestOptions, "method" | "body"> = {}) {
    return this.request<TResponse>(path, { ...init, method: "GET" });
  }

  async post<TResponse, TBody>(path: string, body: TBody, init: Omit<RequestOptions, "method" | "body"> = {}) {
    return this.request<TResponse>(path, { ...init, method: "POST", body });
  }

  async patch<TResponse, TBody>(path: string, body: TBody, init: Omit<RequestOptions, "method" | "body"> = {}) {
    return this.request<TResponse>(path, { ...init, method: "PATCH", body });
  }

  private async request<TResponse>(path: string, init: RequestOptions): Promise<TResponse> {
    const url = path.startsWith("http") ? path : `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

    const headers = new Headers(init.headers);
    let body: BodyInit | undefined;

    if (init.body !== undefined) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(init.body);
    }

    let requestInit: RequestInit = {
      ...init,
      headers,
      body
    };

    for (const interceptor of this.requestInterceptors) {
      requestInit = await interceptor(requestInit);
    }

    let response = await fetch(url, requestInit);

    for (const interceptor of this.responseInterceptors) {
      response = await interceptor(response);
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    return (await response.json()) as TResponse;
  }
}

const defaultApiBase = process.env.EXPO_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3006";

export const apiClient = new ApiClient(defaultApiBase, [createAuthInterceptor(() => tokenCache.getToken())], [defaultResponseInterceptor]);
