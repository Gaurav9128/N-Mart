import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, MinusIcon } from "@heroicons/react/20/solid";

const CategoryListItem = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  const navigate = useNavigate();

  return (
    <div
      className={`${
        isOpen ? "bg-gray-100" : "hover:bg-gray-50"
      } py-4 px-3 flex justify-between items-start rounded-md transition-colors duration-200`}
    >
      <div className="w-full">
        {/* Category Title */}
        <h1
          className="text-md font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={toggleIsOpen}
        >
          {props.categoryDisplayName}
        </h1>

        <div>
          {isOpen ? (
            <ul className="pl-4 pt-3 space-y-2">
              {props.subCategories.map((cat, idx) => (
                <li
                  key={idx}
                  className="text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
                  onClick={() => {
                    props.toggleMenu();
                    navigate(
                      `/category/${cat.subcategoryName}-aesc-${cat.subcategoryDisplayName}`
                    );
                  }}
                >
                  {cat.subcategoryDisplayName}
                </li>
              ))}
            </ul>
          ) : (
            <h2 className="w-48 text-sm text-gray-500 whitespace-nowrap overflow-hidden overflow-ellipsis">
              {props.subCategories.map((c) => c.subcategoryDisplayName).join(", ")}
            </h2>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleIsOpen}
        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
      >
        {isOpen ? (
          <MinusIcon className="h-5 w-5 text-gray-600" />
        ) : (
          <PlusIcon className="h-5 w-5 text-gray-600" />
        )}
      </button>
    </div>
  );
};

export default CategoryListItem;
