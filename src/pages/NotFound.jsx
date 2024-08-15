import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className='flex gap-2'>
      404 Not Found

      <Link to="/">Home</Link>
    </div>
  )
}

export default NotFound