import React, { useEffect, useState, useRef } from 'react';
import CategoryListItem from './CategoryListItem';
import RegisterModal from './RegisterModal';
import { ChevronDownIcon, MapPinIcon, ShoppingCartIcon, UserIcon } from "@heroicons/react/24/outline";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../firebase/FirebaseConfig';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import CartIcon from './CartIcon';
import LocationModal from './LocationModal';
import CategoryBanner from './CategoryBanner';
import { UserAuth } from '../hooks/useAuth';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); // New State for Dropdown
    const [searchIterm, setSearchIterm] = useState("");
    const [modal, setModal] = useState(false);
    const [categories, setCategories] = useState([]);
    
    const navigate = useNavigate();
    const user = UserAuth();
    const auth = getAuth();
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        getCategories();
        if (user == null) {
            const timerId = setTimeout(() => {
                setModal(true);
            }, 3000);
            return () => clearTimeout(timerId);
        } else {
            setModal(false);
        }
    }, [user]);

    const logOut = () => {
        signOut(auth).then(() => {
            localStorage.removeItem("userId");
            localStorage.removeItem("token");
            window.location.reload();
        }).catch((error) => {
            console.error("Logout Error:", error);
        });
    }

    const getCategories = async () => {
        let catObj = [];
        const categoriesRef = collection(firestore, "categories");
        const q = query(categoriesRef, where("parent", "==", null));
        const querySnapshot = await getDocs(q);

        await Promise.all(querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const subcategories = [];
            const q2 = query(categoriesRef, where("parent", "==", doc.id));
            const subcategorySnapshot = await getDocs(q2);
            subcategorySnapshot.forEach((doc) => {
                const subcategoryData = doc.data();
                subcategories.push({ subcategoryDisplayName: subcategoryData.displayName, subcategoryName: doc.id });
            });

            catObj.push({
                displayName: data.displayName,
                name: doc.id,
                subcategories: subcategories
            });
        }));
        setCategories(catObj);
    }

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className='sm:h-[100px] flex flex-col border-b-2 shadow-md fixed top-0 bg-white w-full z-10'>
            <nav className="w-full py-2 px-4 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 space-x-4 content-center bg-white md:border-b">
                <div className="col-span-1 flex">
                    <button className="md:hidden navbar-burger flex items-center text-blue-600 p-3" onClick={toggleMenu}>
                        <svg className="block h-4 w-4 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <title>Mobile menu</title>
                            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
                        </svg>
                    </button>
                    <a className="flex items-center text-3xl font-bold leading-none cursor-pointer" onClick={() => { navigate("/") }}>
                        <img className='h-8 w-auto' src='https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2FIMG-20240101-WA0016.jpg?alt=media&token=177a4e17-88de-4682-8e17-d0a002609ce0' alt="Logo" />
                    </a>
                </div>

                <div className='col-span-1'></div>

                {/* Desktop Search */}
                <div className="hidden col-span-3 md:flex w-full flex-wrap items-center">
                    <input
                        type="search"
                        className="h-10 m-0 -mr-0.5 block min-w-0 flex-auto rounded-l border border-solid border-neutral-300 bg-gray-200 px-3 py-[0.25rem] text-base font-normal text-neutral-700 outline-none focus:border-blue-500"
                        placeholder="Apko kya chahiye?"
                        value={searchIterm}
                        onKeyDown={(e) => { e.key === 'Enter' ? navigate(`/search?searchItem=${searchIterm}`) : "" }}
                        onChange={(e) => { setSearchIterm(e.target.value) }} 
                    />
                    <button
                        className="h-10 z-[2] flex items-center rounded-r bg-blue-500 hover:scale-105 px-6 py-2.5 text-white shadow-md transition duration-150"
                        type="button"
                        onClick={() => { navigate(`/search?searchItem=${searchIterm}`) }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className='hidden sm:block md:hidden col-span-1'></div>

                {/* Auth & Cart Section */}
                <div className='col-span-1 sm:col-span-2 flex justify-evenly items-center'>
                    {user == null ? (
                        <button className="lg:inline-block py-2 sm:px-6 text-xs sm:text-sm text-gray-900 font-bold hover:underline" onClick={() => { setModal(true) }}>
                            Sign In/Register
                        </button>
                    ) : (
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                className="flex items-center space-x-1 py-2 px-2 md:px-4 text-xs sm:text-sm text-gray-900 font-bold hover:bg-gray-100 rounded-md transition"
                            >
                                <UserIcon className="w-5 h-5 text-gray-600" />
                                <span className="hidden sm:inline">Account</span>
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Logout Dropdown */}
                            {isUserDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-xl py-2 z-50">
                                    <div className="px-4 py-2 border-b text-xs text-gray-500 truncate">
                                        {user.email}
                                    </div>
                                    <button
                                        onClick={logOut}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    <CartIcon />
                </div>
            </nav>

            {/* Mobile Search Bar */}
            <div className="md:hidden mt-3 px-2 w-full self-center bg-white">
                <div className="mb-2 flex w-full flex-wrap items-stretch">
                    <input
                        type="search"
                        className="m-0 -mr-0.5 block min-w-0 flex-auto rounded-l border border-solid border-neutral-300 bg-gray-200 px-3 py-[0.25rem] text-base text-neutral-700 outline-none"
                        placeholder="Apko kya chahiye?"
                        value={searchIterm}
                        onChange={(e) => { setSearchIterm(e.target.value) }}
                    />
                    <button
                        className="flex items-center rounded-r bg-blue-500 px-6 py-2.5 text-white shadow-md"
                        type="button"
                        onClick={() => { navigate(`/search?searchItem=${searchIterm}`) }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Menu */}
            <nav className={`${isOpen ? "left-0" : "-left-full"} transition-all duration-300 flex flex-col fixed top-0 bottom-0 w-full py-6 bg-white border-r overflow-y-auto z-50`}>
                <div className="flex items-center justify-between px-4 mb-8">
                    <span className="font-bold text-xl">Menu</span>
                    <button onClick={toggleMenu}>
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div>
                    <ul>
                        {categories && categories.map((category, idx) => (
                            <li className="border-b border-gray-100" key={idx}>
                                <CategoryListItem toggleMenu={toggleMenu} categoryName={category.name} categoryDisplayName={category.displayName} subCategories={category.subcategories} />
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mt-auto p-4">
                    {user == null ? 
                        <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold" onClick={() => { setModal(true) }}>Sign In/Register</button>
                        : <button className="w-full py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold" onClick={logOut}>Logout</button>
                    }
                    <p className="mt-4 text-xs text-center text-gray-400">Copyright © 2026 N-MART</p>
                </div>
            </nav>

            <RegisterModal setModal={setModal} modal={modal} />
            <CategoryBanner isOpen={isOpen} toggleMenu={toggleMenu} />
        </div>
    )
}

export default Navbar;