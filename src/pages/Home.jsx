import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import CategorySlider from '../components/CategorySlider';
import { Carousel } from 'flowbite-react';
import FooterComponent from '../components/FooterComponent';
import CategoryBanner from '../components/CategoryBanner';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { UserVerifiedStatus } from '../hooks/useAuth';
import BestSeller from '../components/BestSeller';


const Home = () => {

  const navigate = useNavigate();
  const verify = UserVerifiedStatus();
  console.log("h", verify)

    

  return (
    <div className='bg-gray-100'>
        <Navbar />
        <div className="max-w-11/12 mt-28 md:mt-[100px] h-44 lg:h-60 xl:h-80 2xl:h-[300px]">
          <Carousel indicators={false} leftControl=" " rightControl=" ">
            <img className='h-full' onClick={() => { navigate("/category/hairShampoossc2-aesc-Hair%20Shampoos")}}  src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2F1.jpg?alt=media&token=30371cb2-2277-4456-a6df-b3e23f62ace4" alt="..." />
            <img className='h-full' onClick={() => { navigate("/category/faceCreamsc2-aesc-Face%20Cream")}} src="https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2FCream.jpeg?alt=media&token=84a5b91a-06d9-44e3-8168-9a4381b544f7" alt="..." />
            <img className='h-full' onClick={() => { navigate("/category/faceMasksc2-aesc-Face%20Mask")}} src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2F3.png?alt=media&token=10e5a6d2-f280-4f05-9256-3f6787a93c40" alt="..." />
            <img className='h-full' onClick={() => { navigate("/category/creams&Lotionssc2-aesc-Creams%20&%20Lotions")}} src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2F4.jpg?alt=media&token=b26c48e8-5df8-40e2-81f3-a4a2f287f85a" alt="..." />
            <img className='h-full' onClick={() => { navigate("/category/freshenerssc2-aesc-Fresheners")}} src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2F5.png?alt=media&token=ca31a388-43cb-4254-b64a-83a8b5cf6efe" alt="..." />
            <img className='h-full' onClick={() => { navigate("/category/toothpastesc2-aesc-ToothPaste")}} src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2F6.jpeg?alt=media&token=af4ebf09-eead-4339-8499-e0362f430034" alt="..." />
            <img className='h-full' onClick={() => { navigate("/category/eyelinerssc2-aesc-Eyeliners")}} src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2F7.jpeg?alt=media&token=ad75d0a2-a17f-4d58-ad0a-b68923f42479" alt="..." />
            <img className='h-full' onClick={() => { navigate("/category/hairShampoossc2-aesc-Hair%20Shampoos")}} src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2F8.png?alt=media&token=52f0419d-e4d1-4a4d-8a21-eed0852c8c87" alt="..." />
            <img className='h-full' onClick={() => { navigate("/category/hairOilsc2-aesc-Hair%20Oil")}} src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2F9.jpeg?alt=media&token=2bebf3b7-8fd7-4920-8f6b-a8522d46e77c" alt="..." />
            
          </Carousel>
        </div>
        <div className='relative mt-40 bg-white mt-8 md:mt-12 lg:mt-10 border-2 rounded-md py-2 px-4 w-11/12 mx-auto'>
        <CategorySlider />
        </div>
        {/* 🏆 Best Seller Section */}
<div className='relative mt-8 bg-white border-2 rounded-md py-4 px-4 w-11/12 mx-auto'>
  <BestSeller />
</div>

        <div className='mt-4 sm:mt-6 w-11/12 mx-auto p-1 sm:p-2 md:p-6 border-2 rounded-md bg-white'>
            <img className='w-full cursor-pointer' onClick={() => { navigate("/search?searchItem=beardo")}}  src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2F10.jpeg?alt=media&token=552c85f3-51eb-4bcd-a1f3-ed4c40cea3fb" alt="..." />
        </div>

        <div className='mt-4 sm:mt-6 w-11/12 mx-auto p-1 sm:p-2 md:p-6 border-2 rounded-md bg-white'>
            <img className='w-full cursor-pointer' onClick={() => { navigate("/category/soapssc2-aesc-Soaps")}}  src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2F15.jpeg?alt=media&token=8f523e95-0596-456e-81ad-93e3764225ec" alt="..." />
        </div>

        <div className='mt-4 sm:mt-6 w-11/12 mx-auto p-1 sm:p-2 md:p-6 border-2 rounded-md bg-white'>
            <img className='w-full cursor-pointer' onClick={() => { navigate("/category/faceWashsc2-aesc-Face%20Wash")}} src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2F16.jpeg?alt=media&token=776e8182-dfb0-42fe-aa97-7dd5869beccd" alt="..." />
        </div>

        <div className='my-4 sm:mt-6 w-11/12 h-[150px] sm:h-96 mx-auto p-1 sm:p-2 md:p-6 border-2 rounded-md bg-white'>
          <Carousel indicators={false} leftControl=" " rightControl=" ">
            <img className='h-full cursor-pointer' onClick={() => { navigate("/category/men'sdeos&perfumessc2-aesc-Men's%20Deos%20&%20Perfumes")}} src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2F18.jpeg?alt=media&token=9fa52f95-3823-4dc8-8c73-083e547640f1" alt="..." />
            <img className='h-full cursor-pointer' onClick={() => { navigate("/category/hairOilssc2-aesc-Hair Oil")}} src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2F11.jpg?alt=media&token=edca1043-ffa0-4513-9b73-2d9e8b7ed6f1" alt="..." />
            <img className='h-full cursor-pointer' onClick={() => { navigate("/category/HairCombSc2-aesc-Hair%20Comb")}} src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2F12.jpeg?alt=media&token=0c008f80-b862-4a8d-90e9-dbc6bf61e1a3" alt="..." />
            <img className='h-full cursor-pointer' onClick={() => { navigate("/category/faceCreamsc2-aesc-Face%20Cream")}} src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2F13.jpeg?alt=media&token=c65dd4d1-9987-4a4c-974f-35bbec6bce8e" alt="..." />
            
          </Carousel>
        </div>
        <FooterComponent />
    </div>
  )
}

export default Home
