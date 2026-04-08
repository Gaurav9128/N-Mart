import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel } from 'flowbite-react';
import Navbar from '../components/Navbar';
import CategorySlider from '../components/CategorySlider';
import FooterComponent from '../components/FooterComponent';
import BestSeller from '../components/BestSeller';
import TrendingProducts from '../components/TrendingProducts';
import FeaturesSection from '../components/FeaturesSection';

const Home = () => {
  const navigate = useNavigate();

  // 1. Top Banners Data
  const topBanners = [
    { src: "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2Fdownload%20(4).jpg?alt=media&token=b4599828-ea13-4eee-9c82-9157d03af443", path: "/category/hairShampoossc2-aesc-Hair%20Shampoos" },
    { src: "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2F06c5f85b3891bbbe6e36a2a38096e4f4.jpg?alt=media&token=b889744f-9f90-4b10-8b20-20296c35cda5", path: "/category/faceCreamsc2-aesc-Face%20Cream" },
    { src: "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2FBlog_Banner_1024x1024.webp?alt=media&token=5a47789a-f5d2-463c-b9b2-cb5569c66e4f", path: "/category/faceMasksc2-aesc-Face%20Mask" },
    { src: "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2FCOL0035_A1.jpeg?alt=media&token=7035bdef-b74f-47f4-b559-8cfabdbe4f45", path: "/category/toothpastesc2-aesc-ToothPaste" }
  ];

  // 2. Bottom Banners Data (Including your new Hair Comb link)
  const bottomBanners = [
  {
    src: "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2F8fce3e6684d8251a23d2b0c1a055cd49.jpg?alt=media&token=6a216520-2a00-4cf8-94c2-6854bd372b17",
    path: "/category/men'sdeos&perfumessc2-aesc-Men's%20Deos%20&%20Perfumes"
  },
  {
    src: "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2FFacewash_Website_Media_Banner_2160_x_741.webp?alt=media&token=4ede902c-4d92-4668-ad77-e0d6b5a0494b",
    path: "/category/hairOilssc2-aesc-Hair Oil"
  },
  {
    src: "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2F06c5f85b3891bbbe6e36a2a38096e4f4.jpg?alt=media&token=b889744f-9f90-4b10-8b20-20296c35cda5",
    path: "/category/faceCreamsc2-aesc-Face%20Cream"
  }
];

  return (
    <div className='bg-[#f9f9f9] min-h-screen overflow-x-hidden pb-10'>
      <Navbar />

      {/* 🚀 TOP CAROUSEL */}
      <div className="max-w-[1400px] mx-auto mt-24 md:mt-28 px-4">
        <div className="h-56 sm:h-72 md:h-96 lg:h-[480px] rounded-2xl overflow-hidden shadow-lg border">
          <Carousel slideInterval={4000} pauseOnHover>
            {topBanners.map((banner, idx) => (
              <div key={idx} className="h-full w-full bg-white cursor-pointer" onClick={() => navigate(banner.path)}>
                <img src={banner.src} className="h-full w-full object-cover md:object-fill" alt="banner" />
              </div>
            ))}
          </Carousel>
        </div>
      </div>

      {/* 📦 CATEGORY SLIDER (Arrows fixed inside container) */}
      <div className='max-w-[1400px] mx-auto mt-10 px-4'>
        <div className='relative bg-white border border-gray-100 rounded-xl shadow-sm py-6 px-10 overflow-hidden'>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Shop By Category</h2>
          <div className="category-slider-wrapper relative">
             <CategorySlider />
          </div>
        </div>
      </div>

      {/* 🏆 PRODUCT SECTIONS */}
      <div className='max-w-[1400px] mx-auto mt-8 px-4 space-y-10'>
        <section className='bg-white border rounded-2xl p-6 shadow-sm'><BestSeller /></section>
        <section className='bg-white border rounded-2xl p-6 shadow-sm'><TrendingProducts /></section>
      </div>

      {/* 🖼️ MIDDLE STATIC BANNERS (Grid) */}
      <div className="max-w-[1400px] mx-auto px-4 mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">

  <div className="w-full h-[220px] bg-gray-100 rounded-xl shadow-sm flex items-center justify-center overflow-hidden cursor-pointer hover:scale-[1.02] transition-all"
       onClick={() => navigate("/search?searchItem=beardo")}>
    <img
      className="max-h-full max-w-full object-contain"
      src="https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2FBeard_banner_2ed8daef-d5c0-4cf9-b9f1-c220f4418a71.webp?alt=media&token=03bfa2c1-0ed3-42c6-ba69-6f143a187d75"
      alt="beardo"
    />
  </div>

  <div className="w-full h-[220px] bg-gray-100 rounded-xl shadow-sm flex items-center justify-center overflow-hidden cursor-pointer hover:scale-[1.02] transition-all"
       onClick={() => navigate("/category/soapssc2-aesc-Soaps")}>
    <img
      className="max-h-full max-w-full object-contain"
      src="https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2FWeb%20Banner%20Design%20-%20Al%20Imran.jpg?alt=media&token=c4aaf95f-f73c-4f5d-a2e6-460fd8f8a871"
      alt="soaps"
    />
  </div>

  <div className="w-full h-[220px] bg-gray-100 rounded-xl shadow-sm flex items-center justify-center overflow-hidden cursor-pointer hover:scale-[1.02] transition-all"
       onClick={() => navigate("/category/faceWashsc2-aesc-Face%20Wash")}>
    <img
      className="max-h-full max-w-full object-contain"
      src="https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2Fb4356ec366b314a491e8a5d71c1c3ae7.jpg?alt=media&token=72868d13-3304-40e3-b882-577fd61c7c4f"
      alt="facewash"
    />
  </div>

</div>

      {/* 🛡️ FEATURES */}
      <div className='max-w-[1400px] mx-auto mt-10 px-4'>
        <FeaturesSection />
      </div>

      {/* 📱 BOTTOM CAROUSEL (Restore) */}
      <div className='max-w-[1400px] mx-auto mt-10 mb-10 px-4'>
        <div className='h-48 md:h-80 rounded-2xl overflow-hidden shadow-lg border bg-white'>
          <Carousel indicators={false} leftControl=" " rightControl=" ">
            {bottomBanners.map((banner, idx) => (
              <div key={idx} className="h-full w-full cursor-pointer" onClick={() => navigate(banner.path)}>
                <img src={banner.src} className="h-full w-full object-cover" alt="bottom banner" />
              </div>
            ))}
          </Carousel>
        </div>
      </div>

      <FooterComponent />

      {/* 🛠️ CSS TO FIX SIDE ARROWS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .category-slider-wrapper .slick-prev, 
        .category-slider-wrapper .slick-next {
          z-index: 20;
          width: 45px;
          height: 45px;
          background: #fff !important;
          border-radius: 50%;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          display: flex !important;
          align-items: center;
          justify-content: center;
        }
        .category-slider-wrapper .slick-prev { left: -15px; }
        .category-slider-wrapper .slick-next { right: -15px; }
        .category-slider-wrapper .slick-prev:before, 
        .category-slider-wrapper .slick-next:before {
          color: #333 !important;
          font-size: 26px;
          opacity: 1;
        }
      `}} />
    </div>
  );
};

export default Home;