import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ADMIN_PAGE_SIZE_OPTIONS, getVisiblePages } from "../utils/pagination.js";

export default function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  from,
  to,
  pageSize,
  itemLabel = "mục",
  onPageChange,
  onPageSizeChange,
}) {
  if (totalItems === 0) return null;

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs font-medium text-gray-400 text-vi">
          Hiển thị{" "}
          <span className="font-bold text-gray-600">{from}</span>
          {" "}–{" "}
          <span className="font-bold text-gray-600">{to}</span>
          {" "}trên{" "}
          <span className="font-bold text-gray-600">{totalItems}</span>
          {" "}{itemLabel}
          {pageSize ? (
            <span className="text-gray-300"> · </span>
          ) : null}
          {pageSize ? (
            <span className="font-bold text-gray-500">{pageSize}/trang</span>
          ) : null}
        </p>

        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-xs font-bold text-gray-500 text-vi">
            <span>Số dòng:</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {ADMIN_PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaChevronLeft size={10} />
            Trước
          </button>

          {pages[0] > 1 && (
            <>
              <button
                type="button"
                onClick={() => onPageChange(1)}
                className="min-w-8 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-bold text-gray-600 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
              >
                1
              </button>
              {pages[0] > 2 && <span className="px-1 text-xs font-bold text-gray-300">...</span>}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`min-w-8 rounded-lg border px-2 py-1.5 text-xs font-bold transition-all ${
                currentPage === page
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {page}
            </button>
          ))}

          {pages[pages.length - 1] < totalPages && (
            <>
              {pages[pages.length - 1] < totalPages - 1 && (
                <span className="px-1 text-xs font-bold text-gray-300">...</span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                className="min-w-8 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-bold text-gray-600 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sau
            <FaChevronRight size={10} />
          </button>
        </div>
      )}
    </div>
  );
}
