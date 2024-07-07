import React, { useEffect } from 'react';
import { useState } from 'react';
import CategoryListItem from './CategoryListItem';
import RegisterModal from './RegisterModal';
import { ChevronDownIcon, MapPinIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { collection, getDocs, query , where} from 'firebase/firestore';
import { firestore } from '../firebase/FirebaseConfig';
import { useNavigate } from 'react-router-dom';
import { getAuth,signOut, onAuthStateChanged } from 'firebase/auth';
import CartIcon from './CartIcon';
import LocationModal from './LocationModal';
import CategoryBanner from './CategoryBanner';
import { UserAuth } from '../hooks/useAuth';

const Navbar = () => {

    const [isOpen, setIsOpen] = useState(false);
    const [isOpenLocationModal, setIsOpenLocationModal] = useState(false);
    const [searchIterm, setSearchIterm] = useState("");
    const [modal, setModal] = useState(false);

    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();
    const user = UserAuth();

    useEffect(() => {
        getCategories();
        if(user==null){
            const timerId = setTimeout(() =>{
            setModal(true);
            },3000);

            return () => clearTimeout(timerId);
        }else{
            setModal(false);
        }
        
    },[user]);

    const auth = getAuth();

    
    const logOut = () => {

        signOut(auth).then(() => {
            localStorage.removeItem("userId")
            localStorage.removeItem("token")
            window.location.reload();
            
        }).catch((error) => {
        // An error happened.
        });
    }

    const getCategories = async() => {
        let catObj = [];
        const categoriesRef = collection(firestore,"categories");
        const q = query(categoriesRef, where("parent","==",null));
        const querySnapshot = await getDocs(q);

        await Promise.all(querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const subcategories = [];

            const q2 = query(categoriesRef, where("parent", "==", doc.id));
            const subcategorySnapshot = await getDocs(q2);
            subcategorySnapshot.forEach((doc) => {
                const subcategoryData = doc.data();
                subcategories.push({subcategoryDisplayName :subcategoryData.displayName, subcategoryName :doc.id });
            });

            catObj.push({
                displayName : data.displayName,
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
    <div className='sm:h-[100px] flex flex-col border-b-2 shadow-md fixed top-0 bg-white top-0 w-full z-10'>
        <nav className="w-full py-2 px-4 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 space-x-4 content-center bg-white md:border-b">
            <div className="col-span-1 flex">
                <button className="md:hidden navbar-burger flex items-center text-blue-600 p-3" onClick={toggleMenu}>
                    <svg className="block h-4 w-4 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <title>Mobile menu</title>
                        <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
                    </svg>
                </button>
            <a className="flex items-center text-3xl font-bold leading-none cursor-pointer" onClick={() => {navigate("/")}}>
                <img className='h-8 w-auto' src='https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2Fmartlogo.jpeg?alt=media&token=ee6e2494-2792-4ff4-9219-f9de328d566f' />
            </a>
            </div>
            <div className='col-span-1'></div>
            {/* <button className='col-span-1 w-max px-1 md:px-4 flex flex-col items-center justify-evenly bg-indigo-50 rounded-br-2xl rounded-tl-2xl py-2'
            onClick={() =>{setIsOpenLocationModal(true)}}
            >
            
            <h2 className='space-x-1 md:space-x-2 flex items-center'><MapPinIcon className='w-4 inline-block text-green-500' /><span className='text-xs md:text-md'>302017</span> <ChevronDownIcon className='w-4 inline-block ' /></h2>
            <p className=' text-xs md:text-md text-gray-500 font-medium'>Jaipur</p>
            </button> */}
            {/* local modal */}
            {/* {isOpenLocationModal && <LocationModal isOpenLocationModal= {isOpenLocationModal} setIsOpenLocationModal={setIsOpenLocationModal} />} */}
            <div className="hidden col-span-3 md:flex w-full flex-wrap items-center">
                        <input
                        type="search"
                        className=" h-10 m-0 -mr-0.5 block min-w-0 flex-auto rounded-l border border-solid border-neutral-300 bg-gray-200 bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:text-black dark:placeholder:text-gray-400 dark:focus:border-primary"
                        placeholder="Apko kya chahiye?"
                        aria-label="Search"
                        aria-describedby="button-addon1"
                        value={searchIterm}
                        onKeyDown={(e) => {e.key==='Enter'?navigate(`/search?searchItem=${searchIterm}`):""}}
                        onChange={(e) => {setSearchIterm(e.target.value)}} />
                        <button
                        className=" h-10 z-[2] flex items-center rounded-r bg-blue-500 hover:scale-105 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-primary-700 hover:shadow-lg focus:bg-primary-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-primary-800 active:shadow-lg"
                        type="button"
                        id="button-addon1"
                        data-te-ripple-init
                        data-te-ripple-color="light"
                         onClick={() => {navigate(`/search?searchItem=${searchIterm}`)}}
                         >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-5 w-5"
                            >
                            <path
                            fillRule="evenodd"
                            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                            clipRule="evenodd" />
                        </svg>
                        </button>
            </div>
            <div className='hidden sm:block md:hidden col-span-1'></div>
            
            <div className='col-span-1 sm:col-span-2 flex justify-evenly items-center'>
            
            {user == null ? 
            <button className="lg:inline-block py-2 sm:px-6 text-xs  sm:text-sm text-gray-900 font-bold hover:underline" onClick={() =>{setModal(true)}}>Sign In/Register</button>
            : <button className="lg:inline-block py-2 px-6 text-xs sm:text-sm text-gray-900 font-bold hover:underline" onClick={logOut}>Logout</button>}
            <CartIcon />
            </div>
            {/* onClick={() => setOpen(true)} */}
            {/* <SideCart open={open} setOpen={setOpen}/> */}

        </nav>
        <div className="md:hidden mt-3 px-2 w-full self-center bg-white">
            <div className=" mb-2 flex w-full flex-wrap items-stretch">
                <input
                type="search"
                className=" m-0 -mr-0.5 block min-w-0 flex-auto rounded-l border border-solid border-neutral-300 bg-gray-200 bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:text-black dark:placeholder:text-gray-400 dark:focus:border-primary"
                placeholder="Apko kya chahiye?"
                aria-label="Search"
                aria-describedby="button-addon1" 
                value={searchIterm}
                onChange={(e) => {setSearchIterm(e.target.value)}}
                />
                <button
                className=" flex items-center rounded-r bg-blue-500 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-400 hover:shadow-lg focus:bg-primary-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-primary-800 active:shadow-lg"
                type="button"
                id="button-addon1"
                data-te-ripple-init
                data-te-ripple-color="light"
                onClick={() => {navigate(`/search?searchItem=${searchIterm}`)}}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5">
                    <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd" />
                </svg>
                </button>
            </div>
        </div>
        {/* <div className={`lg:hidden navbar-menu relative z-50 ${isOpen? "": "hidden"}`}> */}
            {/* <div className="navbar-backdrop fixed inset-0 bg-gray-800 opacity-25" onClick={toggleMenu}></div> */}
            {/* mobile menu */}
            <nav className={`${isOpen? "transition-[left] duration-500 left-[0px]": "left-[-100%] transition-[left] duration-300"} flex flex-col fixed top-0 md:top-[100px] bottom-0 w-full py-6 bg-white border-r overflow-y-auto`}>
                <div className="flex items-center mb-8">
                    <button className="navbar-close pl-2" onClick={toggleMenu}>
                        <svg className="h-6 w-6 text-gray-400 cursor-pointer hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div>
                    <ul className=''>
                        {categories && categories.map((category,idx) => (
                        <li className="  border-b border-gray-400" key={idx}>
                            <CategoryListItem toggleMenu={toggleMenu} categoryName={category.name} categoryDisplayName ={category.displayName} subCategories = {category.subcategories} />
                        </li>
                    ))}
                    </ul>
                </div>
                <div className="mt-auto">
                    <div className="pt-6 flex justify-center items-center">
                        {user ==null ? 
                        <button className= "w-full py-2 px-6 bg-gray-50 text-sm text-gray-900 font-bold hover:underline" onClick={() =>{setModal(true)}}>Sign In/Register</button>
                        : <button className="w-full py-2 px-6 bg-gray-50 text-sm text-gray-900 font-bold hover:underline" onClick={logOut}>Logout</button>}
                    </div>
                    <p className="my-4 text-xs text-center text-gray-400">
                        <span>Copyright © 2021</span>
                    </p>
                </div>
            </nav>
        {/* </div> */}
        <RegisterModal setModal = {setModal} modal={modal} />

        <CategoryBanner isOpen={isOpen} toggleMenu={toggleMenu} />
        
    </div>
  )
}

export default Navbar