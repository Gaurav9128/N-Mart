import { collection, doc, getDoc, getDocs, query, where, addDoc, arrayUnion, updateDoc, deleteDoc, increment } from 'firebase/firestore';
import React, { useEffect, useState, Fragment, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { firestore } from '../firebase/FirebaseConfig';
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon, TrashIcon } from '@heroicons/react/20/solid'
import { ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRecoilState } from 'recoil';
import { cartTotalAtom } from '../store/atoms/totalCartQuantity';

const Item = (props) => {
    console.log("props",props)
    const [prices, setPrices] = useState([[]]);
    const [variations, setVariations] = useState([]);
    const [selectedVariant, setSelectedVariant] = useState();
    const [quantity, setQuantity] = useState(null);
    const navigate = useNavigate();
    const [cartTotal, setCartTotal] = useRecoilState(cartTotalAtom);
    const [mrp, setMrp] = useState(null);


    const pricePerPiece = useMemo(() => {
        for (let i = 0; i < prices.length; i++) {
            if (quantity >= prices[i][0] && quantity <= prices[i][1]) {
                return prices[i][2];
            }
        }

    }, [prices, quantity, selectedVariant])

    const total = useMemo(() => {
        for (let i = 0; i < prices.length; i++) {
            if (quantity >= prices[i][0] && quantity <= prices[i][1]) {
                return (quantity * prices[i][2]).toFixed(2); // Fix to 2 decimal places
            }
        }
    }, [prices, quantity, selectedVariant])

    const minimumQuantityOfItem = useMemo(() => {
        let minimumQuantityOfProduct = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < prices.length; i++) {
            if (prices[i][0] < minimumQuantityOfProduct) minimumQuantityOfProduct = prices[i][0];
        }
        return minimumQuantityOfProduct;
    }, [prices, selectedVariant]);
    const maximumQuantityOfItem = useMemo(() => {
        let maximumQuantityOfProduct = 0;
        for (let i = 0; i < prices.length; i++) {
            if (prices[i][1] > maximumQuantityOfProduct) maximumQuantityOfProduct = prices[i][1];
        }
        return maximumQuantityOfProduct;
    }, [prices, selectedVariant]);

    useEffect(() => {
        getVariationData();
    }, [props.id]);

    const getPricesData = async (variationId) => {
        const docRef = collection(firestore, "products", props.id, "variations", variationId, "prices");
        const docSnap = await getDocs(docRef);
        let pricesArray = [];
        let i = 0;
        docSnap.forEach((doc) => {
            if (!pricesArray[i]) {
                pricesArray[i] = [];
            }
            pricesArray[i][0] = doc.data().minQuantity;
            pricesArray[i][1] = doc.data().maxQuantity;
            pricesArray[i][2] = doc.data().price;
            i++;
        })
        setPrices(pricesArray); // <-- Here you're setting the pricesArray state
        console.log("price"+prices) // <-- This line might not reflect the updated state immediately
        let minimumQuantityOfProduct = Number.MAX_SAFE_INTEGER;
        let maximumQuantityOfProduct = 0;
        for (let i = 0; i < pricesArray.length; i++) {
            if (pricesArray[i][0] < minimumQuantityOfProduct) minimumQuantityOfProduct = pricesArray[i][0];
            if (pricesArray[i][1] > maximumQuantityOfProduct) maximumQuantityOfProduct = pricesArray[i][1];
        }
        setQuantity(minimumQuantityOfProduct);
        console.log("minimumQuantityOfProduct "+minimumQuantityOfProduct)
    }
    
    const getVariationData = async () => {
        const docRef = collection(firestore, "products", props.id, "variations");
        const docSnap = await getDocs(docRef);
        const newData = docSnap.docs.map(doc => ({ variationId: doc.id, ...doc.data() }));
    
        setVariations(newData);
        setSelectedVariant(newData[0]);
        
        // Fetch MRP data
        const productDocRef = doc(firestore, "products", props.id);
        const productDocSnap = await getDoc(productDocRef);
        if (productDocSnap.exists()) {
            setMrp(productDocSnap.data().mrp);
        } else {
            console.error("No such document!");
        }
    
        getQuantity(newData[0].variationId);
        getPricesData(newData[0].variationId);
    }
    

  const getQuantity = async (variationid) => {
    console.log("variationid"+variationid)
    const cartRef = collection(firestore, 'carts');
    const q = query(cartRef, where("userId", "==", localStorage.getItem('userId')));
    const querySnapshot = await getDocs(q);
    const currdoc = querySnapshot.docs[0];
    const itemsCollection = collection(firestore, "carts", currdoc.id, "items");
    const itemq = query(itemsCollection, where("productId", "==", props.id), where("variantId", "==", variationid))
    const docSnap = await getDocs(itemq);
    if (docSnap.docs[0]) {
        // setQuantity(docSnap.docs[0].data().quantity);
        // console.log("docSnap.docs[0].data().quantity "+docSnap.docs[0].data().quantity) // <-- Here you're updating the quantity state
    
    }
}

