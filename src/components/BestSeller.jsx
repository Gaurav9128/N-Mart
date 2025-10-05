import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { firestore } from '../firebase/FirebaseConfig'

const BestSeller = () => {
    const [bestSellers, setBestSellers] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                const querySnapshot = await getDocs(collection(firestore, "products"))
                const topProducts = []
                querySnapshot.forEach((doc) => {
                    const data = doc.data()
                    if (data.bestseller === true) {
                        topProducts.push({ id: doc.id, ...data })
                    }
                })
                setBestSellers(topProducts)
            } catch (error) {
                console.error("Error fetching best sellers:", error)
            }
        }

        fetchBestSellers()
    }, [])

    return (
        <div className='mt-10'>
            <h2 className='text-2xl font-semibold mb-4 text-gray-800'>
            Best Sellers Products
            </h2>

            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                {bestSellers.length > 0 ? (
                    bestSellers.map((item, index) => (
                        <div
                            key={index}
                            className='border rounded-lg shadow-sm p-2 cursor-pointer hover:shadow-md transition'
                            onClick={() => navigate(`/product/${item.id}`)}
                        >
                            <img
                                src={item.image[0]} // use first image from array
                                alt={item.title}
                                className='w-full h-40 object-cover rounded-md'
                            />
                            <p className='mt-2 text-sm font-medium text-gray-700 truncate'>
                                {item.title} {/* Firestore stores title, not name */}
                            </p>
                            <p className='text-red-500 font-semibold'>
                                {/* {item.price && item.price.length > 0 ? item.price[0]:} */}
                            </p>

                        </div>
                    ))
                ) : (
                    <p className='text-gray-500'>No best sellers available</p>
                )}
            </div>
        </div>
    )
}

export default BestSeller
