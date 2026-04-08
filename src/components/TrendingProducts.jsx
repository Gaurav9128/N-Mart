import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { firestore } from '../firebase/FirebaseConfig'

const TrendingProducts = () => {
    const [trendingProducts, setTrendingProducts] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const fetchTrendingProducts = async () => {
            try {
                const q = query(collection(firestore, "products"), where("trending", "==", true));
                const querySnapshot = await getDocs(q);
                const trendingList = [];
                querySnapshot.forEach((doc) => {
                    trendingList.push({ id: doc.id, ...doc.data() });
                });
                setTrendingProducts(trendingList);
            } catch (error) {
                console.error("Error fetching trending products:", error)
            }
        }
        fetchTrendingProducts()
    }, [])

    return (
        // yahan 'relative z-0' add kiya hai taaki ye modal ke upar na aaye
        <div className='relative z-0 my-16 px-4 md:px-8 max-w-7xl mx-auto'>
            
            {/* Minimal Header */}
            <div className='flex items-center justify-between mb-10'>
                <div>
                    <h2 className='text-3xl font-extrabold text-gray-900 tracking-tight italic'>
                        TRENDING <span className='text-blue-600'>NOW</span>
                    </h2>
                    <div className='h-1.5 w-12 bg-blue-600 rounded-full mt-1'></div>
                </div>
                <div className='hidden sm:block text-gray-400 text-sm font-medium uppercase tracking-widest'>
                    Top Picks of the Week
                </div>
            </div>

            {/* Product Grid */}
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6'>
                {trendingProducts.length > 0 ? (
                    trendingProducts.map((item) => (
                        <div
                            key={item.id}
                            className='group relative bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2'
                            onClick={() => navigate(`/product/${item.id}`)}
                        >
                            {/* Image Section */}
                            <div className='relative aspect-[4/5] bg-[#fdfdfd] overflow-hidden'>
                                <img
                                    src={item.image[0]}
                                    alt={item.title}
                                    className='w-full h-full object-contain p-4 mix-blend-multiply group-hover:scale-110 transition-transform duration-700'
                                />
                                
                                {/* Discount/Trending Tag */}
                                <div className='absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg'>
                                    HOT
                                </div>

                                {/* Hover Overlay - Quick Add */}
                                <div className='absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4'>
                                    <button className='bg-white text-gray-900 px-6 py-2 rounded-xl text-xs font-bold shadow-xl hover:bg-gray-900 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0'>
                                        VIEW PRODUCT
                                    </button>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className='p-4'>
                                <h3 className='text-sm font-semibold text-gray-800 truncate mb-2 group-hover:text-blue-600 transition-colors'>
                                    {item.title}
                                </h3>
                                
                                <div className='flex items-center justify-between'>
                                    
                                    
                                    
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    // Skeleton Loaders
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-80"></div>
                    ))
                )}
            </div>
        </div>
    )
}

export default TrendingProducts