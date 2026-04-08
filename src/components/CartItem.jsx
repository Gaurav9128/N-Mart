import { CheckCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';
import { doc, collection, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { firestore } from '../firebase/FirebaseConfig';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { cartTotalAtom } from '../store/atoms/totalCartQuantity';
import { toast, ToastContainer } from 'react-toastify';

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
            toast.success("Product is removed from the cart!", { autoClose: 2000 });
        } catch (err) {
            console.error(err);
        }
    };

    // ✅ FIXED DECIMAL PRECISION: Number formatting added
    const calculatedPrice = useMemo(() => {
        const rawPrice = props.product.discountPrice
            ? props.product.discountPrice
            : props.product.pricePerPiece * quantity;
        return Number(rawPrice).toFixed(2);
    }, [props.product.discountPrice, props.product.pricePerPiece, quantity]);

    const toastContainer = useMemo(() => (
        <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
    ), []);

    return (
        <>
        <div className="h-auto flex flex-col md:grid md:grid-cols-12 mb-6 rounded-xl border px-4 py-4 bg-white shadow-sm items-center gap-4">
            {/* Product Image */}
            <div className="col-span-2 md:col-span-1 flex justify-center">
                <img
                    src={props.product.productImage}
                    alt="product"
                    className="h-20 w-20 object-contain p-1 rounded-lg border bg-gray-50"
                />
            </div>

            {/* Product Info & Price */}
            <div className="col-span-10 md:col-span-7 flex flex-col md:grid md:grid-cols-7 w-full gap-2">
                <div className="col-span-4 flex flex-col justify-center">
                    <h2
                        className="text-sm md:text-base font-bold text-black hover:underline cursor-pointer line-clamp-2"
                        onClick={() => navigate(`/product/${props.product.productId}`)}
                    >
                        {props.product.productTitle}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Variant: <span className="text-black font-semibold">{props.product.variantName}</span>
                    </p>
                </div>

                {/* Desktop Price */}
                <div className="hidden md:flex col-span-3 items-center justify-center font-black text-blue-600 text-lg">
                    ₹{calculatedPrice}
                </div>

                {/* Mobile Price View */}
                <div className="flex md:hidden items-center justify-between mt-2 border-t pt-2">
                    <span className="text-xs text-gray-500 font-bold uppercase">Price:</span>
                    <span className="text-lg font-black text-blue-600">₹{calculatedPrice}</span>
                </div>
            </div>

            {/* Quantity Control & Actions */}
            <div className="col-span-12 md:col-span-4 flex items-center justify-between md:justify-around w-full border-t md:border-t-0 pt-4 md:pt-0">
                {/* Quantity Editor */}
                <div className="flex gap-2 items-center">
                    {!editable ? (
                        <PencilIcon className="h-5 w-5 text-gray-400 cursor-pointer hover:text-blue-500" onClick={handleEditClick} />
                    ) : (
                        <div className="h-5 w-5" />
                    )}
                    
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Qty</span>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                            className={`w-12 p-1 text-center border rounded-lg font-bold text-sm ${editable ? 'bg-white border-blue-500' : 'bg-gray-50 border-transparent'}`}
                            disabled={!editable}
                            min={minQuantity}
                            max={maxQuantity}
                        />
                    </div>

                    {editable ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-600 cursor-pointer animate-pulse" onClick={handleSaveClick} />
                    ) : (
                        <div className="h-6 w-6" />
                    )}
                </div>

                {/* Delete Button */}
                <button onClick={deleteCartItem} className="p-2 hover:bg-red-50 rounded-full transition-colors group">
                    <TrashIcon className="h-6 w-6 text-red-500 group-hover:text-red-600" />
                </button>
            </div>
        </div>
        {toastContainer}
        </>
    );
};

export default CartItem;