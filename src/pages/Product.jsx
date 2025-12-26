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
import FooterComponent from '../components/FooterComponent';

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
      setActiveImage(Array.isArray(data.image) ? data.image[0] : data.image);
      getVariationData();
      getRelatedProducts(data.category, data.brand);
    }
  };

  const getRelatedProducts = async (category, brand) => {
    const q = query(
      collection(firestore, 'products'),
      where('category', '==', category),
      where('brand', '==', brand)
    );
    const querySnapshot = await getDocs(q);
    const related = [];
    querySnapshot.forEach((docSnap) => {
      if (docSnap.id !== id) {
        related.push({ id: docSnap.id, ...docSnap.data() });
      }
    });
    setRelatedProducts(related);
  };

  const getPricesData = async (variationId) => {
    const docRef = collection(
      firestore,
      'products',
      id,
      'variations',
      variationId,
      'prices'
    );
    const docSnap = await getDocs(docRef);
    const pricesArray = [];
    let i = 0;

    docSnap.forEach((doc) => {
      pricesArray[i] = [
        doc.data().minQuantity,
        doc.data().maxQuantity,
        doc.data().price,
      ];
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
    const cartRef = collection(firestore, 'carts');
    if (!localStorage.getItem('userId')) {
      alert('Sign in first');
      return;
    }

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
        productImage: activeImage,
        productTitle: product.title,
        pricePerPiece,
        variantName: selectedVariant.name,
        productBrand: product.brand,
      });
    }
  };

  const handleQuantityChange = (e) => {
    const val = Number(e.target.value || 0);
    setQuantity(val);

    for (let i = 0; i < prices.length; i++) {
      if (val >= prices[i][0] && val <= prices[i][1]) {
        setPricePerPiece(prices[i][2]);
        setTotal(val * prices[i][2]);
        break;
      }
    }
  };

  return (
    <div className="pt-20">
      <Navbar />

      {product && (
        <>
          {/* 🔥 padding FIXED HERE */}
          <div className="mt-24 max-w-7xl mx-auto px-0 sm:px-4 lg:px-8">
            <div className="flex flex-col md:flex-row">

              {/* ✅ IMAGE SECTION */}
              <div className="md:flex-1">
                <div className="h-64 md:h-80 bg-gray-100 mb-4 overflow-hidden">
                  <img
                    src={activeImage}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex gap-2 px-2">
                  {product.image.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`h-20 w-20 bg-gray-100 overflow-hidden rounded ${
                        activeImage === img ? 'ring-2 ring-blue-400' : ''
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* INFO SECTION */}
              {selectedVariant && (
                <div className="md:flex-1 px-4">
                  <h2 className="text-2xl font-bold">{product.title}</h2>
                  <p className="text-sm text-gray-500">By {product.brand}</p>

                  <RadioGroup
                    value={selectedVariant.name}
                    onChange={handleVariantChange}
                    className="py-6"
                  >
                    <div className="flex gap-2">
                      {variations.map((v) => (
                        <RadioGroup.Option
                          key={v.name}
                          value={v.name}
                          className="border px-4 py-2 rounded cursor-pointer"
                        >
                          {v.name}
                        </RadioGroup.Option>
                      ))}
                    </div>
                  </RadioGroup>

                  <button
                    onClick={addToCart}
                    className="mt-4 w-full bg-blue-500 text-white py-2 rounded flex justify-center gap-2"
                  >
                    <ShoppingCartIcon className="h-5" />
                    Add To Cart
                  </button>
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="px-4 py-16">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <p>{product.description}</p>
            </div>
          </div>

          <FooterComponent />
        </>
      )}
    </div>
  );
};

export default Product;
