import { CheckCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';
import { doc, getDoc, collection, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase/FirebaseConfig';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { cartTotalAtom } from '../store/atoms/totalCartQuantity';

const CartItem = (props) => {
    console.log(" maha prop ",props)
    const [editable, setEditable] = useState(false);
    const [quantity, setQuantity] = useState(0);
    const [minQuantity, setMinQuantity] = useState(null);
    const [maxQuantity, setMaxQuantity] = useState(null);
    const navigate = useNavigate();
    const [cartTotal, setCartTotal] = useRecoilState(cartTotalAtom);
     // Calculate min and max quantities using useMemo

    useEffect(() => {
        getPricesData(props.product.variantId);
    }, [props.product.variantId]);

    const getPricesData = async (variationId) => {
        try {
            const docRef = collection(firestore, "products", props.product.productId, "variations", variationId, "prices");
            const docSnap = await getDocs(docRef);
            
            let pricesArray = [];
            docSnap.forEach((doc) => {
                const data = doc.data();
                pricesArray.push([data.minQuantity, data.maxQuantity, data.price]);
                setMinQuantity(data.minQuantity);
                setMaxQuantity(data.maxQuantity);
            });
            console.log("pricearray ",pricesArray)
            setPrices(pricesArray); // Set state with the fetched pricesArray

        } catch (err) {
            console.error("Error fetching prices data:", err);
        }
    };
    useEffect(() => {
        setQuantity(props.product.quantity);
    }, [props.product.productId, props.product.variantId]);


    const handleEditClick = () => {
        setEditable(true);
    };

    const handleSaveClick = async () => {
        if (quantity < minQuantity || quantity > maxQuantity) {
            alert(`Invalid quantity. Quantity must be between ${minQuantity} and ${maxQuantity}.`);
            return;
        }
        setEditable(false);
        try {
            const cartRef = collection(firestore, 'carts');
            const q = query(cartRef, where("userId", "==", localStorage.getItem('userId')));
            const querySnapshot = await getDocs(q);
            const currdoc = querySnapshot.docs[0];
            const itemsCollection = collection(firestore, "carts", currdoc.id, "items");
            const itemq = query(itemsCollection, where("productId", "==", props.product.productId), where("variantId", "==", props.product.variantId));
            const docSnap = await getDocs(itemq);
            const itemDoc = doc(firestore, "carts", currdoc.id, "items", docSnap.docs[0].id);
            await updateDoc(itemDoc, { quantity: quantity });
            // Update cart total by adding the new quantity
            setCartTotal(prevTotal => prevTotal + quantity - props.product.quantity);
            props.updateCart(props.index, quantity);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteCartItem = async () => {
        try {
            const cartRef = collection(firestore, 'carts');
            const q = query(cartRef, where("userId", "==", localStorage.getItem('userId')));
            const querySnapshot = await getDocs(q);
            const currdoc = querySnapshot.docs[0];
            const itemsCollection = collection(firestore, "carts", currdoc.id, "items");
            const itemq = query(itemsCollection, where("productId", "==", props.product.productId), where("variantId", "==", props.product.variantId));
            const itemDoc = await getDocs(itemq);
            const docDel = doc(firestore, "carts", currdoc.id, "items", itemDoc.docs[0].id);
            await deleteDoc(docDel);
            setCartTotal(prevTotal => prevTotal - quantity);
            props.getCartItems();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <div className="h-40 lg:h-auto flex md:grid grid-cols-8 mb-6 rounded-lg border px-2 py-2">
                <img src={props.product.productImage} alt="product-image" className="h-full w-20 sm:w-24 object-contain col-span-2 md:col-span-1 box-border md:h-full p-2 rounded-lg" />
                <div className="col-span-6 md:col-span-7 lg:grid grid-cols-7 sm:mx-4 w-full sm:justify-between">
                    <div className="mt-2 lg:mt-5 sm:mt-0 flex flex-col col-span-3 justify-center">
                        <h2 className="text-sm md:text-xl font-normal text-black hover:underline cursor-pointer" onClick={() => { navigate(`/product/${props.product.productId}`) }}>{props.product.productTitle} : {props.product.variantName}</h2>
                        <p className="mt-1 text-xs md:text-xl text-gray-600">Variant: <span className=' text-black font-medium'>{props.product.variantName}</span></p>
                    </div>
                    <h2 className='hidden text-sm md:text-xl lg:flex text-black font-medium justify-center items-center'>₹{props.product.pricePerPiece * quantity - (props.product.discountPrice || 0)}</h2>
                    <h2 className='hidden text-sm md:text-xl lg:flex text-green-600 font-medium justify-center items-center'>₹{props.product.discountPrice || 0}</h2>
                    <div className="hidden mt-4 lg:flex flex-col justify-center items-center sm:mt-0">
                        <div className="flex gap-1 items-center border-gray-100">
                            {!editable ? (
                                <PencilIcon className='h-4 w-4 md:h-6 md:w-6 self-end mb-1' onClick={handleEditClick} />
                            ) : (
                                <div className='h-6 w-6 self-end mb-1'> </div>
                            )}
                            <div className='flex flex-col gap-1 items-center'>
                                <label htmlFor="quantity" className='text-md font-medium'>Qty</label>
                                <input
                                    type='number'
                                    id='quantity'
                                    name='quantity'
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.min(Math.max(parseInt(e.target.value), minQuantity), maxQuantity))}
                                    className='w-6 md:w-12 p-2 rounded-lg text-center'
                                    disabled={!editable}
                                    min={minQuantity}
                                    max={maxQuantity}
                                />
                            </div>
                            {editable ? (
                                <CheckCircleIcon className='h-6 w-6 self-end mb-1' onClick={handleSaveClick} />
                            ) : (
                                <div className='h-4 w-4 md:h-6 md:w-6 self-end mb-1'> </div>
                            )}
                        </div>
                        {editable && (<p className='text-xs'>Click to save</p>)}
                    </div>
                    <div className='hidden lg:flex justify-center items-center cursor-pointer'>
                        <TrashIcon className=' mb-1 h-7 w-auto text-red-600 hover:text-red-500' onClick={deleteCartItem} />
                    </div>
                    <div className='mt-3 flex lg:hidden justify-around w-full'>
                        <h2 className=''><span className='text-xs'>You Pay</span><span className='text-xl text-black font-medium flex justify-center items-center'>₹{props.product.discountPrice} </span></h2>
                        <h2 className=''><span className='text-xs'>You Save</span><span className='text-xl text-green-600 font-medium flex justify-center items-center'>₹{props.product.pricePerPiece - (props.product.discountPrice || 0)}</span></h2>
                        <div className="flex gap-1 items-center border-gray-100">
                            {!editable ? (
                                <PencilIcon className='h-4 w-4 sm:h-6 sm:w-6 self-end mb-1' onClick={handleEditClick} />
                            ) : (
                                <div className='w-4 h-4 sm:h-6 sm:w-6 self-end mb-1'> </div>
                            )}
                            <div className='flex flex-col gap-1 items-center'>
                                <label htmlFor="quantity" className='text-md font-medium'>Qty</label>
                                <input
                                    type='number'
                                    id='quantity'
                                    name='quantity'
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.min(Math.max(parseInt(e.target.value), minQuantity), maxQuantity))}
                                    className='w-8 sm:w-12 px-0 py-2 rounded-lg text-center'
                                    disabled={!editable}
                                    min={minQuantity}
                                    max={maxQuantity}
                                />
                            </div>
                            {editable ? (
                                <CheckCircleIcon className='h-6 w-6 self-end mb-1' onClick={handleSaveClick} />
                            ) : (
                                <div className='h-6 w-6 self-end mb-1'> </div>
                            )}
                        </div>
                        <TrashIcon className=' mb-1 h-7 w-auto text-red-600 hover:text-red-500' onClick={deleteCartItem} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
