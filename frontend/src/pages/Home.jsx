// src/pages/Home.jsx
import ServiceBanner from "../components/ServiceBanner";
import HeroBanner from "../components/HeroBanner";
import ProductSection from "../components/ProductSection";

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50">
            <HeroBanner />
            <ServiceBanner />
            <ProductSection title="Best Seller" />
        </main>
    );
}