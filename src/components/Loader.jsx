import React from 'react'

const Loader = () => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-20 flex w-full z-20 space-x-2 justify-center items-center h-screen dark:invert'>
        <span className='sr-only'>Loading...</span>
        <div className='h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.3s]'></div>
        <div className='h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.15s]'></div>
        <div className='h-8 w-8 bg-black rounded-full animate-bounce'></div>
    </div>
  )
}

export default Loader
