import { Bars3Icon } from '@heroicons/react/24/outline'
import React, { useState } from 'react'

const CategoryBanner = ({IsOpen, toggleMenu}) => {
  return (
    <div className='w-full bg-white py-2 hidden md:grid gap-6 grid-cols-5'>
    <div className='ml-4 h-full col-span-1 flex items-center gap-2 border-r cursor-pointer ' onClick={toggleMenu}>
        <Bars3Icon className='w-5' />
        <p className='text-md font-normal text-gray-600'>All Categories</p>
    </div>
    </div>
  )
}

export default CategoryBanner
