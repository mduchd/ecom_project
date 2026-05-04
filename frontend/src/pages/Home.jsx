import HeroBanner from '../components/HeroBanner'
import ProductSection from '../components/ProductSection'

export default function Home() {
    return (
        <main className="container mx-auto px-4 mt-6">
            <HeroBanner />

            <div className="mt-16">
                <ProductSection title="Best Seller" />
            </div>
        </main>
    )
}