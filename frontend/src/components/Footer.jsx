import { Link } from 'react-router-dom';
import { FaCcVisa, FaCcMastercard, FaCcPaypal, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800 mt-10">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-1 select-none">
                            <span className="text-2xl font-black tracking-tight">
                                <span className="text-blue-500">Snap</span>
                                <span className="text-yellow-400">cart</span>
                            </span>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Nền tảng mua sắm trực tuyến hàng đầu với hàng ngàn sản phẩm công nghệ chất lượng cao. Trải nghiệm ngay hôm nay!
                        </p>
                        <div className="flex gap-4 pt-2">
                            {/* Social Icons Dummy */}
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors" title="Twitter">
                                <FaTwitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors" title="Instagram">
                                <FaInstagram className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Liên kết nhanh */}
                    <div>
                        <h3 className="text-white font-bold mb-4 text-sm tracking-wider text-vi">Liên kết nhanh</h3>
                        <ul className="space-y-2.5">
                            <li><Link to="/shop" className="text-sm hover:text-blue-400 transition-colors">Tất cả sản phẩm</Link></li>
                            <li><Link to="/cart" className="text-sm hover:text-blue-400 transition-colors">Giỏ hàng</Link></li>
                            <li><Link to="/login" className="text-sm hover:text-blue-400 transition-colors">Tài khoản của tôi</Link></li>
                            <li><Link to="/checkout" className="text-sm hover:text-blue-400 transition-colors">Thanh toán</Link></li>
                        </ul>
                    </div>

                    {/* Hỗ trợ khách hàng */}
                    <div>
                        <h3 className="text-white font-bold mb-4 text-sm tracking-wider text-vi">Hỗ trợ khách hàng</h3>
                        <ul className="space-y-2.5">
                            <li><Link to="/faq" className="text-sm hover:text-blue-400 transition-colors">Trung tâm trợ giúp / FAQ</Link></li>
                            <li><Link to="/contact" className="text-sm hover:text-blue-400 transition-colors">Liên hệ</Link></li>
                            <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Đổi trả</a></li>
                            <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Thông tin giao hàng</a></li>
                        </ul>
                    </div>

                    {/* Bản tin */}
                    <div>
                        <h3 className="text-white font-bold mb-4 text-sm tracking-wider text-vi">Bản tin</h3>
                        <p className="text-sm text-gray-400 mb-4 leading-relaxed">Đăng ký để nhận thông báo về các ưu đãi mới nhất và giảm giá độc quyền.</p>
                        <form className="flex">
                            <input
                                type="email"
                                placeholder="Email của bạn"
                                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-l-lg outline-none focus:border-blue-500 text-sm text-white placeholder-gray-500 transition-colors"
                            />
                            <button
                                type="button"
                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-r-lg transition-colors"
                            >
                                Đăng ký
                            </button>
                        </form>
                    </div>

                </div>

                {/* Bottom section */}
                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500">
                        &copy; 2026 Snapcart. Bảo lưu mọi quyền.
                    </p>
                    <div className="flex gap-4 text-3xl text-gray-500">
                        <FaCcVisa className="hover:text-blue-500 opacity-60 hover:opacity-100 transition-all cursor-pointer" title="Visa" />
                        <FaCcMastercard className="hover:text-orange-500 opacity-60 hover:opacity-100 transition-all cursor-pointer" title="Mastercard" />
                        <FaCcPaypal className="hover:text-blue-400 opacity-60 hover:opacity-100 transition-all cursor-pointer" title="PayPal" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
