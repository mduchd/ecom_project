import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HERO_SLIDES = [
  {
    id: 1,
    label: "GALAXY S26 ULTRA",
    sublabel: "Sieu pham AI Galaxy",
    image:
      "https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:100/plain/https://media-asset.cellphones.com.vn/dashboard-v1/manage-banner/Home_s26_0626_2.png",
    link: "/product/11",
  },
  {
    id: 2,
    label: "IPHONE 17 PRO MAX",
    sublabel: "Nang cap em. Them khac biet",
    image:
      "https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:100/plain/https://media-asset.cellphones.com.vn/dashboard-v1/manage-banner/690x300_iPhone17ProMax_0626.png",
    link: "/product/10",
  },
  {
    id: 3,
    label: "XIAOMI 17T | 17T PRO",
    sublabel: "Bac thay telephoto - Mua ngay",
    image:
      "https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:100/plain/https://media-asset.cellphones.com.vn/dashboard-v1/manage-banner/Home_17t_0626_1.png",
    link: "/shop",
  },
];

const SIDE_BANNERS = [
  {
    id: 1,
    title: "Mung khai truong",
    image:
      "https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:100/plain/https://media-asset.cellphones.com.vn/dashboard-v1/manage-banner/KTPHUTHO_Home_690x300.png",
    link: "/shop",
  },
  {
    id: 2,
    title: "iPhone 17 Pro Max",
    image:
      "https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:100/plain/https://media-asset.cellphones.com.vn/dashboard-v1/manage-banner/690x300_iPhone17ProMax_0626.png",
    link: "/product/10",
  },
  {
    id: 3,
    title: "Galaxy S26 Ultra",
    image:
      "https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:100/plain/https://media-asset.cellphones.com.vn/dashboard-v1/manage-banner/Home_s26_0626_2.png",
    link: "/product/11",
  },
  {
    id: 4,
    title: "Xiaomi 17T | 17T Pro",
    image:
      "https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:100/plain/https://media-asset.cellphones.com.vn/dashboard-v1/manage-banner/Home_17t_0626_1.png",
    link: "/shop",
  },
];

function HeroSlide({ slide, isActive }) {
  return (
    <Link
      to={slide.link}
      className={`absolute inset-0 transition-all duration-700 ease-in-out ${
        isActive ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6 pointer-events-none"
      }`}
      aria-label={slide.label}
    >
      <img src={slide.image} alt={slide.label} className="h-full w-full object-cover" />
    </Link>
  );
}

function SideBanner({ banner }) {
  return (
    <Link
      to={banner.link}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
      aria-label={banner.title}
    >
      <div className="h-[94px] w-full sm:h-[98px] lg:h-[92px] xl:h-[95px]">
        <img src={banner.image} alt={banner.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]" />
      </div>
    </Link>
  );
}

function SlideTabs({ current, onChange }) {
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-t-xl border-b border-slate-200 bg-white">
      {HERO_SLIDES.map((slide, index) => (
        <button
          key={slide.id}
          onClick={() => onChange(index)}
          className={`px-4 py-3 text-left transition-colors duration-200 ${
            current === index ? "bg-slate-50" : "bg-white hover:bg-slate-50"
          }`}
        >
          <div className={`text-sm font-black ${current === index ? "text-red-600" : "text-slate-700"}`}>{slide.label}</div>
          <div className="text-xs text-slate-500">{slide.sublabel}</div>
        </button>
      ))}
    </div>
  );
}

function SlideDots({ total, current, onChange }) {
  return (
    <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/15 px-3 py-1.5 backdrop-blur-sm">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onChange(index)}
          className={`h-2 rounded-full transition-all duration-300 ${index === current ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white/90"}`}
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
    <section className="w-full max-w-[1280px] mx-auto px-4 pt-5 pb-3 sm:px-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <SlideTabs current={current} onChange={setCurrent} />

          <div className="relative h-[220px] overflow-hidden sm:h-[280px] md:h-[340px] lg:h-[360px] xl:h-[372px]">
            {HERO_SLIDES.map((slide, index) => (
              <HeroSlide key={slide.id} slide={slide} isActive={index === current} />
            ))}

            <button
              onClick={() => setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-2xl font-light text-white backdrop-blur-sm transition hover:bg-black/35"
              aria-label="Slide truoc"
            >
              {"<"}
            </button>

            <button
              onClick={() => setCurrent((prev) => (prev + 1) % HERO_SLIDES.length)}
              className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-2xl font-light text-white backdrop-blur-sm transition hover:bg-black/35"
              aria-label="Slide tiep theo"
            >
              {">"}
            </button>

            <SlideDots total={HERO_SLIDES.length} current={current} onChange={setCurrent} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 self-start lg:grid-cols-1">
          {SIDE_BANNERS.map((banner) => (
            <SideBanner key={banner.id} banner={banner} />
          ))}
        </div>
      </div>
    </section>
  );
}
