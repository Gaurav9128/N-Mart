import { ArrowUpCircleIcon } from '@heroicons/react/20/solid';
import React, { useState,useEffect } from 'react'

const ScrollTopArrow = () => {
    const [isVisible, setIsVisible] = useState(false);

  // Function to scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Optional: smooth scrolling effect
    });
  };

  // Function to handle scrolling and toggling arrow visibility
  const handleScroll = () => {
    const scrollTop = window.scrollY;

    if (scrollTop > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Add event listener for scroll
  window.addEventListener('scroll', handleScroll);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    },[])

  return (
    <div>
    {isVisible && (
        <button className='fixed bottom-4 right-4 p-2 text-blue-500 hover:text-yellow-300 bg-yellow-300 hover:bg-blue-500 border-2 rounded-xl' onClick={scrollToTop}>
        <ArrowUpCircleIcon className='w-8 ' />
        </button>
    )}
      
    </div>
  )
}

export default ScrollTopArrow
