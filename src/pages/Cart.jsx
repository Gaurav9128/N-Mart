import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { collection, doc, getDocs, getDoc, addDoc, query, where, setDoc, Timestamp, deleteDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase/FirebaseConfig';
import CartTotal from '../components/CartTotal';
import CartItem from '../components/CartItem';
import { useNavigate } from 'react-router-dom';
import FooterComponent from '../components/FooterComponent';
import { UserAuth } from '../hooks/useAuth';
import axios from 'axios'; // Use ES6 import for axios

const Cart = () => {
    const userId = localStorage.getItem("userId");
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [savings, setSavings] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [isCouponValid, setIsCouponValid] = useState(null);
    const navigate = useNavigate();
    const user = UserAuth();

    useEffect(() => {
        getCartItems();
    }, []);
    useEffect(() => {
        const fetchOrderStatus = async () => {
            const queryParams = new URLSearchParams(window.location.search);
            const status = queryParams.get('status');
            const transactionID = queryParams.get('txnId');
            const responseStatus = queryParams.get('response');
            console.log('Response Status is : ', responseStatus)

            if (status && transactionID) {
                // Fetch existing order with the same transaction ID
                const existingOrderQuery = query(
                    collection(firestore, 'orderDetails'),
                    where('transactionId', '==', transactionID)
                );
                const existingOrderSnapshot = await getDocs(existingOrderQuery);
                if (status === 'CHARGED') {
                    const orderData = localStorage.getItem('orderDetails');
                    if (orderData) {
                        const orderDetails = JSON.parse(orderData);
                        const storedOrderDetails = localStorage.getItem('orderDetails');
                        const storedOrderId = localStorage.getItem('orderid');
                        const orderDetailsTemp = JSON.parse(storedOrderDetails);
                        const cartTotal = orderDetailsTemp.cartTotal;
                        const orderId = storedOrderId;
                        localStorage.removeItem('orderDetails');
                        localStorage.removeItem('orderid');
                        await clearCart();
                        // alert('Your Order was Successfully Placed');
                        alert(`Your Order was Successfully Placed. Your Order ID: ${orderId}, Cart Total: ${cartTotal}`);

                    } else {
                        console.error("Order details are missing from localStorage.");
                    }
                } else if (status === 'AUTHENTICATION_FAILED') {
                    alert('Operation AUTHENTICATION_FAILED');
                } else if (status === 'AUTHORIZATION_FAILED') {
                    alert('Operation AUTHORIZATION_FAILED');
                }
            }

            // Redirect to the cart page

        };

        fetchOrderStatus();
    }, []); // Empty dependencies array to ensure it runs only once

    // Empty dependencies array to ensure it runs only once


    const getCartItems = async () => {
        try {
            const q = query(collection(firestore, 'carts'), where("userId", "==", localStorage.getItem('userId')));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const currdoc = querySnapshot.docs[0];
                const itemsCollection = collection(firestore, 'carts', currdoc.id, "items");
                const itemsSnapshot = await getDocs(itemsCollection);
                const cartItemsArray = itemsSnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id,
                }));
                setCartItems(cartItemsArray);
            } else {
                setCartItems([]); // Clear the cart items if no cart is found
            }
        } catch (err) {
            console.error("Error fetching cart items:", err);
        }
    };

    const updateCart = (index, quantity) => {
        setCartItems(prevCartItems => {
            const updatedCartItems = [...prevCartItems];
            updatedCartItems[index] = { ...updatedCartItems[index], quantity: quantity };
            return updatedCartItems;
        });
    }

    const handleCouponCodeChange = (e) => {
        setCouponCode(e.target.value);
    };
    function generateRandomId() {
        return Math.floor(10000000 + Math.random() * 90000000).toString();
    }
    const handleCheckout = async () => {
        console.log("handleCheckout function called");

        try {
            // Define currentUrl here
            const currentUrl = window.location.href;

            // Fetch user details using userId
            const userDoc = await getDoc(doc(firestore, 'users', userId));
            if (!userDoc.exists()) {
                console.error('User not found');
                return;
            }

            const userData = userDoc.data();
            const { firstName, lastName, mobile, email } = userData;

            // Ensure all fields in the order items are defined
            const orderListItems = cartItems.map(item => ({
                id: item.id || '',
                title: item.productTitle || '',
                variantName: item.variantName || '',
                quantity: item.quantity || 0,
                pricePerPiece: item.pricePerPiece || 0,
                discountPrice: item.discountPrice || 0
            }));


            const couponStatus = isCouponValid ? 'Valid' : 'Invalid';

            const orderDetails = {
                userId: userId,
                orderListItems: orderListItems,
                couponStatus: couponStatus,
                cartTotal: cartTotal,
                savings: savings
            };
            // console.log("after ",orderDetails)
            localStorage.setItem("orderDetails", JSON.stringify(orderDetails))
            const orderDetails1 = localStorage.getItem('orderDetails')
            const orderDate = Timestamp.now();
            // console.log("order function  ",JSON.parse(orderDetails1));
            const randomId = generateRandomId();
            const orderDetailsId = await addDoc(collection(firestore, 'orderDetails'), {
                ...orderDetails,
                paymentStatus: 'Pending',
                transactionId: null,
                orderDate: orderDate,
                orderId: randomId
            });
            if (isCouponValid) {
                // Save order details directly without payment, generating a new document with a unique ID
                await updateDoc(doc(firestore, 'orderDetails', orderDetailsId.id), {
                    paymentStatus: 'Credit Sale'
                });
                const cartQuery = query(collection(firestore, "carts"), where("userId", "==", userId));
                const cartSnapshot = await getDocs(cartQuery);
                clearCart();
                alert('Your Order Successfully Placed');
            } else {
                console.log("payment gateway data ", cartTotal + firstName +  lastName + email + mobile);
                fetch('https://nmart-node.onrender.com/initiate-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: cartTotal,
                        name: firstName + " " + lastName,
                        email: (email ? email : 'demo@gmail.com'),
                        phone: mobile
                    })
                })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log('Response data:', data);  // Handle the JSON data
                    if (data && data.payment_url) {
                        let orderid = data.id;
                        let linkUrl = data.payment_url.replace(/\n/g, ""); // Remove newlines
                        localStorage.setItem('orderid', orderid);
                        console.log("linkUrl ", linkUrl);
                        window.location.href = linkUrl;
                    }
                })
                .catch((error) => {
                    console.error('There was a problem with the fetch operation:', error);
                });
            }
            
            

            // Clear the cart by deleting the items
            // Update the state to clear the cart in the UI
            setCartItems([]);
            setCartTotal(0);
            setSavings(0);

            // Optionally, re-fetch cart items to ensure they are cleared
            getCartItems();
        } catch (err) {
            console.error('Error creating order:', err);
        }
    };

    const clearCart = async () => {
        const cartQuery = query(collection(firestore, "carts"), where("userId", "==", userId));
        const cartSnapshot = await getDocs(cartQuery);

        if (!cartSnapshot.empty) {
            const currdoc = cartSnapshot.docs[0];
            const itemsCollection = collection(firestore, 'carts', currdoc.id, "items");
            const itemsSnapshot = await getDocs(itemsCollection);
            const deletePromises = itemsSnapshot.docs.map((itemDoc) =>
                deleteDoc(doc(firestore, 'carts', currdoc.id, "items", itemDoc.id))
            );
            await Promise.all(deletePromises);

            console.log("Cart items successfully cleared.");
        } else {
            console.log("No cart found to clear.");
        }

        // Update the state to clear the cart in the UI
        setCartItems([]);
        setCartTotal(0);
        setSavings(0);

        // Optionally, re-fetch cart items to ensure they are cleared
        getCartItems();
    };

    const validateCoupon = async () => {
        try {
            const couponRef = doc(firestore, 'coupons', couponCode);
            const couponSnap = await getDoc(couponRef);
            if (couponSnap.exists()) {
                const couponData = couponSnap.data();
                console.log('data', couponData.isActive)
                const currentDate = new Date();
                const startDate = new Date(couponData.startDate);
                const endDate = new Date(couponData.endDate);

                if (currentDate >= startDate && currentDate <= endDate && couponData.isActive) {
                    setIsCouponValid(true);
                    console.log('Coupon is valid');
                } else {
                    setIsCouponValid(false);
                    console.log('Coupon is expired');
                }
            } else {
                setIsCouponValid(false);
                console.log('Invalid coupon code');
            }
        } catch (err) {
            console.error('Error validating coupon:', err);
            setIsCouponValid(false);
        }
    };



    useEffect(() => {
        const total = cartItems.reduce((acc, currItem) => {
            if (currItem.pricePerPiece && currItem.quantity) {
                return acc + (currItem.pricePerPiece * currItem.quantity);
            }
            return acc;
        }, 0);
        setCartTotal(total);

        const totalSavings = cartItems.reduce((acc, currItem) => {
            const discountPrice = currItem.discountPrice || 0;
            if (currItem.pricePerPiece && currItem.quantity) {
                return acc + ((currItem.pricePerPiece - discountPrice) * currItem.quantity);
            }
            return acc;
        }, 0);
        setSavings(totalSavings);
    }, [cartItems]);

    return (
        <div className="min-h-screen flex flex-col justify-between mt-32 md:mt-28">
            <Navbar />
            {cartItems && cartItems.length > 0 ?
                <div className="mx-auto w-full px-1 sm:w-11/12 max-w-screen-2xl md:justify-between px-6 lg:flex lg:space-x-6 xl:px-0">
                    <div className='sm:w-full'>
                        <h1 className="mb-2 sm:mb-10 flex items-center gap-2">
                            <span className='text-md font-bold'>My Cart</span>
                            <span className='text-md text-gray-600 mr-2'>
                                ({cartItems.reduce((total, currentItem) => total + parseInt(currentItem.quantity), 0)} item(s))
                            </span>
                            <span className='hidden sm:block h-[1px] flex-grow bg-gray-600'></span>
                        </h1>
                        <div className='grid grid-cols-8 w-full mx-4 mb-4 text-gray-500 font-medium'>
                            <p className='hidden lg:block col-span-4'>Product</p>
                            <p className='hidden lg:block col-span-1 text-center'>You Pay</p>
                            <p className='hidden lg:block col-span-1 text-center'>You Save</p>
                            <p className='hidden lg:block col-span-1 text-center'>No. of items</p>
                            <p className='hidden lg:block col-span-1'></p>
                        </div>
                        {cartItems.map((product, index) => (
                            <div className="flex flex-col rounded-lg md:w-full" key={index}>
                                <CartItem product={product} index={index} updateCart={updateCart} getCartItems={getCartItems} />
                            </div>
                        ))}
                    </div>
                    <CartTotal cartItems={cartItems} onCheckout={handleCheckout} />
                </div>
                :
                <div className='mx-auto w-11/12 max-w-screen-2xl flex flex-col items-center justify-center gap-4 mb-10'>
                    <svg className='h-32 w-auto' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                            <path d="M21 5L19 12H7.37671M20 16H8L6 3H3M11 3L13.5 5.5M13.5 5.5L16 8M13.5 5.5L16 3M13.5 5.5L11 8M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z" stroke="#317ad8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                        </g>
                    </svg>
                    <h1 className='text-md sm:text-2xl font-medium'>No items in your cart</h1>
                    <p className='text-sm text-gray-500 font-normal'>Browse from our wide variety of products & exciting offers</p>
                    <button className='w-36 rounded-lg text-white py-4 bg-blue-500 hover:bg-blue-400' onClick={() => { navigate("/") }}>Start Shopping</button>
                </div>
            }
            <div className="mx-auto w-full px-6 lg:px-0">
                <div className="flex flex-col mt-4">
                    <label htmlFor="couponCode" className="text-sm font-medium">Enter Coupon Code</label>
                    <input
                        type="text"
                        id="couponCode"
                        value={couponCode}
                        onChange={handleCouponCodeChange}
                        className="border rounded p-2 mt-2"
                    />
                    <button
                        onClick={validateCoupon}
                        className="bg-blue-500 text-white rounded p-2 mt-2"
                    >
                        Apply Coupon
                    </button>
                    {isCouponValid === true && <p className="text-green-500">Coupon is valid!</p>}
                    {isCouponValid === false && <p className="text-red-500">Coupon is invalid or expired.</p>}
                </div>
            </div>
            <FooterComponent />
        </div>
    );
}

export default Cart;
