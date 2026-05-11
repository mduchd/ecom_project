import React from 'react';

const FAQ = () => {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h2 className="text-3xl font-bold mb-8 text-center">Câu hỏi thường gặp</h2>
      <div className="space-y-4">
        <details className="p-5 border rounded-lg group bg-white shadow-sm cursor-pointer open:bg-blue-50 transition-colors">
          <summary className="font-semibold text-lg list-none flex justify-between items-center outline-none">
            Làm thế nào để theo dõi đơn hàng?
            <span className="group-open:rotate-180 transition-transform text-2xl text-blue-600">+</span>
          </summary>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Bạn có thể nhấn vào nút "Track Order" trên thanh menu ở góc phải màn hình, sau đó nhập mã đơn hàng của bạn để xem trạng thái vận chuyển hiện tại.
          </p>
        </details>
        <details className="p-5 border rounded-lg group bg-white shadow-sm cursor-pointer open:bg-blue-50 transition-colors">
          <summary className="font-semibold text-lg list-none flex justify-between items-center outline-none">
            Chính sách đổi trả của Snapcart như thế nào?
            <span className="group-open:rotate-180 transition-transform text-2xl text-blue-600">+</span>
          </summary>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Chúng tôi hỗ trợ đổi trả miễn phí trong vòng 7 ngày đối với các sản phẩm bị lỗi từ nhà sản xuất hoặc giao sai mẫu mã, yêu cầu sản phẩm còn nguyên tem mác.
          </p>
        </details>
        <details className="p-5 border rounded-lg group bg-white shadow-sm cursor-pointer open:bg-blue-50 transition-colors">
          <summary className="font-semibold text-lg list-none flex justify-between items-center outline-none">
            Hệ thống hỗ trợ những phương thức thanh toán nào?
            <span className="group-open:rotate-180 transition-transform text-2xl text-blue-600">+</span>
          </summary>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Snapcart hiện đang hỗ trợ thanh toán trực tuyến qua cổng VNPAY, ví điện tử Momo và phương thức thanh toán tiền mặt khi nhận hàng (COD).
          </p>
        </details>
      </div>
    </div>
  );
};

export default FAQ;