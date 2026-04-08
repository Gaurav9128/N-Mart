import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

const CategoryListItem = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleIsOpen = () => setIsOpen(!isOpen);
    const navigate = useNavigate();

    return (
        <div className="border-b border-gray-50 last:border-0">
            {/* Category Trigger Row */}
            <div 
                className={`flex items-center justify-between py-4 px-5 cursor-pointer transition-all duration-200 ${isOpen ? "bg-blue-50/40" : "hover:bg-gray-50 active:bg-gray-100"}`}
                onClick={toggleIsOpen}
            >
                <div className="flex-1 mr-4">
                    <h1 className={`text-[13px] font-black tracking-tight uppercase ${isOpen ? "text-blue-700" : "text-gray-800"}`}>
                        {props.categoryDisplayName}
                    </h1>
                    
                    {!isOpen && (
                        <p className="text-[10px] text-gray-400 mt-1 truncate max-w-[180px] font-medium leading-none">
                            {props.subCategories.map(c => c.subcategoryDisplayName).join(' • ')}
                        </p>
                    )}
                </div>

                {/* Subtle Toggle Icon */}
                <div className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                    <ChevronDownIcon className={`h-5 w-5 ${isOpen ? "text-blue-600" : "text-gray-300"}`} />
                </div>
            </div>

            {/* Nested Sub-categories (Drawer inside Drawer) */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100 bg-gray-50/50 pb-4' : 'max-h-0 opacity-0'}`}>
                <ul className="space-y-1 px-4 pt-2">
                    {props.subCategories.map((cat, index) => (
                        <li 
                            key={index}
                            className="flex items-center justify-between py-3 px-4 rounded-xl text-[12.5px] font-bold text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm border border-transparent hover:border-blue-100 transition-all cursor-pointer group active:scale-95"
                            onClick={() => {
                                props.toggleMenu();
                                navigate(`/category/${cat.subcategoryName}-aesc-${cat.subcategoryDisplayName}`);
                            }}
                        >
                            <span className="truncate">{cat.subcategoryDisplayName}</span>
                            <ChevronRightIcon className="h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CategoryListItem;