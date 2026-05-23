import React, { useState } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';

const Contact = () => {
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowToast(true);
    e.target.reset();
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="container mx-auto py-16 px-4 relative">
      {showToast && (
        <div className="fixed top-24 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-bounce">
          <FaCheckCircle className="text-white text-lg flex-shrink-0" /> Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất.
        </div>
      )}
      
      <h2 className="text-3xl font-bold text-center mb-12">Liên hệ với Snapcart</h2>
      
      <div className="flex flex-wrap -mx-4">
        <div className="w-full md:w-3/5 px-4 mb-8 md:mb-0">
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <h3 className="text-xl font-bold mb-6">Gửi tin nhắn cho chúng tôi</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input type="text" placeholder="Họ và tên" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" required />
                <input type="email" placeholder="Email của bạn" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" required />
              </div>
              <input type="text" placeholder="Chủ đề" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" required />
              <textarea placeholder="Nội dung chi tiết..." className="w-full p-3 border rounded-lg h-40 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none" required></textarea>
              <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold w-full md:w-auto">
                Gửi Thông Tin
              </button>
            </form>
          </div>
        </div>
        
        <div className="w-full md:w-2/5 px-4">
          <div className="bg-blue-50 p-8 rounded-xl h-full border border-blue-100">
            <h3 className="text-xl font-bold mb-6 text-blue-900">Thông tin liên hệ</h3>
            <div className="space-y-4 text-blue-800">
              <p className="flex items-center gap-3">
                <FaPhoneAlt className="text-blue-600 text-lg flex-shrink-0" /> 
                <span><strong>Hotline:</strong> 088-24586945</span>
              </p>
              <p className="flex items-center gap-3">
                <FaEnvelope className="text-blue-600 text-lg flex-shrink-0" /> 
                <span><strong>Email:</strong> support@snapcart.com</span>
              </p>
              <p className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-blue-600 text-lg flex-shrink-0" /> 
                <span><strong>Địa chỉ:</strong> Hà Nội, Việt Nam</span>
              </p>
            </div>
            
            <hr className="my-8 border-blue-200" />
            
            <h4 className="font-bold mb-4 text-blue-900">Giờ làm việc</h4>
            <div className="space-y-2 text-blue-800">
              <p className="flex justify-between"><span>Thứ 2 - Thứ 6:</span> <strong>8:00 - 18:00</strong></p>
              <p className="flex justify-between"><span>Thứ 7 - Chủ Nhật:</span> <strong>9:00 - 17:00</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;