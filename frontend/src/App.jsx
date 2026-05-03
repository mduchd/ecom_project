import Header from './components/Header'
import HeroBanner from './components/HeroBanner'
import ProductSection from './components/ProductSection' // Import phần sản phẩm

function App() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <Header />

      <main className="container mx-auto px-4 mt-6">
        <HeroBanner />

        {/* Khoảng cách giữa Banner và phần Sản phẩm */}
        <div className="mt-16">
          <ProductSection />
        </div>
      </main>

    </div>
  )
}

export default App