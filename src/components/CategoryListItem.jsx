import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const CategoryListItem = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleIsOpen = ()=> {
        setIsOpen(!isOpen);
    }

    const navigate = useNavigate();

  return (
    <div className={`${isOpen ? "bg-gray-200" : ""} py-6 px-2 flex justify-between`}>
        <div className='w-full'>
            <h1 className='text-md font-medium cursor-pointer' onClick={toggleIsOpen}>{props.categoryDisplayName}</h1>
            <div>
                {isOpen?
                    <ul className='pl-6 pt-4 space-y-2'>
                        {props.subCategories.map(cat =>(
                            <li className='text-gray-500 w-max cursor-pointer' onClick={() => {
                                props.toggleMenu()
                                navigate(`/category/${cat.subcategoryName}-aesc-${cat.subcategoryDisplayName}`)}}>{cat.subcategoryDisplayName}</li>
                        ))}
                    </ul>:
                    <h2 className=' w-40 whitespace-nowrap overflow-hidden overflow-ellipsis'>{props.subCategories.map(c => c.subcategoryDisplayName).join(', ')}</h2>
                }
            </div>
        </div>
        {isOpen?
            <button onClick={toggleIsOpen} className='self-start'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="30" height="30">
                    <line x1="20" y1="50" x2="80" y2="50" stroke="black" strokeWidth="10" />
                </svg>
            </button>:
            <button onClick={toggleIsOpen} className='self-start'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="30" height="30">
                    <line x1="30" y1="50" x2="70" y2="50" stroke="black" strokeWidth="10" />
                    <line x1="50" y1="30" x2="50" y2="70" stroke="black" strokeWidth="10" />
                </svg>
            </button>
        
          
         }
        
        
      
    </div>
  )
}

export default CategoryListItem

