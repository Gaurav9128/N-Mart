import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { firestore } from '../firebase/FirebaseConfig';
import { BackspaceIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useNavigate } from 'react-router-dom';

const categories = [{
  name : "faceCreamsc2-aesc-Face%20Cream",
  displayName : 'Creams'
},{
  name : 'soapssc2-aesc-Soaps',
  displayName : 'Soaps'
},{
  name : 'hairShampoossc2-aesc-Hair%20Shampoos',
  displayName : 'Shampoos'
},
{
  name : 'Freshner&Repellents-aesc-Freshner%20&%20Repellents',
  displayName : 'Fresheners'
},
{
  name : 'hairOilsc2-aesc-Hair%20Oil',
  displayName : 'Hair Oil'
},
{
  name : 'toothpastesc2-aesc-ToothPaste',
  displayName : 'Toothpaste'
},
{
  name : 'Eyecare-aesc-Eye%20Care',
  displayName : 'Eyeliners'
}
]
const CategorySlider = () => {

    const navigate = useNavigate();

    const slider = React.useRef(null);

    const settings = {
        dots : false,
        infinte: true,
        speed: 500,
        arrows : false,
        slidesToShow: 5,
        slidesToScroll: 1,
        responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          dots : false,
        infinte: true,
        speed: 500,
        arrows : false,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          initialSlide: 3
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      }
    ]
    };
    const imgPaths = [
        "https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2FcategoryCreams.svg?alt=media&token=1d4b22cb-5e56-45c7-abdf-334935ce50ed",
        "https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2FcategorySoaps.svg?alt=media&token=21adfed7-aa77-4313-bedb-8d7ddf4e4284",
        "https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2FcategoryShampoos.svg?alt=media&token=46780278-ddc5-4425-8b89-d1d7383994a2",
         "https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2FcategoryFresheners.svg?alt=media&token=e298d1a9-d604-4a7f-b120-2692950a12b0",
        "https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2FcategoryHairOil.svg?alt=media&token=0a019237-d669-410a-944e-d7f398f066f4",
        "https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2FcategoryToothpaste.svg?alt=media&token=b1066840-7038-4cbc-8301-6093b09c797a",
        "https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2FcategoryEyeliner.svg?alt=media&token=3bbed903-8c5b-43f9-80a5-cc93349fbdcc"
    ]

  return (
    <div className='w-full py-1 sm:py-4'>
        
          <ChevronLeftIcon className='absolute left-1 top-1/2 transform -translate-y-1/2 h-5 md:h-7 cursor-pointer' onClick={() => slider?.current?.slickPrev()} />
          <ChevronRightIcon className='absolute right-1 top-1/2 transform -translate-y-1/2 h-5 md:h-7 cursor-pointer' onClick={() => slider?.current?.slickNext()} />
        <Slider ref={slider} {...settings}>
          
            {categories && categories.map((c,i) => (
                <div key={i} className=' flex items-center justify-center text-black' >
                    <img className=' h-14 md:h-24 lg:h-28 mx-auto  border rounded-xl p-4 cursor-pointer' src={imgPaths[i]} onClick={() => { navigate(`/category/${c.name}-aesc-${c.displayName}`)}} />
                        <p className='flex justify-center items-center text-xs md:text-sm font-medium text-center cursor-pointer' onClick={() => { navigate(`/category/${c.name}-aesc-${c.displayName}`)}}>{c.displayName}</p>
                    
                </div>
            ))}
        </Slider>
        </div>
  )
}

export default CategorySlider
