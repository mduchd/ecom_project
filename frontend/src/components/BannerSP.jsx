
export default function BannerSp( {sanPhamHienTai, onMuaNgay}){
 
    return(
        <div className="flex">
            <div className="fixed z-50 bottom-2  left-0 right-0 mx-auto h-20 w-full max-w-4xl px-4 py-2 bg-white 
            shadow-md rounded-xl flex justify-between shadow-lg border border-gray-100">
                <div className=" rounded-lg flex items-center p-2 gap-5">
                    <img src={sanPhamHienTai.image} className="h-full object-contain" alt="Tai nghe" />
                    <p className="font-bold text-lg">{sanPhamHienTai.name} | Chính hãng VNA</p>
                </div> 
                <div className="flex gap-4 items-center">
                    <div className="flex flex-col justify-center items-center">
                        <p className="text-red-600 font-bold text-lg">{sanPhamHienTai.price}$</p>
                        <p className="text-gray-400 line-through">990$</p>
                    </div>
                    <button onClick={onMuaNgay} className="p-2 border h-10 bg-yellow-300 rounded-xl hover:bg-yellow-200 hover:scale-102 active:scale-95 transition-all">
                        <span  className="text-gray-700 font-bold">Mua Ngay</span>
                    </button>
                </div>
                
            </div>
            
        </div>
    )
}