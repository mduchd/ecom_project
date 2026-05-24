import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const HERO_SLIDES = [
  {
    id: 1,
    tag: "Sản phẩm nổi bật",
    title: "A4tech Bloody",
    subtitle: "Tai nghe chơi game",
    description: "Tai nghe không dây giàu tính năng, tối ưu cho game thủ chuyên nghiệp và người yêu âm thanh.",
    btnText: "Mua ngay",
    btnColor: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20",
    bg: "bg-gradient-to-br from-[#eae3d2] via-[#f7f4eb] to-[#dcd5c0]",
    textColor: "text-slate-800",
    tagColor: "text-blue-700 bg-blue-50 border border-blue-200/50",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=420&q=80",
    badge: "2 / 3",
    link: "/product/5",
  },
  {
    id: 2,
    tag: "Mới về",
    title: "Sony WH-1000",
    subtitle: "XM5 Wireless",
    description: "Chống ồn hàng đầu cùng thời lượng pin lên đến 30 giờ.",
    btnText: "Mua sắm ngay",
    btnColor: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20",
    bg: "bg-gradient-to-br from-[#f5efe6] via-[#faf7f2] to-[#eaddca]",
    textColor: "text-slate-800",
    tagColor: "text-amber-700 bg-amber-50 border border-amber-200/50",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=420&q=80",
    badge: "1 / 3",
    link: "/product/5",
  },
  {
    id: 3,
    tag: "Giá tốt",
    title: "Meta Quest 3",
    subtitle: "VR Headset",
    description: "Trải nghiệm thực tế hỗn hợp với công nghệ Meta Reality đột phá.",
    btnText: "Khám phá",
    btnColor: "bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20",
    bg: "bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950",
    textColor: "text-white",
    tagColor: "text-purple-300 bg-purple-950/40 border border-purple-800/40",
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=420&q=80",
    badge: "3 / 3",
    link: "/shop",
  },
];

const SMALL_BANNERS = [
  {
    id: 1,
    brand: "Oraimo",
    title: "Watch 5\nĐồng hồ thông minh",
    btnText: "Mua ngay",
    bg: "bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-100",
    textColor: "text-slate-800",
    btnColor: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80",
    link: "/shop",
  },
  {
    id: 2,
    brand: "IPS",
    title: "NPTE 200VA\nIPS sóng sin",
    btnText: "Mua sắm ngay",
    bg: "bg-gradient-to-br from-gray-900 to-zinc-900 border border-zinc-800",
    textColor: "text-white",
    btnColor: "bg-white hover:bg-gray-100 text-gray-900",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80",
    discount: "40% OFF",
    link: "/shop",
  },
  {
    id: 3,
    brand: "Bruker",
    title: "TP-Link Archer\nAX53 Router",
    btnText: "Khám phá",
    bg: "bg-gradient-to-br from-[#f0f4f8] to-slate-100 border border-slate-200/50",
    textColor: "text-slate-800",
    btnColor: "bg-slate-700 hover:bg-slate-800 text-white",
    image: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=200&q=80",
    link: "/shop",
  },
  {
    id: 4,
    brand: "Canon",
    title: "EOS R50\nMáy ảnh mirrorless",
    btnText: "Từ 24.000.000đ",
    bg: "bg-gradient-to-br from-zinc-900 to-black border border-zinc-800",
    textColor: "text-white",
    btnColor: "bg-yellow-400 hover:bg-yellow-500 text-gray-900",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&q=80",
    link: "/shop",
  },
];

