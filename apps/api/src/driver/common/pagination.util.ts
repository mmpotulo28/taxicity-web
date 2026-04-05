export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(
  pageRaw: string | undefined,
  limitRaw: string | undefined,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {},
): PaginationParams {
  const pageDefault = defaults.page ?? 1;
  const limitDefault = defaults.limit ?? 20;
  const maxLimit = defaults.maxLimit ?? 100;

  const parsedPage = Number.parseInt(pageRaw ?? `${pageDefault}`, 10);
  const parsedLimit = Number.parseInt(limitRaw ?? `${limitDefault}`, 10);

  const page =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : pageDefault;
  const unsafeLimit =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : limitDefault;
  const limit = Math.min(unsafeLimit, maxLimit);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}
