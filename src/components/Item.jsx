import { 
    collection, 
    doc, 
    getDocs, 
    query, 
    where, 
    addDoc, 
    updateDoc 
} from 'firebase/firestore';
import React, { useEffect, useState, Fragment, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase/FirebaseConfig';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useRecoilState } from 'recoil';
import { cartTotalAtom } from '../store/atoms/totalCartQuantity';
import Swal from 'sweetalert2';

const Item = (props) => {
    const [prices, setPrices] = useState([]);
    const [variations, setVariations] = useState([]);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();
    const [cartTotal, setCartTotal] = useRecoilState(cartTotalAtom);

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
    });

    const getPricesData = async (variationId) => {
        const docRef = collection(firestore, "products", props.id, "variations", variationId, "prices");
        const docSnap = await getDocs(docRef);
        let pricesArray = docSnap.docs.map(doc => [
            doc.data().minQuantity,
            doc.data().maxQuantity,
            doc.data().price
        ]);
        setPrices(pricesArray);
        
        if (pricesArray.length > 0) {
            setQuantity(Math.min(...pricesArray.map(p => p[0])));
        }
    };

    const getVariationData = async () => {
        try {
            const docRef = collection(firestore, "products", props.id, "variations");
            const docSnap = await getDocs(docRef);
            const newData = docSnap.docs.map(doc => ({ variationId: doc.id, ...doc.data() }));

            if (newData.length > 0) {
                setVariations(newData);
                setSelectedVariant(newData[0]);
                getPricesData(newData[0].variationId);
            }
        } catch (error) {
            console.error("Error fetching variations:", error);
        }
    };

    useEffect(() => {
        getVariationData();
    }, [props.id]);

    const pricePerPiece = useMemo(() => {
        const found = prices.find(p => quantity >= p[0] && quantity <= p[1]);
        return found ? found[2] : (prices[0] ? prices[0][2] : 0);
    }, [prices, quantity]);

    const total = useMemo(() => (quantity * pricePerPiece).toFixed(2), [quantity, pricePerPiece]);
    const minQty = useMemo(() => (prices.length > 0 ? Math.min(...prices.map(p => p[0])) : 1), [prices]);
    const maxQty = useMemo(() => (prices.length > 0 ? Math.max(...prices.map(p => p[1])) : 0), [prices]);

    const getCartTotal = async () => {
        const userId = localStorage.getItem("userId");
        const q = query(collection(firestore, "carts"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const cartDocId = querySnapshot.docs[0].id;
            const itemsSnap = await getDocs(collection(firestore, 'carts', cartDocId, "items"));
            let totalItemsCount = 0;
            itemsSnap.forEach((doc) => {
                totalItemsCount += parseInt(doc.data().quantity || 0);
            });
            setCartTotal(totalItemsCount);
        }
    };

    const addToCart = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return Toast.fire({ icon: 'error', title: 'Please login first' });

        if (quantity < minQty || quantity > maxQty) {
            return Toast.fire({ icon: 'warning', title: `Qty must be ${minQty}-${maxQty}` });
        }

        try {
            const cartRef = collection(firestore, 'carts');
            const q = query(cartRef, where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            let cartDocId;

            if (querySnapshot.empty) {
                const newDoc = await addDoc(cartRef, { userId: userId });
                cartDocId = newDoc.id;
            } else {
                cartDocId = querySnapshot.docs[0].id;
            }

            const itemsCol = collection(firestore, "carts", cartDocId, "items");
            const itemQuery = query(itemsCol, 
                where("productId", "==", props.id), 
                where("variantId", "==", selectedVariant.variationId)
            );
            const itemSnapshot = await getDocs(itemQuery);

            if (!itemSnapshot.empty) {
                const itemRef = doc(firestore, "carts", cartDocId, "items", itemSnapshot.docs[0].id);
                await updateDoc(itemRef, {
                    quantity: quantity,
                    pricePerPiece: pricePerPiece
                });
                Toast.fire({ icon: 'success', title: 'Cart updated!' });
            } else {
                await addDoc(itemsCol, {
                    productId: props.id,
                    variantId: selectedVariant.variationId,
                    quantity: quantity,
                    productImage: props.image,
                    productTitle: props.title,
                    pricePerPiece: pricePerPiece,
                    variantName: selectedVariant.name,
                    productBrand: props.brand,
                    addedAt: new Date()
                });
                Toast.fire({ icon: 'success', title: 'Added to cart!' });
            }
            getCartTotal();
        } catch (err) {
            Toast.fire({ icon: 'error', title: 'Failed to update cart' });
        }
    };

    return (
        <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full overflow-hidden">
            {!selectedVariant ? (
                <div className="h-64 flex items-center justify-center animate-pulse bg-gray-50 text-gray-400 text-[10px]">
                    Loading...
                </div>
            ) : (
                <>
                    {/* Image Section - Reduced padding for mobile */}
                    <div className="relative aspect-square bg-gray-50 p-2 md:p-4 cursor-pointer overflow-hidden" onClick={() => navigate(`/product/${props.id}`)}>
                        <img src={props.image} alt={props.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                    </div>

                    <div className="p-3 flex flex-col flex-grow">
                        <span className="text-[9px] text-blue-500 font-bold uppercase tracking-tight">{props.brand}</span>
                        
                        {/* Title - adjusted height for consistency */}
                        <h3 className="text-[12px] md:text-sm font-semibold text-gray-800 line-clamp-2 h-8 md:h-10 mb-2 leading-tight hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/product/${props.id}`)}>
                            {props.title}
                        </h3>

                        {/* Variant Selector - Compact for mobile */}
                        <Listbox value={selectedVariant.name} onChange={(name) => {
                            const v = variations.find(varnt => varnt.name === name);
                            setSelectedVariant(v);
                            getPricesData(v.variationId);
                        }}>
                            <div className="relative">
                                <Listbox.Button className="w-full py-1 pl-2 pr-6 text-left bg-gray-50 border border-gray-200 rounded-md text-[11px]">
                                    <span className="block truncate">{selectedVariant.name}</span>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-1"><ChevronUpDownIcon className="h-3 w-3 text-gray-400" /></span>
                                </Listbox.Button>
                                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                    <Listbox.Options className="absolute bottom-full mb-1 z-30 max-h-40 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 text-[11px] focus:outline-none">
                                        {variations.map((v, i) => (
                                            <Listbox.Option key={i} value={v.name} className={({ active }) => `cursor-pointer select-none py-2 px-2 ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}`}>{v.name}</Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </Listbox>

                        {/* Price & Qty Row */}
                        <div className="mt-3 flex items-center justify-between gap-1">
                            <div>
                                <p className="text-[8px] text-gray-400 font-bold">PRICE</p>
                                <p className="text-sm md:text-base font-black text-gray-900">₹{pricePerPiece}</p>
                            </div>
                            <div className="flex items-center bg-gray-100 rounded-md p-0.5">
                                <button onClick={() => setQuantity(q => Math.max(minQty, q - 1))} className="w-5 h-5 bg-white rounded shadow-sm text-xs">-</button>
                                <span className="px-1.5 text-[10px] font-bold">{quantity}</span>
                                <button onClick={() => setQuantity(q => Math.min(maxQty, q + 1))} className="w-5 h-5 bg-white rounded shadow-sm text-xs">+</button>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between items-center text-[9px]">
                            <span className="text-gray-500">Total: <span className="text-gray-900 font-bold">₹{total}</span></span>
                            <span className="text-gray-400">Stock: {maxQty}</span>
                        </div>

                        {/* Add to Cart Button */}
                        <button onClick={addToCart} className="mt-3 w-full py-2 bg-gray-900 hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95">
                            <ShoppingBagIcon className="h-3.5 w-3.5" /> Add
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Item;