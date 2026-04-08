import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../firebase/FirebaseConfig';

const BestSeller = () => {
    const [bestSellers, setBestSellers] = useState([]);
    const [showAll, setShowAll] = useState(false); // View All toggle state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                const q = query(collection(firestore, "products"), where("bestseller", "==", true));
                const querySnapshot = await getDocs(q);
                const topProducts = [];
                querySnapshot.forEach((doc) => {
                    topProducts.push({ id: doc.id, ...doc.data() });
                });
                setBestSellers(topProducts);
            } catch (error) {
                console.error("Error fetching best sellers:", error);
            }
        };

        fetchBestSellers();
    }, []);

    // Desktop par 5 columns hain, to 2 rows = 10 products
    // Mobile par 2 columns hain, to 10 products = 5 rows
    const visibleProducts = showAll ? bestSellers : bestSellers.slice(0, 10);

    return (
        <div className='max-w-7xl mx-auto px-4 py-12'>
            {/* Header Section */}
            <div className="flex items-end justify-between mb-10 border-b border-gray-100 pb-4">
                <div>
                    <span className='text-blue-600 font-bold text-sm uppercase tracking-widest'>Our Collection</span>
                    <h2 className='text-3xl md:text-4xl font-extrabold text-gray-900 mt-1'>
                        Best Selling <span className='text-blue-600'>Products</span>
                    </h2>
                </div>
                
                {!showAll && bestSellers.length > 10 && (
                    <button 
                        onClick={() => setShowAll(true)}
                        className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-1 group"
                    >
                        VIEW ALL 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Grid Layout */}
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8'>
                {visibleProducts.length > 0 ? (
                    visibleProducts.map((item) => (
                        <div
                            key={item.id}
                            className='group bg-white rounded-2xl overflow-hidden transition-all duration-300'
                            onClick={() => navigate(`/product/${item.id}`)}
                        >
                            {/* Image Box */}
                            <div className='relative aspect-[4/5] overflow-hidden bg-[#f9f9f9] rounded-2xl border border-gray-50'>
                                <img
                                    src={item.image[0]}
                                    alt={item.title}
                                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
                                />
                                {item.bestseller && (
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase">
                                        Best Seller
                                    </div>
                                )}
                                
                                {/* Hover Add to Cart Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <button className="w-full bg-gray-900 text-white py-2 rounded-xl text-sm font-medium shadow-lg hover:bg-blue-600">
                                        Quick View
                                    </button>
                                </div>
                            </div>

                            {/* Details */}
                            <div className='pt-4 px-1'>
                                <h3 className='text-[15px] font-medium text-gray-800 truncate group-hover:text-blue-600 transition-colors'>
                                    {item.title}
                                </h3>
                                <div className='flex items-center gap-2 mt-1'>
                                    
                                    {/* Dummy MRP for professional look */}
                                
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    // Loading Skeletons
                    [...Array(10)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-[4/5] bg-gray-100 rounded-2xl mb-4"></div>
                            <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                        </div>
                    ))
                )}
            </div>

            {/* View Less Option (Optional) */}
            {showAll && (
                <div className="mt-12 text-center">
                    <button 
                        onClick={() => setShowAll(false)}
                        className="border-2 border-gray-900 px-8 py-2 rounded-full font-bold text-sm hover:bg-gray-900 hover:text-white transition-all"
                    >
                        SHOW LESS
                    </button>
                </div>
            )}
        </div>
    );
};

export default BestSeller;