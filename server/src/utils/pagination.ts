export interface PaginationQuery {
  limit: number;
  offset: number;
  q: string;
}

export function parsePagination(query: any): PaginationQuery {
  const page = Math.max(parseInt(query.page as string) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit as string) || 20, 1), 100);
  const offset = (page - 1) * limit;
  const q = (query.q as string) || "";
  return { limit, offset, q };
}