// src/pages/Home.jsx
import ServiceBanner from "../components/ServiceBanner";
import HeroBanner from "../components/HeroBanner";
import PromoBanner from "../components/PromoBanner";
import ProductSection from "../components/ProductSection";
import CategoryList from "../components/CategoryList";
import FlashSale from "../components/FlashSale";

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50 pb-10">
            <HeroBanner />
            <PromoBanner />
            <CategoryList />
            <FlashSale />
            <ServiceBanner />
            <ProductSection title="Gợi ý dành cho bạn" />
        </main>
    );
}
