import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { firestore } from '../firebase/FirebaseConfig'

const TrendingProducts = () => {
    const [trendingProducts, setTrendingProducts] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const fetchTrendingProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(firestore, "products"))
                const trendingList = []
                querySnapshot.forEach((doc) => {
                    const data = doc.data()
                    if (data.trending === true) {
                        trendingList.push({ id: doc.id, ...data })
                    }
                })
                setTrendingProducts(trendingList)
            } catch (error) {
                console.error("Error fetching trending products:", error)
            }
        }

        fetchTrendingProducts()
    }, [])

    return (
        <div className='mt-10 px-4'>
            <h2 className='text-2xl font-semibold mb-4 text-gray-800'>
                Trending Products
            </h2>

            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                {trendingProducts.length > 0 ? (
                    trendingProducts.map((item) => (
                        <div
                            key={item.id}
                            className='border rounded-xl shadow-sm p-3 cursor-pointer hover:shadow-lg transition-all duration-200 bg-white'
                            onClick={() => navigate(`/product/${item.id}`)}
                        >
                            <img
                                src={item.image[0]} // first image
                                alt={item.title}
                                className='w-full h-40 object-cover rounded-lg'
                            />
                            <p className='mt-2 text-sm font-medium text-gray-800 truncate'>
                                {item.title}
                            </p>
                            
                             <p className='text-red-500 font-semibold'>
                                {/* {item.price && item.price.length > 0 ? item.price[0]:} */}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className='text-gray-500'>No trending products available</p>
                )}
            </div>
        </div>
    )
}

export default TrendingProducts
