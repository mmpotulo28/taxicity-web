export class DomainError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "DomainError";
    this.status = status;
    this.details = details;
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "Authentication required", details?: unknown) {
    super(401, message, details);
    this.name = "UnauthorizedError";
  }
}

export function toDomainError(error: unknown): DomainError {
  if (error instanceof DomainError) {
    return error;
  }

  if (error instanceof Error) {
    return new DomainError(500, error.message, error);
  }

  return new DomainError(500, "Unexpected error", error);
}
