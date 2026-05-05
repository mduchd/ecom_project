// src/components/ServiceBanner.jsx
const SERVICES = [
    {
        id: 1,
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
        ),
        title: "Free Shipping",
        subtitle: "On all orders over $399",
        color: "text-blue-600",
        bg: "bg-blue-50",
    },
    {
        id: 2,
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
        title: "24/7 Support",
        subtitle: "Dedicated support anytime",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
    },
    {
        id: 3,
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        title: "Secure Payment",
        subtitle: "100% protected transactions",
        color: "text-purple-600",
        bg: "bg-purple-50",
    },
    {
        id: 4,
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
            </svg>
        ),
        title: "Money-Back Guarantee",
        subtitle: "30-day hassle-free returns",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
    },
];

export default function ServiceBanner() {
    return (
        <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {SERVICES.map((s) => (
                    <div
                        key={s.id}
                        className="flex items-center gap-3.5 bg-white border border-gray-100 rounded-2xl px-4 py-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                        {/* Icon bubble */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}>
                            {s.icon}
                        </div>
                        {/* Text */}
                        <div className="min-w-0">
                            <p className="text-sm font-black text-gray-800 leading-snug">{s.title}</p>
                            <p className="text-[11px] text-gray-400 font-medium mt-0.5 leading-snug">{s.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}