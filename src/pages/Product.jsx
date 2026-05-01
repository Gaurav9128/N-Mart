import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import {
    ShoppingCartIcon,
    PlusIcon,
    MinusIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/solid';
import { firestore } from '../firebase/FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doc, getDoc, query, where, collection, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { cartTotalAtom } from '../store/atoms/totalCartQuantity';
import FooterComponent from '../components/FooterComponent';

const Product = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [prices, setPrices] = useState([]);
    const [activeImage, setActiveImage] = useState("");
    const [variations, setVariations] = useState([]); 
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [cartTotal, setCartTotal] = useRecoilState(cartTotalAtom);

    useEffect(() => {
        getProductDetails();
        window.scrollTo(0, 0);
    }, [id]);

    const getProductDetails = async () => {
        const productRef = doc(firestore, 'products', id);
        const prod = await getDoc(productRef);
        if (prod.exists()) {
            const data = prod.data();
            setProduct(data);
            setActiveImage(Array.isArray(data.image) ? data.image[0] : data.image);
            getVariationData();
            getRelatedProducts(data.category, data.brand);
        }
    };

    const getVariationData = async () => {
        const docRef = collection(firestore, 'products', id, 'variations');
        const docSnap = await getDocs(docRef);
        const newData = docSnap.docs.map(doc => ({ variationId: doc.id, ...doc.data() }));
        setVariations(newData);
        if (newData.length > 0) {
            setSelectedVariant(newData[0]);
            getPricesData(newData[0].variationId);
        }
    };

    const getPricesData = async (vId) => {
        const docRef = collection(firestore, 'products', id, 'variations', vId, 'prices');
        const docSnap = await getDocs(docRef);
        const pArray = docSnap.docs.map(doc => [doc.data().minQuantity, doc.data().maxQuantity, doc.data().price]);
        setPrices(pArray);
        if (pArray.length > 0) setQuantity(pArray[0][0]);
    };

    const getRelatedProducts = async (cat, brand) => {
        const q = query(collection(firestore, 'products'), where('category', '==', cat));
        const snap = await getDocs(q);
        setRelatedProducts(snap.docs.filter(d => d.id !== id).map(d => ({ id: d.id, ...d.data() })));
    };

    const currentPricePerPiece = useMemo(() => {
        const p = prices.find(p => quantity >= p[0] && quantity <= p[1]);
        return p ? p[2] : (prices[0] ? prices[0][2] : 0);
    }, [prices, quantity]);

    // --- ✅ FIXED DYNAMIC SAVINGS CALCULATION ---
    const priceAnalysis = useMemo(() => {
        const sellingPrice = parseFloat(currentPricePerPiece);
        
        // 1. Database se MRP uthao (selectedVariant ya product se)
        // 2. Agar MRP nahi hai, toh use 0 rakho (fallback hata diya)
        const mrpFromDB = selectedVariant?.mrp ? parseFloat(selectedVariant.mrp) : (product?.mrp ? parseFloat(product.mrp) : 0);
        
        // 3. Discount sirf tab calculate karo jab MRP Selling Price se badi ho
        const hasDiscount = mrpFromDB > sellingPrice;
        const discountPercentage = hasDiscount ? Math.round(((mrpFromDB - sellingPrice) / mrpFromDB) * 100) : 0;

        return { 
            mrp: mrpFromDB.toFixed(0), 
            discount: discountPercentage,
            showSaveSection: hasDiscount // Yeh decide karega ki discount dikhana hai ya nahi
        };
    }, [currentPricePerPiece, selectedVariant, product]);

    const addToCart = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            toast.error('Please sign in first');
            return;
        }
        setAddingToCart(true);
        try {
            const cartRef = collection(firestore, 'carts');
            const q = query(cartRef, where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            let cartId;
            if (querySnapshot.empty) {
                const docRef = await addDoc(cartRef, { userId });
                cartId = docRef.id;
            } else {
                cartId = querySnapshot.docs[0].id;
            }
            const itemsCollection = collection(firestore, 'carts', cartId, 'items');
            const itemQuery = query(itemsCollection, where('productId', '==', id), where('variantId', '==', selectedVariant.variationId));
            const itemDoc = await getDocs(itemQuery);

            if (!itemDoc.empty) {
                await updateDoc(itemDoc.docs[0].ref, { quantity, pricePerPiece: currentPricePerPiece });
            } else {
                await addDoc(itemsCollection, {
                    productId: id, variantId: selectedVariant.variationId, quantity,
                    productImage: activeImage, productTitle: product.title,
                    pricePerPiece: currentPricePerPiece, variantName: selectedVariant.name, productBrand: product.brand,
                });
            }
            toast.success('Added to Bag! 🛒');
        } catch (err) {
            toast.error('Failed to add product');
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen">
            <Navbar />
            <ToastContainer position="top-right" autoClose={2000} />

            {product && selectedVariant && (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">

                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-16">
                        <div className="flex flex-col lg:flex-row">
                            <div className="lg:w-1/2 p-8 md:p-12 border-r border-gray-50 flex flex-col items-center bg-white">
                                <div className="aspect-square w-full max-w-md flex items-center justify-center overflow-hidden mb-8 transition-all">
                                    <img src={activeImage} className="w-full h-full object-contain hover:scale-110 transition-transform duration-700" alt="Main Product" />
                                </div>
                                <div className="flex gap-4 overflow-x-auto w-full justify-center scrollbar-hide">
                                    {Array.isArray(product.image) && product.image.map((img, idx) => (
                                        <button key={idx} onClick={() => setActiveImage(img)} className={`shrink-0 w-16 h-16 rounded-2xl border-2 transition-all p-1.5 ${activeImage === img ? 'border-blue-600 bg-white shadow-md' : 'border-transparent bg-gray-50'}`}>
                                            <img src={img} className="w-full h-full object-contain" alt="Thumbnail" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                <div className="mb-10">
                                    <span className="text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] bg-blue-50 px-4 py-1.5 rounded-full">{product.brand}</span>
                                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 mt-6 leading-tight tracking-tight">
                                        {product.title} <br /> <span className="text-gray-300 font-medium text-2xl md:text-3xl">| {selectedVariant.name}</span>
                                    </h1>
                                </div>

                                <div className="flex items-center gap-8 mb-12">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Selling Price</p>
                                        <div className="flex items-center gap-4">
                                            <span className="text-4xl font-black text-gray-900 tracking-tighter">₹{currentPricePerPiece}</span>
                                            
                                            {/* ✅ MRP cross line sirf tab jab asli discount ho */}
                                            {priceAnalysis.showSaveSection && (
                                                <span className="text-xl text-gray-300 line-through font-bold">₹{priceAnalysis.mrp}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* ✅ "Save OFF" section sirf tab dikhega jab MRP database mein ho aur Selling Price se zyada ho */}
                                    {priceAnalysis.showSaveSection ? (
                                        <>
                                            <div className="h-12 w-[1px] bg-gray-100"></div>
                                            <div className="flex flex-col">
                                                <span className="text-green-600 font-black text-xs bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">Save {priceAnalysis.discount}% OFF</span>
                                                <p className="text-[9px] text-gray-400 mt-1 font-bold">Inclusive of all taxes</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col">
                                            <p className="text-[9px] text-gray-400 mt-1 font-bold uppercase tracking-widest">Inclusive of all taxes</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-10">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">Choose Variation</label>
                                    <div className="flex flex-wrap gap-3">
                                        {variations.map((v) => (
                                            <button 
                                                key={v.variationId} 
                                                onClick={() => { setSelectedVariant(v); getPricesData(v.variationId); }} 
                                                className={`px-6 py-3 rounded-2xl text-[11px] font-black border-2 transition-all uppercase tracking-wider ${selectedVariant.variationId === v.variationId ? 'border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-100' : 'border-gray-100 text-gray-400 bg-white hover:border-gray-300'}`}
                                            >
                                                {v.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-100 w-full sm:w-auto">
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-red-500 transition-all active:scale-90"><MinusIcon className="w-4 h-4" /></button>
                                        <span className="w-16 text-center font-black text-2xl text-gray-800">{quantity}</span>
                                        <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-green-500 transition-all active:scale-90"><PlusIcon className="w-4 h-4" /></button>
                                    </div>
                                    <button disabled={addingToCart} onClick={addToCart} className="flex-grow w-full bg-gray-900 hover:bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-gray-300 shadow-xl shadow-gray-200">
                                        <ShoppingCartIcon className="h-5 w-5" />
                                        {addingToCart ? 'Adding to Bag...' : 'Add to Bag'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-16 items-start">
                        <div className="lg:col-span-2 space-y-16">
                            <div className="bg-[#FFD944] rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-inner">
                                <div className="relative z-10 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-900 mb-6">Premium Selection</p>
                                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight mb-10">
                                        Clean Ingredients. <br className="hidden md:block" />
                                        <span className="text-yellow-800 italic">Trusted by Experts.</span>
                                    </h2>
                                    <div
                                        className="mt-8 text-sm md:text-lg font-medium text-gray-800 max-w-3xl mx-auto leading-[1.8] md:leading-[2.2] admin-description whitespace-pre-line text-center opacity-90"
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                    />
                                </div>
                                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-yellow-300 rounded-full blur-[80px] opacity-40"></div>
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-200 rounded-full blur-[80px] opacity-30"></div>
                            </div>

                            <div className="bg-white rounded-[3.5rem] border border-gray-100 p-12 flex flex-col md:flex-row items-center gap-14 shadow-sm">
                                <div className="w-64 h-80 bg-[#F9F9F9] rounded-[2.5rem] flex items-center justify-center p-8 border border-gray-50 shrink-0">
                                    <img src={activeImage} className="w-full h-full object-contain" alt="Pack Detail" />
                                </div>
                                <div className="flex-grow space-y-10 text-center md:text-left">
                                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 leading-none tracking-tight">
                                        Skip the duplicates. <br/> 
                                        <span className="text-orange-500 underline decoration-4 underline-offset-[12px]">Shop the Brand Vault.</span>
                                    </h3>
                                    <div className="grid gap-5 max-w-md mx-auto md:mx-0">
                                        <div className="flex items-center gap-5 bg-blue-50/60 p-5 rounded-2xl border border-blue-100/60">
                                            <CheckCircleIcon className="w-7 h-7 text-blue-500 shrink-0" />
                                            <p className="text-[11px] font-black text-blue-800 uppercase tracking-[0.15em] text-left">
                                                Every Product Batch-Verified for Authenticity
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-5 bg-orange-50/60 p-5 rounded-2xl border border-orange-100/60">
                                            <XCircleIcon className="w-7 h-7 text-orange-400 shrink-0" />
                                            <p className="text-[11px] font-black text-orange-800 uppercase tracking-[0.15em] text-left">
                                                No Near-Expiry Goods – Only Fresh Market Stock
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <aside className="space-y-10 sticky top-32">
                            <h3 className="text-xs font-black text-gray-900 px-3 uppercase tracking-[0.4em] mb-6">Similar Items</h3>
                            <div className="grid gap-5">
                                {relatedProducts.slice(0, 5).map(item => (
                                    <div key={item.id} onClick={() => navigate(`/product/${item.id}`)} className="bg-white p-5 rounded-[2rem] border border-gray-50 flex items-center gap-6 cursor-pointer hover:border-blue-200 transition-all group shadow-sm">
                                        <div className="w-24 h-24 bg-gray-50 rounded-2xl shrink-0 overflow-hidden border border-gray-100">
                                            <img src={Array.isArray(item.image) ? item.image[0] : item.image} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" alt="Related" />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{item.brand}</p>
                                            <h4 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600">{item.title}</h4>
                                            <p className="text-[11px] font-black text-gray-900 mt-3 uppercase tracking-tighter">View Details →</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </aside>
                    </div>
                </main>
            )}
            <FooterComponent />
        </div>
    );
};

export default Product;