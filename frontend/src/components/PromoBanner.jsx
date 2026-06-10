import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

export default function PromoBanner() {
    return (
        <section className="w-full max-w-[1280px] mx-auto px-4 pt-4 pb-2 sm:px-6">
            <Link
                to="/shop"
                className="relative block w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer border border-blue-200/50"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 opacity-95 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-0 right-0 w-80 h-full bg-yellow-400/10 skew-x-12 translate-x-20 pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 py-6 md:py-5 gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                        <span className="bg-yellow-400 text-blue-950 text-[11px] font-black px-3.5 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                            Dac quyen Smember
                        </span>

                        <div>
                            <h3 className="text-white text-base md:text-lg font-black">
                                Doi tien cong nghe, len doi sieu pham
                            </h3>
                            <p className="text-white/80 text-xs mt-0.5 max-w-xl font-medium">
                                Nhap ma <span className="text-yellow-300 font-bold">SMEMBER5</span> giam them <span className="text-yellow-300 font-bold">5% toi da 500.000d</span> khi thanh toan qua the tin dung.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="flex items-center gap-1.5 bg-white text-blue-700 font-bold text-xs px-5 py-2.5 rounded-full shadow transition-all duration-200 group-hover:bg-yellow-400 group-hover:text-blue-950">
                            <span>Kham pha ngay</span>
                            <FaChevronRight className="w-2.5 h-2.5" />
                        </div>
                    </div>
                </div>
            </Link>
        </section>
    );
}
