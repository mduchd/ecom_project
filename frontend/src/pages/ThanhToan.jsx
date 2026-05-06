
import { useState } from "react";
import { FaShippingFast, FaCreditCard , FaMoneyCheckAlt , FaMoneyBill , FaWallet, FaMoneyBillWave, FaPaypal, FaArrowRight  } from "react-icons/fa";
import { FaMoneyBills } from "react-icons/fa6";

export default function ThanhToan() {
 
  const info_ct =[
    {label: "Full Name", place: "Nhập tên của bạn..."},
    {label: "Phone Number", place: "Nhập số điện thoại..."},
  ];
  const info_ar = [
    {label: "City", name: "city", type: "select", options: ["Hà Nội", "TP.HCM", "Đà Nẵng"]},
    {label: "Postal Code", name: "postalCode", type: "input", placeholder: "Nhập mã bưu chính..."},
  ];
  const pay_method =[
    {icon: FaCreditCard, label: "Credit Card"},
    {icon: FaPaypal, label: "PayPal"},
    {icon: FaMoneyBill, label: "Cash"},
  ];
  const info_card = [
    {label: "Expiry Date", place: "MM/YY"},
    {label: "CVV", place: "123"},
  ];
  const total = [
    {label: "Subtotal", value: "$360.00"},
    {label: "Shipping", value: "FREE"},
    {label: "Tax", value: "$29.02"},
  ];
  const giamacdinh = 2000;
  return (
    <div className="bg-gray-50 min-h-screen">
      <main className={"max-w-7xl mx-auto px-10 py-5 grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-12 bg-white shadow-sm border border-gray-100 flex"}>
        
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold">Secure Checkout</h1>
          {/**Delivery Infomation */}
          <div className ="bg-white p-4 rounded-lg flex flex-col gap-3 border border-gray-200">
            <div className="flex items-center gap-4">
              <FaShippingFast className="text-xl text-blue-600" />
              <h2 className="text-2xl ">Delivery Infomation</h2>
            </div>

            <div className="flex justify-between gap-5">
              {info_ct.map((item, index) => (
                <div className="flex flex-col w-1/2 gap-2">
                <span className="font-bold">{item.label}</span>
                <input placeholder={item.place}
                 className="h-10 w-full border border-gray-200 rounded-lg p-1">
                </input>
              </div>
              ))}
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="font-bold">Shipping Address</span>
              <input 
              placeholder={"Nhập địa chỉ nhận hàng..."}
              className="h-10 w-full border border-gray-200 p-1 rounded-lg">
              </input>
            </div>

            <div className ="flex justify-between gap-4">
              {info_ar.map((item) => (
                <div key={item.name} className="flex flex-col gap-2 w-full">
                  <span className="font-bold">{item.label}</span>
                  {item.type ==="select" ? (
                    <select className = "h-10 w-full border border-gray-200 rounded-lg p-1">
                      <option value ="">Chọn</option>
                      {item.options.map((opt, i)=> (

                        <option key={i} value={opt} >
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) :(
                    <input placeholder={item.placeholder} className ={"h-10 border border-gray-200 rounded-lg p-1"}></input>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/**Payment Method */}
          <div className="bg-white flex flex-col gap-3 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <FaWallet  />
                <h2>Payment Method</h2>
              </div>
              <div className="flex justify-between items-center gap-5">
                {pay_method.map((item, index)=>(
                  <div className="p-4 w-full border border-gray-300 flex flex-col justify-center items-center gap-2 hover:bg-gray-200 rounded-lg hover:scale-105 
                  active:scale-98 transition-all duration-200 cursor-pointer">
                    <item.icon className="text-xl" />
                    <span className="font-bold">{item.label}</span>
                  </div>
                ))}
              </div>
              <span className="font-bold">Card Number</span>
              <input placeholder="0000 0000 0000 0000" className="h-10 border border-gray-200 rounded-lg p-2">
              </input>
              <div className="flex justify-between gap-5">
                {info_card.map((i, index)=>(
                  <div className="w-full flex flex-col gap-2">
                    <span className="font-bold">{i.label}</span>
                    <input placeholder={i.place} 
                    className="border border-gray-200 p-2 rounded-lg">
                    </input>
                  </div>
                ))}
              </div>
          </div>
        </div>
        {/**Thẻ phải */}
        <div className="w-full flex flex-col p-5 bg-white rounded-lg gap-3 border border-gray-200">
          <span className="font-semibold text-2xl">Order Summary</span>
          <div className="flex">
             <img src="./nike1.jpg" alt="product" className ="w-20 h-20 object-cover bg-gray-100" />
            <div className="ml-5 flex flex-col justify-center gap-1">
                <span className="font-bold text-gray-800 text-[15px]">Air Max Catalyst</span>
                  <p className="text-gray-600 text-sm">Size: US10 | Color: Racing Red</p>
                  <span className="font-semibold text-[15px]">$120.00</span>
            </div>
          </div>
          <div className="flex">
             <img src="./nike4.jpg" alt="product" className ="w-20 h-20 object-cover bg-gray-100" />
            <div className="ml-5 flex flex-col justify-center gap-1">
                <span className="font-bold text-gray-800 text-[15px]">Air Max Catalyst</span>
                  <p className="text-gray-600 text-sm">Size: US10 | Color: Racing Red</p>
                  <span className="font-semibold text-[15px]">$120.00</span>
            </div>
          </div>
          <div className="flex">
             <img src="./nike5.jpg" alt="product" className ="w-20 h-20 object-cover bg-gray-100" />
            <div className="ml-5 flex flex-col justify-center gap-1">
                <span className="font-bold text-gray-800 text-[15px]">Air Max Catalyst</span>
                  <p className="text-gray-600 text-sm">Size: US10 | Color: Racing Red</p>
                  <span className="font-semibold text-[15px]">$120.00</span>
            </div>
          </div>

          <div className="h-0 w-full border border-gray-300 "></div>
          {total.map((i, index)=>(
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">{i.label}</span>
              <span className="font-semibold">{i.value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-semibold">Total</span>
            <span className="font-semibold text-xl">{giamacdinh}</span>
          </div>

          <a href={`https://qr.sepay.vn/img?bank=Vietcombank&acc=9339582134&template=compact&amount=32000&des=`}
           className=" flex items-center justify-center gap-2 border 
          p-2 bg-blue-600 rounded-lg hover:scale-105 hover:bg-blue-700 shadow-lg 
          active:scale-95 transition-all hover:shadow-gray-700 duration-300 cursor-pointer">
            <span className="text-white font-bold text-xl tracking-widest">PLACE ORDER</span>
            <FaArrowRight className="text-white"/>
          </a>
        </div>
      </main>
    </div>
  );
}