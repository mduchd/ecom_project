export const ADMIN_PAGE_SIZE = 10;
export const ADMIN_PAGE_SIZE_OPTIONS = [10, 20, 50];

export function paginateItems(items, page, pageSize = ADMIN_PAGE_SIZE) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    totalItems,
    totalPages,
    currentPage,
    from: totalItems === 0 ? 0 : startIndex + 1,
    to: Math.min(startIndex + pageSize, totalItems),
  };
}

export function mapPagedResponse(paged, requestedPage = paged?.page ?? 1) {
  const totalItems = paged?.totalElements ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 1);
  const responsePage = paged?.page ?? 1;
  const currentPage = totalItems === 0 ? 1 : Math.min(Math.max(responsePage, 1), totalPages);
  const size = paged?.size ?? ADMIN_PAGE_SIZE;
  const from = totalItems === 0 ? 0 : (currentPage - 1) * size + 1;
  const to = Math.min(currentPage * size, totalItems);

  return {
    items: paged?.content ?? [],
    totalItems,
    totalPages,
    currentPage,
    correctedPage: currentPage !== requestedPage ? currentPage : null,
    from,
    to,
  };
}

export function getVisiblePages(currentPage, totalPages, maxButtons = 5) {
  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const half = Math.floor(maxButtons / 2);
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + maxButtons - 1);

  if (end - start + 1 < maxButtons) {
    start = Math.max(1, end - maxButtons + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
