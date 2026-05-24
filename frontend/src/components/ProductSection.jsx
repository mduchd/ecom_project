import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaInbox } from "react-icons/fa";
import ProductCard from "./ProductCard";
import { getProducts } from "../services/productService";

export default function ProductSection({
  title = "Bán chạy",
  viewAllHref = "/shop",
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Nổi bật");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getProducts();
        if (mounted) setProducts(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p?.category) set.add(p.category);
    });
    return ["Nổi bật", ...Array.from(set).slice(0, 6)];
  }, [products]);

  const displayedProducts = useMemo(() => {
    if (activeTab === "Nổi bật") {
      return products.slice(0, 10);
    }
    return products.filter((p) => p.category === activeTab).slice(0, 10);
  }, [activeTab, products]);

  return (
    <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-gray-900 tracking-tight text-vi">{title}</h2>
        <Link
          to={viewAllHref}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors text-vi"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-5">
        {categories.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200
              ${activeTab === tab
                ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-72 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : displayedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <FaInbox className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-semibold text-vi">Danh mục này chưa có sản phẩm.</p>
        </div>
      )}
    </section>
  );
}