const increaseQuantity = () => {
    const newQuantity = Number(quantity) + 1;
    if (newQuantity <= maximumQuantityOfItem) {
        setQuantity(newQuantity);
        console.log("newQuantity "+newQuantity)
    }
};

const decreaseQuantity = () => {
    const newQuantity = Number(quantity) - 1;
    if (newQuantity >= minimumQuantityOfItem) {
        setQuantity(newQuantity);
    }
};


  



    const handleVariantChange = (v) => {
        let newVariant = variations.find(variant => variant.name === v);
        setSelectedVariant(newVariant);
    };
    
    useEffect(() => {
        if (selectedVariant) {
            getQuantity(selectedVariant.variationId);
            getPricesData(selectedVariant.variationId);
        }
    }, [selectedVariant]);
    
    
    const addToCart = async () => {
        if (quantity < minimumQuantityOfItem || quantity > maximumQuantityOfItem) {
            alert(`Minimum quantity of this product is ${minimumQuantityOfItem} & maximum quantity of this product is ${maximumQuantityOfItem}`);
            return;
        }
    
        try {
            const cartRef = collection(firestore, 'carts');
            if (localStorage.getItem('userId')) {
                const q = query(cartRef, where("userId", "==", localStorage.getItem('userId')));
                const querySnapshot = await getDocs(q);
                let docRef;
    
                if (querySnapshot.empty) {
                    docRef = await addDoc(cartRef, {
                        userId: localStorage.getItem('userId')
                    });
                } else {
                    docRef = querySnapshot.docs[0].id;
                }
    
                const itemsCollection = collection(firestore, "carts", docRef, "items");
                const itemQuery = query(itemsCollection, where("productId", "==", props.id), where("variantId", "==", selectedVariant.variationId));
                const itemDoc = await getDocs(itemQuery);
    
                if (!itemDoc.empty) {
                    itemDoc.forEach(async (idoc) => {
                        const itemRef = doc(firestore, "carts", docRef, "items", idoc.id);
                        await updateDoc(itemRef, {
                            pricePerPiece: pricePerPiece,
                            quantity: quantity
                        });
                    });
                    alert("Your product is updated in the cart!");
                } else {
                    await addDoc(itemsCollection, {
                        productId: props.id,
                        variantId: selectedVariant.variationId,
                        quantity: quantity,
                        productImage: props.image,
                        productTitle: props.title,
                        pricePerPiece: pricePerPiece,
                        variantName: selectedVariant.name,
                        productBrand: props.brand
                    });
                    alert("Your product is updated in the cart!");
                }
    
                getCartTotal();
            } else {
                alert("Sign in first");
            }
        } catch (err) {
            console.error(err);
        }
    };
    
    useEffect(() => {
        console.log("Current quantity:", quantity);
    }, [quantity]);
   
    
    const getCartTotal = async () => {
        const q = query(collection(firestore, "carts"), where("userId", "==", localStorage.getItem("userId")));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const currdoc = querySnapshot.docs[0];
            const existingItemsCollection = collection(firestore, 'carts', currdoc.id, "items");
            const docSnap = await getDocs(existingItemsCollection);
            let allItems = [];
            if (!docSnap.empty) {
                docSnap.forEach((doc) => {
                    allItems.push({ id: doc.id, ...doc.data() });
                })
                setCartTotal(allItems.reduce((total, currentItem) => { return total + parseInt(currentItem.quantity) }, 0))

            }
        }

    }
    
    const handleQuantityChange = (e) => {
        const inputValue = e.target.value;
        setQuantity(e.target.value);

    }
    useEffect(() => {
        // Only set the quantity when the data is fetched and available
        if (prices.length > 0) {
            setQuantity(minimumQuantityOfItem); 
            console.log(minimumQuantityOfItem)// Set initial quantity to the minimum quantity
        }
    }, []);
    return (

        <div className="w-11/12 p-2 lg:p-4 sm:w-full lg:h-auto sm:h-auto bg-white border-2 shadow-md rounded-xl">
            {selectedVariant && <>
                <div className='w-full sm:pt-4 flex justify-around sm:flex-col' >

                    <img src={props.image} loading="lazy" alt="Product" className="h-24 md:h-28 lg:h-32 w-auto object-contain rounded-t-xl cursor-pointer duration-500 hover:scale-105" onClick={() => { navigate(`/product/${props.id}`) }} />
                    <div className="w-1/2 sm:w-full gap-2 sm:gap-0  flex flex-col sm:px-4 md:px-2 sm:py-3">
                        <span className="text-gray-400 mr-3 uppercase text-xs">{props.brand}</span>
                        <p className="text-md sm:text-sm lg:text-lg font-medium text-gray-600 truncate block capitalize cursor-pointer hover:underline" onClick={() => { navigate(`/product/${props.id}`) }}>{props.title} : <span>{selectedVariant.name}</span> </p>
                        {/* <p className="text-md text-gray-600 cursor-auto ml-2">₹83 - ₹110</p> */}
                        <Listbox value={selectedVariant.name} onChange={handleVariantChange}>
                            <div className="hidden sm:block relative mt-1">
                                <Listbox.Button className="cursor-pointer hover:border-2 hover:border-blue-500 relative w-full border-2 cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                    <span className="block truncate">{selectedVariant.name}</span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon
                                            className="h-5 w-5 text-gray-400"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </Listbox.Button>
                                <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                        {variations.map((variation, indx) => (
                                            <Listbox.Option
                                                key={indx}
                                                className={({ active }) =>
                                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-200 text-black' : 'text-gray-900'
                                                    }`
                                                }
                                                value={variation.name}
                                            >
                                                {({ selectedVariant }) => (
                                                    <>
                                                        <span
                                                            className={`block truncate ${selectedVariant ? 'font-medium' : 'font-normal'
                                                                }`}
                                                        >
                                                            {variation.name}
                                                        </span>
                                                        {selectedVariant ? (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        ) : null}
                                                    </>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </Listbox>
                        <div className='hidden sm:flex mt-2 w-full flex justify-between items-center'>
                            <div className="flex items-center border-gray-100">
                                    <button className={`${quantity > minimumQuantityOfItem ? "bg-blue-500 hover:bg-blue-300" : "bg-gray-200"} text-white cursor-pointer rounded-l py-1 px-3.5 duration-100 `} disabled={quantity <= minimumQuantityOfItem ? true : false} onClick={decreaseQuantity}> - </button>
                                    <input className="h-8 w-14 border bg-white text-center text-black text-xs outline-none py-2" type='number' value={quantity} onChange={handleQuantityChange} min={minimumQuantityOfItem} max={maximumQuantityOfItem} />
                                    <button className={`bg-blue-500 hover:bg-blue-300 h-8 text-white text-xl rounded-r  px-3 duration-100`} onClick={increaseQuantity}> + </button>
                            </div>
                            <h2 className=' text-xs flex flex-col gap-1'><span className='text-gray-500 font-bold'>Rs/pc</span><span className='text-black'>{pricePerPiece}</span></h2>
                            <h2 className=' text-xs flex flex-col gap-1'><span className='text-gray-500 font-bold'>Total</span><span className='text-black'>{total}</span></h2>
                        </div>
                        {maximumQuantityOfItem > 0 ? (
                            <div className="flex flex-col mt-2 w-full">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Available Quantity:</span>
                                    <span className="text-black">{maximumQuantityOfItem}</span>
                                </div>
                                <button className="mt-2 w-full hidden sm:inline-flex rounded-md flex gap-2 py-2 justify-center items-center bg-blue-500 hover:bg-blue-400" onClick={addToCart}>
                                    <ShoppingCartIcon className="w-auto h-5 text-white" />
                                    <span className="text-white font-medium text-sm">Add To Cart</span>
                                </button>
                            </div>
                        ) : (
                            <div className="text-red-500 mt-2 text-sm font-medium">Out of Stock</div>
                        )}
                    </div>
                </div>
                <div className='block sm:hidden'>
                    <Listbox value={selectedVariant.name} onChange={handleVariantChange}>
                        <div className="relative mt-1">
                            <Listbox.Button className="cursor-pointer hover:border-2 hover:border-blue-500 relative w-full border-2 cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                <span className="block truncate">{selectedVariant.name}</span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronUpDownIcon
                                        className="h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                    />
                                </span>
                            </Listbox.Button>
                            <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                    {variations.map((variation, indx) => (
                                        <Listbox.Option
                                            key={indx}
                                            className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-200 text-black' : 'text-gray-900'
                                                }`
                                            }
                                            value={variation.name}
                                        >
                                            {({ selectedVariant }) => (
                                                <>
                                                    <span
                                                        className={`block truncate ${selectedVariant ? 'font-medium' : 'font-normal'
                                                            }`}
                                                    >
                                                        {variation.name}
                                                    </span>
                                                    {selectedVariant ? (
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    ) : null}
                                                </>
                                            )}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </Transition>
                        </div>
                    </Listbox>
                    <button className=' mt-2 w-full rounded-md flex gap-2 py-2 justify-center items-center bg-blue-500 hover:bg-blue-400' onClick={addToCart}>
                        <ShoppingCartIcon className='w-auto h-5 text-white' />
                        <span className='text-white font-medium text-sm'>Add To Cart </span>
                    </button>
                    <div className=' mt-2 w-full flex justify-between items-center'>
                        <div className="flex items-center border-gray-100">
                            <button className={`${quantity > minimumQuantityOfItem ? "block" : "hidden"} text-white cursor-pointer rounded-l bg-blue-500 py-1 px-3.5 duration-100 hover:bg-blue-300`} disabled={quantity <= minimumQuantityOfItem ? true : false} onClick={decreaseQuantity}> - </button>
                            <span className="h-8 w-8 border bg-white text-center text-black text-xs outline-none py-2">{quantity}</span>
                            <button className={` " bg-blue-500 hover:bg-blue-300"} h-8 text-white text-xl rounded-r  px-3 duration-100`} onClick={increaseQuantity}> + </button>
                        </div>
                    </div>
                </div>
            </>
            }
        </div>
    )
}

export default Item
