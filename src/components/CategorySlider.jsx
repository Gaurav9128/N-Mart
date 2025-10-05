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
        "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2Fb1909dfd-726c-412b-beb7-9553bc909363.jpeg?alt=media&token=78e483ed-74cd-4db8-89f1-8dfefb4aec4a",
        "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2F85efc2e5-e755-4a11-acc4-a330124b2084.jpeg?alt=media&token=9e2e0087-679c-4bd0-9a8c-cffb4d2f97df",
        "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2Fdb4f1d77-d089-4b0a-822a-c99354195258.jpeg?alt=media&token=5c43e1c3-ac4e-4aa8-912d-4b05b5dca65c",
         "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2F162b6151-c334-4591-8d34-1a550acfadd2.jpeg?alt=media&token=fc1eb231-9d3b-4c79-8d95-bad52d66ba26",
        "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2F11385813-64a1-4c03-a134-b5e75ed75213.jpeg?alt=media&token=d021e007-dd08-48bb-a6e6-2d115a102e85",
        "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2Fefef1eef-7ff3-487e-b543-1eb2b489304e.jpeg?alt=media&token=9740ad8a-0c70-452b-bf40-1afeae8a42fa",
        "https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2F20230210-1454291.jpeg?alt=media&token=c1080862-b844-4609-9c39-ab4e35fede78"
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
