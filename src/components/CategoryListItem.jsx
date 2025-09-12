import React from "react";
import { useNavigate } from "react-router-dom";

const CategoryMegaMenu = ({ categories, toggleMenu }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-6 bg-white rounded-lg shadow-lg">
      {categories.map((category, idx) => (
        <div key={idx} className="space-y-2">
          {/* Category Icon + Title */}
          <div className="flex items-center space-x-2 cursor-pointer">
            {category.icon && (
              <img
                src={category.icon}
                alt={category.categoryDisplayName}
                className="w-10 h-10 object-contain"
              />
            )}
            <h2 className="font-bold text-gray-800 text-lg hover:text-blue-600 transition-colors">
              {category.categoryDisplayName}
            </h2>
          </div>

          {/* Subcategories */}
          <ul className="pl-1 space-y-1">
            {category.subCategories.map((sub, i) => (
              <li
                key={i}
                className="text-gray-600 hover:text-blue-500 cursor-pointer text-sm transition-colors"
                onClick={() => {
                  toggleMenu();
                  navigate(
                    `/category/${sub.subcategoryName}-aesc-${sub.subcategoryDisplayName}`
                  );
                }}
              >
                {sub.subcategoryDisplayName}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default CategoryMegaMenu;
