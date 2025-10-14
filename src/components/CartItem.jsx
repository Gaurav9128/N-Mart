import { CheckCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';
import { doc, getDoc, collection, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase/FirebaseConfig';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { cartTotalAtom } from '../store/atoms/totalCartQuantity';

const CartItem = (props) => {
    const [editable, setEditable] = useState(false);
    const [quantity, setQuantity] = useState(0);
    const [minQuantity, setMinQuantity] = useState(null);
    const [maxQuantity, setMaxQuantity] = useState(null);
    const navigate = useNavigate();
    const [cartTotal, setCartTotal] = useRecoilState(cartTotalAtom);

    useEffect(() => {
        getPricesData(props.product.variantId);
    }, [props.product.variantId]);

    const getPricesData = async (variationId) => {
        try {
            const docRef = collection(
                firestore,
                "products",
                props.product.productId,
                "variations",
                variationId,
                "prices"
            );
            const docSnap = await getDocs(docRef);

            docSnap.forEach((doc) => {
                const data = doc.data();
                setMinQuantity(data.minQuantity);
                setMaxQuantity(data.maxQuantity);
            });
        } catch (err) {
            console.error("Error fetching prices data:", err);
        }
    };

    useEffect(() => {
        setQuantity(props.product.quantity);
    }, [props.product.productId, props.product.variantId]);

    const handleEditClick = () => setEditable(true);

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
            const itemq = query(
                itemsCollection,
                where("productId", "==", props.product.productId),
                where("variantId", "==", props.product.variantId)
            );
            const docSnap = await getDocs(itemq);
            const itemDoc = doc(firestore, "carts", currdoc.id, "items", docSnap.docs[0].id);
            await updateDoc(itemDoc, { quantity: quantity });
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
            const itemq = query(
                itemsCollection,
                where("productId", "==", props.product.productId),
                where("variantId", "==", props.product.variantId)
            );
            const itemDoc = await getDocs(itemq);
            const docDel = doc(firestore, "carts", currdoc.id, "items", itemDoc.docs[0].id);
            await deleteDoc(docDel);
            setCartTotal(prevTotal => prevTotal - quantity);
            props.getCartItems();
        } catch (err) {
            console.error(err);
        }
    };

    const calculatedPrice = props.product.discountPrice
        ? props.product.discountPrice
        : props.product.pricePerPiece * quantity;

    return (
        <div className="h-auto lg:h-auto flex md:grid grid-cols-8 mb-6 rounded-lg border px-2 py-2">
            {/* Product Image */}
            <img
                src={props.product.productImage}
                alt="product"
                className="h-28 w-24 object-contain col-span-2 md:col-span-1 p-2 rounded-lg"
            />

            {/* Product Info */}
            <div className="col-span-6 md:col-span-7 lg:grid grid-cols-7 sm:mx-4 w-full sm:justify-between">
                <div className="mt-2 lg:mt-5 flex flex-col col-span-3 justify-center">
                    <h2
                        className="text-sm md:text-xl font-normal text-black hover:underline cursor-pointer"
                        onClick={() => navigate(`/product/${props.product.productId}`)}
                    >
                        {props.product.productTitle} : {props.product.variantName}
                    </h2>
                    <p className="mt-1 text-xs md:text-xl text-gray-600">
                        Variant: <span className="text-black font-medium">{props.product.variantName}</span>
                    </p>

                    {/* ✅ "You Pay" visible on mobile */}
                    <div className="flex lg:hidden mt-2 text-black font-semibold">
                        <span className="text-xs text-gray-600 mr-1">You Pay:</span>
                        <span className="text-base">₹{calculatedPrice}</span>
                    </div>
                </div>

                {/* Price (visible on desktop) */}
                <h2 className="hidden text-sm md:text-xl lg:flex text-black font-medium justify-center items-center">
                    ₹{calculatedPrice}
                </h2>

                {/* Quantity Editor (desktop) */}
                <div className="hidden mt-4 lg:flex flex-col justify-center items-center sm:mt-0">
                    <div className="flex gap-1 items-center border-gray-100">
                        {!editable ? (
                            <PencilIcon className="h-5 w-5 md:h-6 md:w-6 cursor-pointer" onClick={handleEditClick} />
                        ) : (
                            <div className="h-6 w-6" />
                        )}
                        <div className="flex flex-col gap-1 items-center">
                            <label htmlFor="quantity" className="text-md font-medium">Qty</label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(Math.min(Math.max(parseInt(e.target.value), minQuantity), maxQuantity))
                                }
                                className="w-10 md:w-12 p-2 rounded-lg text-center border"
                                disabled={!editable}
                                min={minQuantity}
                                max={maxQuantity}
                            />
                        </div>
                        {editable ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-600 cursor-pointer" onClick={handleSaveClick} />
                        ) : (
                            <div className="h-6 w-6" />
                        )}
                    </div>
                    {editable && <p className="text-xs">Click to save</p>}
                </div>

                {/* Delete (desktop) */}
                <div className="hidden lg:flex justify-center items-center cursor-pointer">
                    <TrashIcon
                        className="mb-1 h-7 w-auto text-red-600 hover:text-red-500"
                        onClick={deleteCartItem}
                    />
                </div>

                {/* ✅ Mobile bottom actions */}
                <div className="mt-3 flex lg:hidden justify-around w-full items-center">
                    {/* Quantity Edit */}
                    <div className="flex gap-1 items-center border-gray-100">
                        {!editable ? (
                            <PencilIcon
                                className="h-5 w-5 sm:h-6 sm:w-6 cursor-pointer"
                                onClick={handleEditClick}
                            />
                        ) : (
                            <div className="h-5 w-5 sm:h-6 sm:w-6" />
                        )}
                        <div className="flex flex-col gap-1 items-center">
                            <label htmlFor="quantity" className="text-md font-medium">Qty</label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(Math.min(Math.max(parseInt(e.target.value), minQuantity), maxQuantity))
                                }
                                className="w-10 sm:w-12 py-2 rounded-lg text-center border"
                                disabled={!editable}
                                min={minQuantity}
                                max={maxQuantity}
                            />
                        </div>
                        {editable ? (
                            <CheckCircleIcon
                                className="h-6 w-6 text-green-600 cursor-pointer"
                                onClick={handleSaveClick}
                            />
                        ) : (
                            <div className="h-6 w-6" />
                        )}
                    </div>

                    {/* Delete Button */}
                    <TrashIcon
                        className="mb-1 h-7 w-auto text-red-600 hover:text-red-500 cursor-pointer"
                        onClick={deleteCartItem}
                    />
                </div>
            </div>
        </div>
    );
};

export default CartItem;
