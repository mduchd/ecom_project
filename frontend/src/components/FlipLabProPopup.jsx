import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCopy, FaTimes, FaGift, FaCheck, FaExternalLinkAlt, FaStar, FaArrowRight, FaRedo } from "react-icons/fa";

const DISMISSED_KEY = "snapcart_fliplab_dismissed";
const CLAIMED_KEY = "snapcart_fliplab_claimed";
const SEEN_SESSION_KEY = "snapcart_fliplab_seen_session";

export default function FlipLabProPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [confetti, setConfetti] = useState([]);

  const features = [
    {
      title: "Không giới hạn tính năng",
      desc: "Tự do tạo thẻ học, quản lý và lưu trữ thư viện học tập không giới hạn.",
      bgColor: "bg-blue-600"
    },
    {
      title: "Trợ lý học thuật AI thông minh",
      desc: "Dịch thuật ngữ cảnh, tự tạo câu ví dụ, phát âm chuẩn bản xứ.",
      bgColor: "bg-indigo-600"
    },
    {
      title: "Đa dạng chế độ ôn tập",
      desc: "Ôn luyện hiệu quả với phương pháp Lặp lại ngắt quãng (SRS) và trắc nghiệm.",
      bgColor: "bg-violet-600"
    },
    {
      title: "Học tập trò chơi hóa (Gamification)",
      desc: "Ôn bài vui vẻ qua các trò chơi ghép thẻ, đấu trí kịch tính.",
      bgColor: "bg-pink-600"
    },
    {
      title: "Tắt quảng cáo hoàn toàn",
      desc: "Giao diện học tập tối giản, tăng sự tập trung và tốc độ ghi nhớ.",
      bgColor: "bg-emerald-600"
    }
  ];

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    const claimed = localStorage.getItem(CLAIMED_KEY);
    const seenThisSession = sessionStorage.getItem(SEEN_SESSION_KEY);

    if (!dismissed && !claimed && !seenThisSession) {
      sessionStorage.setItem(SEEN_SESSION_KEY, "true");
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = (permanent = false) => {
    setIsOpen(false);
    if (permanent) {
      localStorage.setItem(DISMISSED_KEY, "true");
    }
  };

  const handleClaim = () => {
    setIsClaimed(true);
    localStorage.setItem(CLAIMED_KEY, "true");
    triggerConfetti();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("SNAPCART_FLIPLAB_PRO");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    triggerConfetti();
  };

  const triggerConfetti = () => {
    const colors = ["#2563EB", "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];
    const newConfetti = Array.from({ length: 50 }).map((_, i) => ({
      id: i + Date.now(),
      x: Math.random() * 100,
      y: -10,
      size: Math.random() * 6 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.15,
      duration: Math.random() * 1.2 + 1.5,
      rotation: Math.random() * 360,
    }));
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 3000);
  };

  // Official FlipLab SVG Logo
  const FlipLabLogoSvg = ({ className = "w-5 h-5" }) => (
    <svg className={className} width="20" height="20" style={{ minWidth: "20px", minHeight: "20px" }} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#2563EB" />
      <g transform="translate(1, 1)">
        <rect x="13" y="10" width="7" height="22" rx="2" fill="white" fillOpacity="0.2" />
        <rect x="10" y="8" width="8" height="23" rx="2.5" fill="white" />
        <path d="M18 8H27L30 11V16H18V8Z" fill="white" />
        <rect x="18" y="19" width="9" height="8" rx="2.5" fill="white" />
      </g>
    </svg>
  );

  return (
    <>
      {/* Confetti Render */}
      <div className="fixed inset-0 pointer-events-none z-[999] overflow-hidden">
        {confetti.map((c) => (
          <motion.div
            key={c.id}
            initial={{ y: "-10vh", x: `${c.x}vw`, rotate: 0, opacity: 1 }}
            animate={{
              y: "110vh",
              x: `${c.x + (Math.random() * 16 - 8)}vw`,
              rotate: c.rotation + 720,
              opacity: 0
            }}
            transition={{
              duration: c.duration,
              delay: c.delay,
              ease: "easeOut"
            }}
            style={{
              position: "absolute",
              width: c.size,
              height: c.size,
              backgroundColor: c.color,
              borderRadius: Math.random() > 0.4 ? "50%" : "3px",
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Soft backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleDismiss(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />

            {/* SaaS-Style Promotion Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white text-slate-800 shadow-[0_30px_70px_rgba(15,23,42,0.18)]"
            >
              {/* Close Button */}
              <button
                onClick={() => handleDismiss(false)}
                className="absolute right-5 top-5 z-30 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all duration-150 active:scale-90"
              >
                <FaTimes className="w-4 h-4" />
              </button>

              {/* Main Content Container */}
              <div className="w-full p-8 md:p-10 flex flex-col justify-between relative">
                {/* Glow lights */}
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-500/5 blur-[50px] pointer-events-none" />

                {!isClaimed ? (
                  /* STEP 1: Presentation */
                  <div className="flex-1 flex flex-col justify-center">
                    {/* Partner Header */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center text-sm font-black tracking-tight select-none">
                        <span className="text-blue-600">Snap</span>
                        <span className="text-yellow-500">cart</span>
                      </div>
                      <span className="text-slate-300 text-xs font-bold">×</span>
                      <div className="flex items-center gap-1">
                        <FlipLabLogoSvg className="w-5 h-5" />
                        <div className="text-xs tracking-tight select-none">
                          <span className="font-extrabold text-slate-800">Flip</span>
                          <span className="font-medium text-slate-500">Lab</span>
                        </div>
                      </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                      Mở khóa gói thành viên <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">FlipLab Pro</span>
                    </h2>
                    
                    <p className="text-xs text-slate-500 mt-2.5 mb-6 leading-relaxed font-medium">
                      Đặc quyền ưu đãi lớn nhất trong năm dành riêng cho tài khoản SnapCart. Trải nghiệm hệ thống học từ vựng, ôn luyện thi cử khoa học và ghi nhớ dài hạn với công nghệ AI hàng đầu.
                    </p>

                    {/* Features List */}
                    <div className="space-y-3 mb-6">
                      {features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full ${feat.bgColor} text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 shadow-sm`}>
                            ✓
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 leading-tight">{feat.title}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-normal">{feat.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Primary Button */}
                    <button
                      onClick={handleClaim}
                      className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 text-xs tracking-wider uppercase transition-all duration-200 shadow-md shadow-blue-500/10 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      Nhận mã kích hoạt Pro miễn phí <FaArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  /* STEP 2: Code revealed */
                  <div className="flex-1 flex flex-col justify-center items-center text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 animate-scaleUp">
                      <FaCheck className="w-5 h-5" />
                    </div>
                    
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Mã kích hoạt của bạn đã sẵn sàng!
                    </h2>
                    <p className="text-xs text-slate-500 mt-2 font-medium max-w-sm">
                      Copy mã bên dưới và truy cập website đối tác FlipLab để nâng cấp lên tài khoản Pro miễn phí.
                    </p>

                    {/* Coupon Ticket Container */}
                    <div className="w-full max-w-[360px] bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-5 my-6 relative overflow-hidden group shadow-inner">
                      
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2 select-none">Mã kích hoạt độc quyền</p>
                      <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 text-base font-extrabold text-blue-600 tracking-wider flex items-center justify-center select-all shadow-sm">
                        SNAPCART_FLIPLAB_PRO
                      </div>
                      
                      <button
                        onClick={handleCopy}
                        className={`mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all duration-300 ${
                          isCopied 
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10" 
                          : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <FaCheck className="w-4 h-4" /> Đã sao chép!
                          </>
                        ) : (
                          <>
                            <FaCopy className="w-4 h-4 text-slate-400" /> Sao chép mã kích hoạt
                          </>
                        )}
                      </button>
                    </div>

                    <a
                      href="https://fliplab.io.vn"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors py-2 px-4 bg-blue-50 rounded-full border border-blue-100/50"
                    >
                      Kích hoạt tại fliplab.io.vn <FaExternalLinkAlt className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Modal Footer Controls */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                  <span>* Áp dụng cho mọi tài khoản SnapCart</span>
                  <button
                    onClick={() => handleDismiss(true)}
                    className="hover:text-slate-600 underline transition-colors"
                  >
                    Không hiển thị lại
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleUp {
          animation: scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </>
  );
}
