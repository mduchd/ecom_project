import { Link } from 'react-router-dom';

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
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Quick Links</h3>
                        <ul className="space-y-2.5">
                            <li><Link to="/shop" className="text-sm hover:text-blue-400 transition-colors">All Products</Link></li>
                            <li><Link to="/cart" className="text-sm hover:text-blue-400 transition-colors">Shopping Cart</Link></li>
                            <li><Link to="/login" className="text-sm hover:text-blue-400 transition-colors">My Account</Link></li>
                            <li><Link to="/checkout" className="text-sm hover:text-blue-400 transition-colors">Checkout</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Customer Service</h3>
                        <ul className="space-y-2.5">
                            <li><Link to="/faq" className="text-sm hover:text-blue-400 transition-colors">Help Center / FAQ</Link></li>
                            <li><Link to="/contact" className="text-sm hover:text-blue-400 transition-colors">Contact Us</Link></li>
                            <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Returns & Exchanges</a></li>
                            <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Shipping Info</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Newsletter</h3>
                        <p className="text-sm text-gray-400 mb-4 leading-relaxed">Đăng ký để nhận thông báo về các ưu đãi mới nhất và giảm giá độc quyền.</p>
                        <form className="flex">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-l-lg outline-none focus:border-blue-500 text-sm text-white placeholder-gray-500 transition-colors"
                            />
                            <button
                                type="button"
                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-r-lg transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>

                </div>

                {/* Bottom section */}
                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500">
                        &copy; 2026 Snapcart. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/200px-PayPal.svg.png" alt="PayPal" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;