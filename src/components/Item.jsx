import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState, Fragment, useMemo } from 'react'
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase/FirebaseConfig';
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useRecoilState } from 'recoil';
import { cartTotalAtom } from '../store/atoms/totalCartQuantity';
import { toast } from 'react-toastify';   // ✅ Added Toastify import
import 'react-toastify/dist/ReactToastify.css';

const Item = (props) => {
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
                return (quantity * prices[i][2]).toFixed(2);
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
        setPrices(pricesArray);
        let minimumQuantityOfProduct = Number.MAX_SAFE_INTEGER;
        let maximumQuantityOfProduct = 0;
        for (let i = 0; i < pricesArray.length; i++) {
            if (pricesArray[i][0] < minimumQuantityOfProduct) minimumQuantityOfProduct = pricesArray[i][0];
            if (pricesArray[i][1] > maximumQuantityOfProduct) maximumQuantityOfProduct = pricesArray[i][1];
        }
        setQuantity(minimumQuantityOfProduct);
    }

    const getVariationData = async () => {
        const docRef = collection(firestore, "products", props.id, "variations");
        const docSnap = await getDocs(docRef);
        const newData = docSnap.docs.map(doc => ({ variationId: doc.id, ...doc.data() }));

        setVariations(newData);
        setSelectedVariant(newData[0]);

        const productDocRef = doc(firestore, "products", props.id);
        const productDocSnap = await getDoc(productDocRef);
        if (productDocSnap.exists()) {
            setMrp(productDocSnap.data().mrp);
        }

        getQuantity(newData[0].variationId);
        getPricesData(newData[0].variationId);
    }

    const getQuantity = async (variationid) => {
        const cartRef = collection(firestore, 'carts');
        const q = query(cartRef, where("userId", "==", localStorage.getItem('userId')));
        const querySnapshot = await getDocs(q);
        const currdoc = querySnapshot.docs[0];
        const itemsCollection = collection(firestore, "carts", currdoc.id, "items");
        const itemq = query(itemsCollection, where("productId", "==", props.id), where("variantId", "==", variationid))
        const docSnap = await getDocs(itemq);
        if (docSnap.docs[0]) {
            // already exists
        }
    }

    const increaseQuantity = () => {
        const newQuantity = Number(quantity) + 1;
        if (newQuantity <= maximumQuantityOfItem) {
            setQuantity(newQuantity);
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
            toast.error(`Minimum quantity is ${minimumQuantityOfItem} & maximum is ${maximumQuantityOfItem}`);
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
                    toast.success("✅ Your product is updated in the cart!");
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
                    toast.success("🛒 Product added to the cart!");
                }

                getCartTotal();
            } else {
                toast.warning("⚠️ Please sign in first");
            }
        } catch (err) {
            console.error(err);
            toast.error("❌ Something went wrong");
        }
    };

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
        setQuantity(e.target.value);
    }

    return (
        <div className="w-11/12 p-2 lg:p-4 sm:w-full lg:h-auto sm:h-auto bg-white border-2 shadow-md rounded-xl">
            {/* --- UI Code (unchanged) --- */}
            {/* AddToCart button ab Toastify trigger karega */}
        </div>
    )
}

export default Item;
