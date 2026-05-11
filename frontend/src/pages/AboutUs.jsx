import React from 'react';

const AboutUs = () => {
  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Về Snapcart</h1>
      <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
        Chúng tôi cung cấp giải pháp mua sắm hiện đại tích hợp AI, giúp bạn tìm thấy sản phẩm ưng ý nhất chỉ trong vài giây.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h3 className="text-xl font-bold mb-3 text-blue-600">Tốc độ</h3>
          <p className="text-gray-600">Trải nghiệm mua sắm và thanh toán nhanh chóng, mượt mà.</p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h3 className="text-xl font-bold mb-3 text-blue-600">AI Thông minh</h3>
          <p className="text-gray-600">Hệ thống AI gợi ý và tư vấn sản phẩm cá nhân hóa cho từng khách hàng.</p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h3 className="text-xl font-bold mb-3 text-blue-600">Hỗ trợ 24/7</h3>
          <p className="text-gray-600">Đội ngũ Snapcart luôn sẵn sàng giải đáp mọi thắc mắc của bạn.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;