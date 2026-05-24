import { useState, useEffect, useCallback, useMemo } from "react";
import { getProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";
import { Link, useSearchParams } from "react-router-dom";
import { FaHome, FaChevronDown, FaSearch, FaSync, FaExclamationTriangle, FaInbox, FaChevronLeft, FaChevronRight } from "react-icons/fa";

function categoryLabel(category) {
  return category === "All" ? "Tất cả" : category;
}

const SORT_OPTIONS = [
  { label: "Mặc định", value: "default" },
  { label: "Giá thấp đến cao", value: "price_asc" },
  { label: "Giá cao đến thấp", value: "price_desc" },
];

const PAGE_SIZE = 8;

const sortProducts = (list, sort) => {
  switch (sort) {
    case "price_asc":
      return [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    case "price_desc":
      return [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    default:
      return list;
  }
};

function Breadcrumb({ category }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
      <Link to="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors font-medium">
        <FaHome className="w-3.5 h-3.5" /> Trang chủ
      </Link>
      <span className="text-gray-300">/</span>
      <Link to="/shop" className="hover:text-blue-600 transition-colors font-medium text-vi">
        Sản phẩm
      </Link>
      {category !== "All" && (
        <>
          <span className="text-gray-300">/</span>
          <span className="text-blue-600 font-semibold text-vi">{categoryLabel(category)}</span>
        </>
      )}
    </nav>
  );
}

function SelectDropdown({ options, value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer text-vi"
      >
        {options.map((opt) =>
          typeof opt === "string"
            ? <option key={opt} value={opt}>{categoryLabel(opt)}</option>
            : <option key={opt.value} value={opt.value}>{opt.label}</option>
        )}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
        <FaChevronDown className="w-4 h-4" />
      </span>
    </div>
  );
}

function Toolbar({ category, setCategory, sort, setSort, search, setSearch, total, currentCount, categories }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
      <p className="text-sm text-gray-500 text-vi">
        Hiển thị <span className="font-bold text-gray-800">{currentCount}</span> /{" "}
        <span className="font-bold text-gray-800">{total}</span> sản phẩm
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FaSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl w-44 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          />
        </div>

        <SelectDropdown options={categories} value={category} onChange={setCategory} />
        <SelectDropdown options={SORT_OPTIONS} value={sort} onChange={setSort} />
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <FaExclamationTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-base font-black text-gray-700 mb-1 text-vi">Không tải được sản phẩm</h3>
      <p className="text-sm text-gray-400 mb-5 max-w-xs text-vi">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-blue-100 text-vi"
      >
        <FaSync className="w-4 h-4" /> Thử lại
      </button>
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
      <FaInbox className="w-14 h-14 opacity-20 mb-3" />
      <p className="font-bold text-gray-500 mb-1 text-vi">Không tìm thấy sản phẩm</p>
      <p className="text-sm mb-5 text-vi">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
      <button
        onClick={onReset}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors text-vi"
      >
        Đặt lại bộ lọc
      </button>
    </div>
  );
}

function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <FaChevronLeft className="w-4 h-4" /> Trước
      </button>

      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`w-9 h-9 rounded-xl text-sm font-bold border transition-all
            ${current === i + 1
              ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
              : "bg-white border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
            }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Sau <FaChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState(["All"]);

  useEffect(() => {
    const urlCat = searchParams.get("category") || "All";
    setCategory(urlCat);
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts(category, search);
      const list = Array.isArray(data) ? data : [];
      setProducts(list);
      setCategoryOptions((prev) => {
        const merged = new Set(prev);
        list.forEach((item) => {
          if (item?.category) merged.add(item.category);
        });
        return Array.from(merged);
      });
      setPage(1);
    } catch (err) {
      setError(
        err.response?.status === 503
          ? "Không thể kết nối máy chủ. Vui lòng đảm bảo backend đang chạy ở cổng 8080."
          : err.message || "Đã xảy ra lỗi."
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, search ? 350 : 0);

    return () => clearTimeout(timer);
  }, [fetchProducts, search]);

  const categories = useMemo(() => categoryOptions, [categoryOptions]);

  const sorted = sortProducts(products, sort);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCategory = (val) => {
    setCategory(val);
    setPage(1);
    if (val === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: val });
    }
  };

  const handleReset = () => {
    setCategory("All");
    setSort("default");
    setSearch("");
    setPage(1);
    setSearchParams({});
  };

  return (
    <main lang="vi" className="min-h-screen bg-gray-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        <Breadcrumb category={category} />

        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight text-vi">
              {category === "All" ? "Tất cả sản phẩm" : categoryLabel(category)}
            </h1>
            <div className="flex gap-1 mt-1.5">
              <div className="h-1 w-10 rounded-full bg-blue-600" />
              <div className="h-1 w-4 rounded-full bg-yellow-400" />
            </div>
          </div>
          {!loading && !error && (
            <span className="text-sm text-gray-400 font-medium hidden sm:block text-vi">
              Tìm thấy {products.length} sản phẩm
            </span>
          )}
        </div>

        <Toolbar
          category={category}
          setCategory={handleCategory}
          sort={sort}
          setSort={setSort}
          search={search}
          setSearch={setSearch}
          total={sorted.length}
          currentCount={paginated.length}
          categories={categories}
        />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchProducts} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {paginated.length > 0
                ? paginated.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                : <EmptyState onReset={handleReset} />
              }
            </div>

            <Pagination
              current={page}
              total={totalPages}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </main>
  );
}
