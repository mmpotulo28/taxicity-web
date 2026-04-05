export interface ApiErrorPayload {
message: string;
status: number;
details?: unknown;
}

export class ApiError extends Error {
readonly status: number;
readonly details?: unknown;

constructor(payload: ApiErrorPayload) {
super(payload.message);
this.name = "ApiError";
this.status = payload.status;
this.details = payload.details;
}
}
