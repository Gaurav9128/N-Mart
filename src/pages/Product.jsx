import React, { useState, useEffect } from 'react';
import { RadioGroup } from '@headlessui/react';
import Navbar from '../components/Navbar';
import { ShoppingCartIcon } from '@heroicons/react/20/solid';
import { firestore } from '../firebase/FirebaseConfig';
import {
  doc,
  getDoc,
  query,
  where,
  collection,
  getDocs,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { cartTotalAtom } from '../store/atoms/totalCartQuantity';
import '../App.css';

const Product = () => {
  const [product, setProduct] = useState();
  const [prices, setPrices] = useState([[]]);
  const [activeImage, setActiveImage] = useState();
  const [variations, setVariations] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState();
  const [quantity, setQuantity] = useState(0);
  const [total, setTotal] = useState(0);
  const [pricePerPiece, setPricePerPiece] = useState(0);
  const [cartTotal, setCartTotal] = useRecoilState(cartTotalAtom);
  const [discount1, setDiscount1] = useState(0);
  const [discount2, setDiscount2] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const { id } = useParams();

  useEffect(() => {
    getProductDetails();
  }, []);

  useEffect(() => {
    if (prices.length > 0 && prices[0][0] !== undefined) {
      const minQuantity = prices[0][0];
      setQuantity(minQuantity);
      setPricePerPiece(prices[0][2]);
      setTotal(minQuantity * prices[0][2]);
    }
  }, [prices]);

  const getProductDetails = async () => {
    const productRef = doc(firestore, 'products', id);
    const prod = await getDoc(productRef);
    const data = prod.data();

    if (data) {
      setDiscount1(data.discount1);
      setDiscount2(data.discount2);
      setProduct(data);
      setActiveImage(data.image);
      getVariationData();
      getRelatedProducts(data.category, data.brand);
    }
  };

  const getRelatedProducts = async (category, brand) => {
    try {
      const q = query(
        collection(firestore, 'products'),
        where('category', '==', category),
        where('brand', '==', brand)
      );
      const querySnapshot = await getDocs(q);
      let related = [];
      querySnapshot.forEach((docSnap) => {
        if (docSnap.id !== id) {
          related.push({ id: docSnap.id, ...docSnap.data() });
        }
      });
      setRelatedProducts(related);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const getPricesData = async (variationId) => {
    const docRef = collection(firestore, 'products', id, 'variations', variationId, 'prices');
    const docSnap = await getDocs(docRef);
    let pricesArray = [];
    let i = 0;
    docSnap.forEach((doc) => {
      if (!pricesArray[i]) pricesArray[i] = [];
      pricesArray[i][0] = doc.data().minQuantity;
      pricesArray[i][1] = doc.data().maxQuantity;
      pricesArray[i][2] = doc.data().price;
      i++;
    });
    setPrices(pricesArray);
  };

  const getVariationData = async () => {
    const docRef = collection(firestore, 'products', id, 'variations');
    const docSnap = await getDocs(docRef);
    const newData = docSnap.docs.map((doc) => ({
      variationId: doc.id,
      ...doc.data(),
    }));
    setVariations(newData);
    if (newData.length > 0) {
      setSelectedVariant(newData[0]);
      getPricesData(newData[0].variationId);
    }
  };

  const handleVariantChange = (v) => {
    const variant = variations.find((variation) => variation.name === v);
    setSelectedVariant(variant);
    getPricesData(variant.variationId);
  };

  const addToCart = async () => {
    try {
      const cartRef = collection(firestore, 'carts');
      if (localStorage.getItem('userId')) {
        const q = query(cartRef, where('userId', '==', localStorage.getItem('userId')));
        const querySnapshot = await getDocs(q);
        let cartId;

        if (querySnapshot.empty) {
          const docRef = await addDoc(cartRef, { userId: localStorage.getItem('userId') });
          cartId = docRef.id;
        } else {
          cartId = querySnapshot.docs[0].id;
        }

        const itemsCollection = collection(firestore, 'carts', cartId, 'items');
        const itemQuery = query(
          itemsCollection,
          where('productId', '==', id),
          where('variantId', '==', selectedVariant.variationId)
        );
        const itemDoc = await getDocs(itemQuery);

        if (!itemDoc.empty) {
          itemDoc.forEach(async (idoc) => {
            const itemRef = doc(firestore, 'carts', cartId, 'items', idoc.id);
            await updateDoc(itemRef, { pricePerPiece, quantity });
          });
        } else {
          await addDoc(itemsCollection, {
            productId: id,
            variantId: selectedVariant.variationId,
            quantity,
            productImage: product.image,
            productTitle: product.title,
            pricePerPiece,
            variantName: selectedVariant.name,
            productBrand: product.brand,
          });
        }
      } else {
        alert('Sign in first');
        return;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuantityChange = (e) => {
    const inputValue = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
    setQuantity(inputValue);
    let newPricePerPiece = 0;
    let newTotal = 0;
    for (let i = 0; i < prices.length; i++) {
      if (inputValue >= prices[i][0] && inputValue <= prices[i][1]) {
        newPricePerPiece = prices[i][2];
        newTotal = inputValue * prices[i][2];
        break;
      }
    }
    setPricePerPiece(newPricePerPiece);
    setTotal(newTotal);
  };

  const increaseQuantity = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    handleQuantityChange({ target: { value: newQuantity } });
  };

  const decreaseQuantity = () => {
    const newQuantity = quantity - 1;
    setQuantity(newQuantity);
    handleQuantityChange({ target: { value: newQuantity } });
  };

  return (
    <div className="pt-20">
      <Navbar />
      {product && (
        <>
          <div className="mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row -mx-4">
              {/* Product Image Section */}
              <div className="md:flex-1 px-4">
                <div className="h-64 md:h-80 rounded-lg bg-gray-100 mb-4 flex items-center justify-center">
                  <img src={activeImage} alt="Zoomable" className="h-full object-contain" />
                </div>
                <div className="flex gap-2 mb-4">
                  {product.image.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`rounded-lg h-24 md:h-32 bg-gray-100 flex items-center justify-center ${
                        activeImage === img ? 'ring-2 ring-indigo-300 ring-inset' : ''
                      }`}
                    >
                      <img className="object-cover w-full h-full" src={img} alt="" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info Section */}
              {selectedVariant && (
                <div className="md:flex-1 px-4">
                  <h2 className="mb-2 text-2xl md:text-3xl font-bold text-gray-800">
                    {product.title}:{' '}
                    <span className="text-md font-normal">{selectedVariant.name}</span>
                  </h2>
                  <p className="text-gray-500 text-sm">
                    By <span className="text-indigo-600">{product.brand}</span>
                  </p>

                  <RadioGroup
                    value={selectedVariant}
                    onChange={handleVariantChange}
                    className="py-8 border-b"
                  >
                    <RadioGroup.Label>Variant</RadioGroup.Label>
                    <div className="flex gap-2">
                      {variations.map((variation) => (
                        <RadioGroup.Option
                          key={variation.name}
                          value={variation.name}
                          className="mt-4 border rounded-md border-gray-400 w-28 p-4 text-center"
                        >
                          {variation.name}
                        </RadioGroup.Option>
                      ))}
                    </div>
                  </RadioGroup>

                  <div className="flex flex-col pt-4 pb-8 space-y-12 border-b">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center border-gray-100">
                        <button
                          className={`${
                            quantity > 0 ? 'bg-blue-500 hover:bg-blue-300' : 'bg-gray-200'
                          } text-white cursor-pointer rounded-l py-1 px-3.5`}
                          disabled={quantity < 1}
                          onClick={decreaseQuantity}
                        >
                          -
                        </button>
                        <input
                          className="h-8 w-14 border bg-white text-center text-black text-xs outline-none py-2"
                          type="number"
                          value={quantity}
                          onChange={handleQuantityChange}
                        />
                        <button
                          className="bg-blue-500 hover:bg-blue-300 h-8 text-white text-xl rounded-r px-3"
                          onClick={increaseQuantity}
                        >
                          +
                        </button>
                      </div>
                      <h2 className="text-xs flex flex-col gap-1">
                        <span className="text-gray-500 font-bold">Rs/pc</span>
                        <span className="text-black">{pricePerPiece}</span>
                      </h2>
                      <h2 className="text-xs flex flex-col gap-1">
                        <span className="text-gray-500 font-bold">Total</span>
                        <span className="text-black">{total}</span>
                      </h2>
                    </div>
                    <button
                      className="mt-2 w-full rounded-md flex gap-2 py-2 justify-center items-center bg-blue-500 hover:bg-blue-400"
                      onClick={addToCart}
                    >
                      <ShoppingCartIcon className="w-auto h-5 text-white" />
                      <span className="text-white font-medium text-sm">Add To Cart</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="w-full px-2 py-16 sm:px-0">
              <h1 className="text-2xl underline mb-4">Description</h1>
              <p className="text-lg font-normal">{product.description}</p>
            </div>

            {/* ✅ Related Products Section (no price, no Add to Cart) */}
            {relatedProducts.length > 0 && (
              <div className="w-full px-2 py-16 sm:px-0">
                <h1 className="text-2xl underline mb-6">Related Products</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col"
                    >
                      <div
                        className="w-full h-48 flex items-center justify-center bg-white rounded-md mb-3 overflow-hidden cursor-pointer"
                        onClick={() => (window.location.href = `/product/${item.id}`)}
                      >
                        <img
                          src={Array.isArray(item.image) ? item.image[0] : item.image}
                          alt={item.title}
                          className="max-h-48 w-auto object-contain"
                        />
                      </div>

                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                        {item.brand}
                      </p>

                      <h2
                        className="font-semibold text-gray-800 truncate mb-2 cursor-pointer hover:text-blue-500"
                        onClick={() => (window.location.href = `/product/${item.id}`)}
                      >
                        {item.title}
                      </h2>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Product;
