import { DomainError, UnauthorizedError } from "./errors";

export type RequestInterceptor = (init: RequestInit) => Promise<RequestInit>;
export type ResponseInterceptor = (response: Response) => Promise<Response>;

export function createAuthInterceptor(getToken: () => Promise<string | null>): RequestInterceptor {
  return async (init: RequestInit) => {
    const headers = new Headers(init.headers);
    const token = await getToken();

    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return {
      ...init,
      headers
    };
  };
}

export const defaultResponseInterceptor: ResponseInterceptor = async (response: Response) => {
  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    let details: unknown = null;

    try {
      details = await response.clone().json();
    } catch {
      details = await response.text();
    }

    const message =
      typeof details === "object" && details !== null && "message" in details && typeof (details as { message?: unknown }).message === "string"
        ? (details as { message: string }).message
        : `Request failed with status ${response.status}`;

    throw new DomainError(response.status, message, details);
  }

  return response;
};