function HeroSlide({ slide, isActive }) {
  return (
    <div
      className={`absolute inset-0 transition-all duration-700 ease-in-out group ${
        isActive ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none"
      } ${slide.bg} rounded-2xl overflow-hidden flex items-center px-8 md:px-10`}
    >
      <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/5" />
      <div className="absolute -right-4 -bottom-16 w-72 h-72 rounded-full bg-white/5" />

      <div className="relative z-10 flex-1 max-w-[55%]">
        <span
          className={`inline-block text-[11px] font-bold uppercase tracking-widest mb-3 px-2.5 py-0.5 rounded-full ${
            slide.tagColor || "text-blue-300 bg-blue-900/40 border border-blue-800/40"
          }`}
        >
          {slide.tag}
        </span>
        <h2 className={`text-3xl md:text-4xl font-black leading-tight ${slide.textColor} mb-1`}>{slide.title}</h2>
        <h3 className={`text-xl md:text-2xl font-bold ${slide.textColor} opacity-80 mb-4`}>{slide.subtitle}</h3>
        <p className={`text-xs md:text-sm ${slide.textColor} opacity-60 mb-6 leading-relaxed`}>{slide.description}</p>
        <Link
          to={slide.link}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 ${slide.btnColor}`}
        >
          {slide.btnText}
          <FaArrowRight className="w-4 h-4 animate-pulse" />
        </Link>
      </div>

      <Link
        to={slide.link}
        className="absolute right-6 bottom-0 h-[88%] flex items-end cursor-pointer group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-300"
      >
        <img src={slide.image} alt={slide.title} className="h-full w-auto object-contain drop-shadow-2xl select-none mix-blend-multiply" />
      </Link>

      <span className="absolute bottom-4 right-4 text-[11px] font-bold text-slate-400">{slide.badge}</span>
    </div>
  );
}

function SmallBanner({ banner }) {
  return (
    <Link
      to={banner.link}
      className={`relative rounded-xl overflow-hidden cursor-pointer group block transition-all duration-300 hover:scale-[1.03] hover:shadow-xl ${banner.bg} p-4 flex items-center gap-3 min-h-[90px]`}
    >
      {banner.discount && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full z-10">{banner.discount}</span>
      )}

      <div className="flex-1 z-10">
        <p className={`text-[10px] font-bold uppercase tracking-wider opacity-60 ${banner.textColor}`}>{banner.brand}</p>
        <h4 className={`text-sm font-black leading-tight whitespace-pre-line ${banner.textColor} mt-0.5 mb-2`}>{banner.title}</h4>
        <button className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all duration-150 group-hover:scale-105 ${banner.btnColor}`}>
          {banner.btnText}
        </button>
      </div>

      <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
        <img src={banner.image} alt={banner.title} className="w-full h-full object-cover rounded-lg opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 mix-blend-multiply" />
      </div>
    </Link>
  );
}

function SlideDots({ total, current, onChange }) {
  return (
    <div className="absolute bottom-4 left-8 flex items-center gap-1.5 z-20">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`transition-all duration-300 rounded-full h-2 ${i === current ? "w-5 bg-blue-600" : "w-2 bg-slate-400 hover:bg-slate-600"}`}
        />
      ))}
    </div>
  );
}

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-5">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-4">
        <div className="relative h-[320px] md:h-[360px] lg:h-full rounded-2xl overflow-hidden shadow-lg border border-slate-100">
          {HERO_SLIDES.map((slide, i) => (
            <HeroSlide key={slide.id} slide={slide} isActive={i === current} />
          ))}

          <SlideDots total={HERO_SLIDES.length} current={current} onChange={setCurrent} />

          {[
            { dir: -1, label: "‹", pos: "left-3" },
            { dir: 1, label: "›", pos: "right-3" },
          ].map(({ dir, label, pos }) => (
            <button
              key={dir}
              onClick={() => setCurrent((prev) => (prev + dir + HERO_SLIDES.length) % HERO_SLIDES.length)}
              className={`absolute top-1/2 -translate-y-1/2 ${pos} z-20 w-8 h-8 rounded-full bg-slate-800/10 hover:bg-slate-800/30 backdrop-blur-sm text-slate-800 hover:text-slate-900 text-xl font-bold flex items-center justify-center transition-all duration-150 hover:scale-110`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          {SMALL_BANNERS.map((banner) => (
            <SmallBanner key={banner.id} banner={banner} />
          ))}
        </div>
      </div>
    </section>
  );
}
