import React from 'react'
import Navbar from '../components/Navbar'
import Item from '../components/Item'
import Sidebar from '../components/Sidebar'
import FooterComponent from '../components/FooterComponent'
import CategoryBanner from '../components/CategoryBanner'

const Shop = () => {
  return (
    <div className='min-h-screen flex flex-col justify-between'>
        <Navbar />
        <Sidebar />
        <FooterComponent />
    </div>
  )
}

export default Shop
