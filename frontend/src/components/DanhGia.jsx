import { useState } from "react";
import { FaStar, FaComment, FaReply, FaPaperPlane } from "react-icons/fa"; 

export default function DanhGia({ sanPhamHienTai }) {
    const sao = [1, 2, 3, 4, 5];
    
    const [reviews, setReviews] = useState([
        { rating: 5, mau: "bg-green-600", name: "Nguyễn Nam", bd: "N",  cmt: "Sản phẩm chất lượng tốt", replies: [] },
        { rating: 4, mau: "bg-red-600", name: "Tran Quang", bd: "T", cmt: "đã mua hàng, chất lượng tốt", replies: [] },
        { rating: 5, mau: "bg-blue-600", name: "Anh Bảo", bd: "A", cmt: "giao nhanh , dv ổn", replies: [] },
        { rating: 5, mau: "bg-green-600", name: "Lê Quốc Huy", bd: "L", cmt: "nhân viên nhiệt tình. hỗ trợ tốt", replies: [] },
    ]);

    const totalReviews = reviews.length;
    const averageRating = totalReviews === 0 
        ? 0 
        : (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews).toFixed(1);

    const danhgia = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => (r.rating || 5) === star).length;
        const tile = totalReviews === 0 ? 0 : Math.round((count / totalReviews) * 100);
        return { sao: star, tile, sodg: count };
    });

    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReviewText, setNewReviewText] = useState("");
    const [rating, setRating] = useState(5);
    
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");

    const handleSubmitReview = () => {
        if (!newReviewText.trim()) return;
        setReviews([{ rating, mau: "bg-yellow-500", name: "Bạn (Mới)", bd: "B", cmt: newReviewText, replies: [] }, ...reviews]);
        setNewReviewText("");
        setRating(5);
        setShowReviewForm(false);
    };

    const handleSubmitReply = (index) => {
        if (!replyText.trim()) return;
        const newReviews = [...reviews];
        newReviews[index].replies.push({ name: "Bạn (Phản hồi)", cmt: replyText });
        setReviews(newReviews);
        setReplyText("");
        setReplyingTo(null);
    };
    
    return (
        <div className="p-3 md:p-5 bg-gray-50 rounded-xl flex flex-col gap-5">
            {/* Thêm dấu ? để an toàn dữ liệu */}
            <h1 className="font-bold text-2xl text-gray-800">
                Đánh giá {sanPhamHienTai?.label}
            </h1>
            
            {/* 1. KHUNG TỔNG QUAN ĐÁNH GIÁ */}
            <div className="bg-white rounded-xl p-5 md:p-10 flex flex-col md:flex-row gap-8 shadow-sm border border-gray-100">
                
                {/* Cột Trái */}
                <div className="flex flex-col gap-2 items-center justify-center w-full md:w-[220px] shrink-0 md:border-r border-gray-200 md:pr-5">
                    <h2 className="font-bold text-6xl flex items-baseline">
                        {averageRating}<span className="text-gray-400 font-semibold text-3xl ml-1">/5</span>
                    </h2>
                    <div className="flex gap-2 items-center text-xl mt-2">
                        {sao.map((i, index) => (
                            <FaStar key={index} className={i <= Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"} />
                        ))}
                    </div>
                    <p className="text-gray-500 font-medium mt-1">{totalReviews} lượt đánh giá</p>
                    <button 
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="mt-3 bg-[#d7000e] py-2.5 rounded-lg w-full hover:bg-red-700 transition-colors shadow-sm">
                        <span className="text-white font-semibold text-[15px]">{showReviewForm ? "Hủy đánh giá" : "Viết đánh giá"}</span>
                    </button>
                </div>

                {/* Cột Phải */}
                <div className="w-full flex flex-col justify-center md:pl-6 gap-3">
                    {danhgia.map((item, index) => {
                        const phantram = item.tile;
                        return (
                            <div key={index} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-10 shrink-0 justify-end">
                                    <p className="text-base font-semibold text-gray-700">{item.sao}</p>
                                    <FaStar className="text-yellow-400 text-sm" />
                                </div>
                                
                                <div className="bg-gray-100 rounded-full flex-1 overflow-hidden h-2.5">
                                    <div 
                                        className="h-full bg-[#d7000e] rounded-full"
                                        style={{ width: `${phantram}%` }}
                                    ></div>
                                </div>
                                
                                <p className="text-gray-500 font-medium text-sm w-12 shrink-0 text-right">
                                    {item.tile}%
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* FORM VIẾT ĐÁNH GIÁ (Ẩn/Hiện) */}
            {showReviewForm && (
                <div className="bg-white rounded-xl p-5 border border-red-100 shadow-sm animate-fadeIn mt-2">
                    <h3 className="font-bold text-gray-800 mb-3 text-lg">Đánh giá của bạn</h3>
                    <div className="flex gap-2 mb-4">
                        {sao.map((i) => (
                            <FaStar 
                                key={i} 
                                className={`text-2xl cursor-pointer transition-colors ${rating >= i ? 'text-yellow-400' : 'text-gray-300'}`}
                                onClick={() => setRating(i)}
                            />
                        ))}
                    </div>
                    <textarea 
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        placeholder="Mời bạn chia sẻ cảm nhận về sản phẩm..."
                        className="w-full border border-gray-200 rounded-xl p-3 h-28 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 resize-none text-sm"
                    ></textarea>
                    <div className="flex justify-end mt-3">
                        <button 
                          onClick={handleSubmitReview}
                          className="bg-[#d7000e] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors flex items-center gap-2">
                            <FaPaperPlane /> Gửi đánh giá
                        </button>
                    </div>
                </div>
            )}

            {/* 2. KHUNG DANH SÁCH BÌNH LUẬN */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm mt-2"> 
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">
                    Tất cả đánh giá
                </h2>
                
                <div className="flex flex-col">
                    {reviews.map((item, index) => (
                        <div key={index} className="flex flex-col py-5 border-b border-gray-50 last:border-0 last:pb-0 first:pt-2">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`w-11 h-11 shrink-0 ${item.mau} rounded-full flex justify-center items-center shadow-sm`}>
                                        <p className="text-lg font-bold text-white uppercase">{item.bd}</p>
                                    </div>
                                    
                                    <div className="flex flex-col gap-1 mt-0.5">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[15px] font-bold text-gray-900">{item.name}</h3>
                                            <div className="flex text-[10px]">
                                                {sao.map((i) => (
                                                    <FaStar key={i} className={i <= (item.rating || 5) ? "text-yellow-400" : "text-gray-300"} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-gray-600 text-[14px] flex items-start gap-2 leading-relaxed pr-4 mt-1">
                                            <FaComment className="mt-1 text-gray-300 shrink-0 text-sm"/>
                                            <span>{item.cmt}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="shrink-0 ml-2">
                                    <button 
                                      onClick={() => setReplyingTo(replyingTo === index ? null : index)}
                                      className="py-1.5 px-4 bg-gray-50 text-gray-600 hover:bg-gray-200 rounded-lg font-medium text-xs transition-colors border border-gray-200 flex items-center gap-1.5">
                                        <FaReply className="text-[10px]" /> Phản hồi
                                    </button>
                                </div>
                            </div>

                            {/* Danh sách phản hồi */}
                            {item.replies && item.replies.length > 0 && (
                                <div className="ml-14 mt-4 flex flex-col gap-3 border-l-2 border-gray-100 pl-4">
                                    {item.replies.map((reply, rIndex) => (
                                        <div key={rIndex} className="flex flex-col gap-1">
                                            <span className="font-bold text-sm text-gray-800">{reply.name}</span>
                                            <p className="text-gray-600 text-[13px]">{reply.cmt}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Form Phản hồi */}
                            {replyingTo === index && (
                                <div className="ml-14 mt-4 animate-fadeIn">
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Viết phản hồi của bạn..."
                                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSubmitReply(index);
                                            }}
                                        />
                                        <button 
                                            onClick={() => handleSubmitReply(index)}
                                            className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-900 transition-colors"
                                        >
                                            Gửi
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            
        </div>
    );
}