import { useState, useEffect } from "react";

// ── Data ────────────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: 1,
    tag: "Featured Product",
    title: "A4tech Bloody",
    subtitle: "Gaming Headphone",
    description:
      "Feature-Packed Wireless Headset Engineered For Professional Gamers And Audiophiles.",
    btnText: "Buy Now",
    btnColor: "bg-blue-600 hover:bg-blue-700",
    bg: "bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800",
    textColor: "text-white",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=420&q=80",
    badge: "2 / 3",
  },
  {
    id: 2,
    tag: "New Arrival",
    title: "Sony WH-1000",
    subtitle: "XM5 Wireless",
    description:
      "Industry-leading noise cancellation with up to 30 hours battery life.",
    btnText: "Shop Now",
    btnColor: "bg-yellow-400 hover:bg-yellow-500 text-gray-900",
    bg: "bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900",
    textColor: "text-white",
    image:
      "https://images.unsplash.com/photo-1546435770-a3e736dc5b8b?w=420&q=80",
    badge: "1 / 3",
  },
  {
    id: 3,
    tag: "Best Deal",
    title: "Meta Quest 3",
    subtitle: "VR Headset",
    description:
      "Experience mixed reality with breakthrough Meta Reality technology.",
    btnText: "Discover",
    btnColor: "bg-purple-500 hover:bg-purple-600",
    bg: "bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900",
    textColor: "text-white",
    image:
      "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=420&q=80",
    badge: "3 / 3",
  },
];

const SMALL_BANNERS = [
  {
    id: 1,
    brand: "Oraimo",
    title: "Watch 5\nSmart Watch",
    btnText: "Buy Now",
    bg: "bg-gradient-to-br from-slate-100 to-blue-50",
    textColor: "text-slate-800",
    btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80",
    tag: "Watch",
  },
  {
    id: 2,
    brand: "IPS",
    title: "NPTE 200VA\nSine Wave IPS",
    btnText: "Shop Now",
    bg: "bg-gradient-to-br from-gray-800 to-gray-900",
    textColor: "text-white",
    btnColor: "bg-white hover:bg-gray-100 text-gray-900",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80",
    tag: "Power",
    discount: "40% OFF",
  },
  {
    id: 3,
    brand: "Bruker",
    title: "TP-Link Archer\nAX53 Router",
    btnText: "Discover",
    bg: "bg-gradient-to-br from-indigo-50 to-slate-100",
    textColor: "text-slate-800",
    btnColor: "bg-slate-700 hover:bg-slate-800 text-white",
    image:
      "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=200&q=80",
    tag: "Networking",
  },
  {
    id: 4,
    brand: "Canon",
    title: "EOS R50\nMirrorless Camera",
    btnText: "From $995",
    bg: "bg-gradient-to-br from-gray-900 to-zinc-800",
    textColor: "text-white",
    btnColor: "bg-yellow-400 hover:bg-yellow-500 text-gray-900",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&q=80",
    tag: "Camera",
  },
];

// ── Hero Slide (Main Banner) ─────────────────────────────────────────────────
function HeroSlide({ slide, isActive }) {
  return (
    <div
      className={`absolute inset-0 transition-all duration-700 ease-in-out ${isActive ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none"
        } ${slide.bg} rounded-2xl overflow-hidden flex items-center px-8 md:px-10`}
    >
      {/* Decorative circles */}
      <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/5" />
      <div className="absolute -right-4 -bottom-16 w-72 h-72 rounded-full bg-white/5" />

      {/* Content */}
      <div className="relative z-10 flex-1 max-w-[55%]">
        <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-blue-300 mb-3">
          {slide.tag}
        </span>
        <h2 className={`text-3xl md:text-4xl font-black leading-tight ${slide.textColor} mb-1`}>
          {slide.title}
        </h2>
        <h3 className={`text-xl md:text-2xl font-bold ${slide.textColor} opacity-80 mb-4`}>
          {slide.subtitle}
        </h3>
        <p className={`text-xs md:text-sm ${slide.textColor} opacity-60 mb-6 leading-relaxed`}>
          {slide.description}
        </p>
        <button
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-all duration-200 active:scale-95 ${slide.btnColor} text-white`}
        >
          {slide.btnText}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>

      {/* Product image */}
      <div className="absolute right-6 bottom-0 h-[88%] flex items-end">
        <img
          src={slide.image}
          alt={slide.title}
          className="h-full w-auto object-contain drop-shadow-2xl select-none"
        />
      </div>

      {/* Slide badge */}
      <span className="absolute bottom-4 right-4 text-[11px] font-bold text-white/50">
        {slide.badge}
      </span>
    </div>
  );
}

// ── Small Banner Card ────────────────────────────────────────────────────────
function SmallBanner({ banner }) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden cursor-pointer group
        transition-all duration-300 hover:scale-[1.03] hover:shadow-xl
        ${banner.bg} p-4 flex items-center gap-3 min-h-[90px]`}
    >
      {/* Discount badge */}
      {banner.discount && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full z-10">
          {banner.discount}
        </span>
      )}

      {/* Text */}
      <div className="flex-1 z-10">
        <p className={`text-[10px] font-bold uppercase tracking-wider opacity-60 ${banner.textColor}`}>
          {banner.brand}
        </p>
        <h4 className={`text-sm font-black leading-tight whitespace-pre-line ${banner.textColor} mt-0.5 mb-2`}>
          {banner.title}
        </h4>
        <button
          className={`text-[11px] font-bold px-3 py-1 rounded-full transition-colors duration-150 ${banner.btnColor}`}
        >
          {banner.btnText}
        </button>
      </div>

      {/* Image */}
      <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
        <img
          src={banner.image}
          alt={banner.title}
          className="w-full h-full object-cover rounded-lg opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
        />
      </div>
    </div>
  );
}

// ── Dot Indicator ────────────────────────────────────────────────────────────
function SlideDots({ total, current, onChange }) {
  return (
    <div className="absolute bottom-4 left-8 flex items-center gap-1.5 z-20">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`transition-all duration-300 rounded-full ${i === current
            ? "w-5 h-2 bg-white"
            : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`}
        />
      ))}
    </div>
  );
}

// ── Main HeroBanner Component ────────────────────────────────────────────────
export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-5">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-4">

        {/* ── Left: Main Hero Slider ── */}
        <div className="relative h-[320px] md:h-[360px] lg:h-full rounded-2xl overflow-hidden shadow-lg">
          {HERO_SLIDES.map((slide, i) => (
            <HeroSlide key={slide.id} slide={slide} isActive={i === current} />
          ))}
          <SlideDots
            total={HERO_SLIDES.length}
            current={current}
            onChange={setCurrent}
          />

          {/* Prev / Next arrows */}
          {[
            { dir: -1, label: "‹", pos: "left-3" },
            { dir: 1, label: "›", pos: "right-3" },
          ].map(({ dir, label, pos }) => (
            <button
              key={dir}
              onClick={() =>
                setCurrent((prev) => (prev + dir + HERO_SLIDES.length) % HERO_SLIDES.length)
              }
              className={`absolute top-1/2 -translate-y-1/2 ${pos} z-20
                w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm
                text-white text-xl font-bold flex items-center justify-center
                transition-all duration-150 hover:scale-110`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Right: Small Banners (2x2 grid) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          {SMALL_BANNERS.map((banner) => (
            <SmallBanner key={banner.id} banner={banner} />
          ))}
        </div>
      </div>
    </section>
  );
}