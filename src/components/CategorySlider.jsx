import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, FreeMode, Mousewheel } from 'swiper/modules';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';

const categories = [
    { name: "faceCreamsc2-aesc-Face%20Cream", displayName: 'Creams', color: 'from-blue-50' },
    { name: 'soapssc2-aesc-Soaps', displayName: 'Soaps', color: 'from-pink-50' },
    { name: 'hairShampoossc2-aesc-Hair%20Shampoos', displayName: 'Shampoos', color: 'from-purple-50' },
    { name: 'Freshner&Repellents-aesc-Freshner%20&%20Repellents', displayName: 'Fresheners', color: 'from-green-50' },
    { name: 'hairOilsc2-aesc-Hair%20Oil', displayName: 'Hair Oil', color: 'from-yellow-50' },
    { name: 'toothpastesc2-aesc-ToothPaste', displayName: 'Toothpaste', color: 'from-cyan-50' },
    { name: 'Eyecare-aesc-Eye%20Care', displayName: 'Eyeliners', color: 'from-orange-50' }
];

const imgPaths = [
    "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2Fb1909dfd-726c-412b-beb7-9553bc909363.jpeg?alt=media&token=78e483ed-74cd-4db8-89f1-8dfefb4aec4a",
    "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2F85efc2e5-e755-4a11-acc4-a330124b2084.jpeg?alt=media&token=9e2e0087-679c-4bd0-9a8c-cffb4d2f97df",
    "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2Fdb4f1d77-d089-4b0a-822a-c99354195258.jpeg?alt=media&token=5c43e1c3-ac4e-4aa8-912d-4b05b5dca65c",
    "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2F162b6151-c334-4591-8d34-1a550acfadd2.jpeg?alt=media&token=fc1eb231-9d3b-4c79-8d95-bad52d66ba26",
    "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2F11385813-64a1-4c03-a134-b5e75ed75213.jpeg?alt=media&token=d021e007-dd08-48bb-a6e6-2d115a102e85",
    "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2Fefef1eef-7ff3-487e-b543-1eb2b489304e.jpeg?alt=media&token=9740ad8a-0c70-452b-bf40-1afeae8a42fa",
    "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2F20230210-1454291.jpeg?alt=media&token=c1080862-b844-4609-9c39-ab4e35fede78"
];

const CategorySlider = () => {
    const navigate = useNavigate();

    return (
        <section className="py-8 md:py-16 bg-white overflow-hidden select-none">
            <div className="max-w-[1440px] mx-auto px-4 md:px-12 relative group">
                
                {/* Header Section */}
                <div className="flex items-end justify-between mb-8 px-2">
                    <div className="flex flex-col">
                        <span className="text-blue-600 font-bold text-[10px] md:text-[11px] uppercase tracking-[0.3em] opacity-70">Handpicked</span>
                        <h2 className="text-2xl md:text-5xl font-black text-gray-900 tracking-tighter italic leading-none">Top Categories</h2>
                    </div>
                    
                    {/* Navigation Buttons linked to Swiper Classes */}
                    <div className="flex gap-2.5">
                        <button className="prev-nav h-10 w-10 md:h-12 md:w-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300 shadow-sm active:scale-90 bg-white">
                            <ChevronLeftIcon className="h-5 w-5 md:h-6 md:w-6" />
                        </button>
                        <button className="next-nav h-10 w-10 md:h-12 md:w-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300 shadow-sm active:scale-90 bg-white">
                            <ChevronRightIcon className="h-5 w-5 md:h-6 md:w-6" />
                        </button>
                    </div>
                </div>

                {/* Swiper Implementation */}
                <Swiper
                    modules={[Navigation, Pagination, FreeMode, Mousewheel]}
                    spaceBetween={16}
                    slidesPerView={2.3} 
                    freeMode={true}     
                    grabCursor={true}   
                    mousewheel={{ forceToAxis: true }} 
                    navigation={{
                        prevEl: '.prev-nav',
                        nextEl: '.next-nav',
                    }}
                    breakpoints={{
                        640: { slidesPerView: 3.5, spaceBetween: 24 },
                        1024: { slidesPerView: 5, spaceBetween: 30, freeMode: false },
                        1280: { slidesPerView: 6, spaceBetween: 30, freeMode: false }
                    }}
                    className="category-swiper !py-8"
                >
                    {categories.map((item, idx) => (
                        <SwiperSlide key={idx} className="!h-auto">
                            <div 
                                onClick={() => navigate(`/category/${item.name}`)}
                                className="relative group cursor-pointer h-full"
                            >
                                {/* Card Body */}
                                <div className={`relative h-full w-full rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-b ${item.color} to-white border border-gray-50 p-4 md:p-6 flex flex-col items-center transition-all duration-500 group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] md:group-hover:-translate-y-4`}>
                                    
                                    {/* Image Container - Square & Large for Mobile */}
                                    <div className="relative w-full aspect-square flex items-center justify-center bg-white rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-6 shadow-inner shadow-gray-50 mb-4 overflow-hidden border border-gray-100">
                                        <div className="absolute inset-0 bg-white/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <img 
                                            src={imgPaths[idx]} 
                                            alt={item.displayName}
                                            className="relative z-10 w-full h-full object-contain mix-blend-multiply transition-all duration-700 md:group-hover:scale-125 md:group-hover:-rotate-6 pointer-events-none drop-shadow-xl"
                                        />
                                    </div>

                                    {/* Text Section */}
                                    <div className="text-center w-full mt-auto">
                                        <h3 className="text-xs md:text-lg font-black text-gray-800 tracking-tight group-hover:text-blue-600 transition-colors">
                                            {item.displayName}
                                        </h3>
                                        <div className="hidden md:block mt-2 h-1 w-0 bg-blue-600 mx-auto rounded-full transition-all duration-300 group-hover:w-8"></div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default CategorySlider;