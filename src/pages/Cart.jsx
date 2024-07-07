import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { collection, doc, getDocs, query, where,getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/FirebaseConfig';
import CartTotal from '../components/CartTotal';
import CartItem from '../components/CartItem';
import { useNavigate } from 'react-router-dom';
import FooterComponent from '../components/FooterComponent';
import { UserAuth } from '../hooks/useAuth';
import { UserVerifiedStatus } from '../hooks/useAuth';
const cart = () => {

    
    const userId = localStorage.getItem("userId");
    const [cartItems, setCartItems ] = useState();
    const [cartTotal, setCartTotal] = useState();
    const navigate = useNavigate();
    // const user = UserAuth();
    // console.log("user: ",user);

    useEffect(() => {
        getCartItems();
    },[])

    const getCartItems = async() => {
      console.log("inside get")
        const q = query(collection(firestore, "carts"), where("userId", "==",userId));
        const querySnapshot = await getDocs(q);
        if(!querySnapshot.empty){
                const currdoc = querySnapshot.docs[0];
                const existingItemsCollection = collection(firestore, 'carts', currdoc.id, "items");
                const docSnap = await getDocs(existingItemsCollection);
                let allItems =[];
                if(!docSnap.empty){
                    docSnap.forEach((doc) => {
                    allItems.push({id: doc.id ,...doc.data()});
                    })
                    console.log(allItems)
                    setCartItems(allItems);
                    
                }else {
                  console.log(cartItems);
                  
                  setCartItems(undefined);
                }
        }

    }



  const updateCart = (index,quantity) => {
    console.log("update")

    setCartItems(prevCartItems => {
        const updatedCartItems = [...prevCartItems]; // Create a shallow copy of the cartItems array
        updatedCartItems[index] = { ...updatedCartItems[index], quantity: quantity }; // Update the quantity of the specific item
        return updatedCartItems; // Set the updated array as the new state
    });

  }

    

  return (
    <div className="min-h-screen flex flex-col justify-between mt-32 md:mt-28">
        <Navbar />
        {cartItems && cartItems.length>0 ?
        <div className="mx-auto w-full px-1 sm:w-11/12 max-w-screen-2xl md:justify-between px-6 lg:flex lg:space-x-6 xl:px-0">
          <div className='sm:w-full'>
          <h1 className="mb-2 sm:mb-10 flex items-center gap-2"><span className='text-md font-bold'>My Cart</span><span className='text-md text-gray-600 mr-2'>({cartItems.reduce((total, currentItem) => {return total + parseInt(currentItem.quantity)},0)} item(s))</span><span className='hidden sm:block h-[1px] flex-grow bg-gray-600'></span></h1>
          <div className='grid grid-cols-8 w-full mx-4 mb-4 text-gray-500 font-medium'>
          <p className='hidden lg:block col-span-4'>Product</p>
          <p className='hidden lg:block col-span-1 text-center'>You Pay</p>
          <p className='hidden lg:block col-span-1 text-center'>You Save</p>
          <p className='hidden lg:block col-span-1 text-center'>No. of items</p>
          <p className='hidden lg:block col-span-1'></p>
          </div>
          {cartItems.map((product,index) =>(
              <div className="flex flex-col rounded-lg md:w-full" key={index}>
                  <CartItem product={product} index={index} updateCart={updateCart} getCartItems={getCartItems}/>
                  
                  {/* <button className='text-red-600 w-full text-right'>Remove all</button> */}
              </div>
          ))}
          </div>
        {/* <!-- Sub total --> */}
        <CartTotal cartItems = {cartItems} />
        </div>
        : <div className='mx-auto w-11/12 max-w-screen-2xl flex flex-col items-center justify-center gap-4 mb-10'>
            <svg className='h-32 w-auto' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21 5L19 12H7.37671M20 16H8L6 3H3M11 3L13.5 5.5M13.5 5.5L16 8M13.5 5.5L16 3M13.5 5.5L11 8M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z" stroke="#317ad8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
            <h1 className=' text-md sm:text-2xl font-medium'>No items in your cart</h1>
            <p className='text-sm text-gray-500 font-normal'>Browse from our wide variety of products & exciting offers</p>
            <button className='w-36 rounded-lg text-white py-4 bg-blue-500 hover:bg-blue-400' onClick={() => {navigate("/")}}>Start Shopping</button>
          </div>}  
          <FooterComponent /> 
    </div>
  )
}

export default cart
