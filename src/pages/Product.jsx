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
  const [relatedProducts, setRelatedProducts] = useState([]);

  const { id } = useParams();

  useEffect(() => {
    getProductDetails();
  }, []);

  const getProductDetails = async () => {
    const productRef = doc(firestore, 'products', id);
    const prod = await getDoc(productRef);
    const data = prod.data();

    if (data) {
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

    docSnap.forEach((doc, i) => {
      pricesArray[i] = [
        doc.data().minQuantity,
        doc.data().maxQuantity,
        doc.data().price,
      ];
    });

    setPrices(pricesArray);
    if (pricesArray[0]) {
      setQuantity(pricesArray[0][0]);
      setPricePerPiece(pricesArray[0][2]);
      setTotal(pricesArray[0][0] * pricesArray[0][2]);
    }
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
    const variant = variations.find((x) => x.name === v);
    setSelectedVariant(variant);
    getPricesData(variant.variationId);
  };

  const addToCart = async () => {
    if (!localStorage.getItem('userId')) {
      alert('Sign in first');
      return;
    }

    const cartRef = collection(firestore, 'carts');
    const q = query(cartRef, where('userId', '==', localStorage.getItem('userId')));
    const qs = await getDocs(q);

    let cartId;
    if (qs.empty) {
      const docRef = await addDoc(cartRef, { userId: localStorage.getItem('userId') });
      cartId = docRef.id;
    } else {
      cartId = qs.docs[0].id;
    }

    const itemsCollection = collection(firestore, 'carts', cartId, 'items');
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
  };

  return (
    <div className="pt-20">
      <Navbar />

      {product && (
        <>
          <div className="mt-24 max-w-7xl mx-auto px-0 sm:px-4 lg:px-8">
            <div className="flex flex-col md:flex-row gap-6">

              {/* ✅ IMAGE SECTION (FIXED) */}
              <div className="md:flex-1">
                <div className="h-72 md:h-96 bg-white mb-4 flex items-center justify-center border rounded-lg">
                  <img
                    src={activeImage}
                    alt="Product"
                    className="max-h-full max-w-full object-contain"
                    loading="eager"
                  />
                </div>

                {/* THUMBNAILS */}
                <div className="flex gap-3 px-2">
                  {product.image.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`h-20 w-20 bg-white border rounded flex items-center justify-center ${
                        activeImage === img ? 'ring-2 ring-blue-400' : ''
                      }`}
                    >
                      <img
                        src={img}
                        className="max-h-full max-w-full object-contain"
                        alt=""
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* INFO SECTION */}
              {selectedVariant && (
                <div className="md:flex-1 px-4">
                  <h2 className="text-2xl font-bold mb-1">{product.title}</h2>
                  <p className="text-sm text-gray-500 mb-4">By {product.brand}</p>

                  <RadioGroup
                    value={selectedVariant.name}
                    onChange={handleVariantChange}
                    className="py-4"
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
                    className="mt-6 w-full bg-blue-500 hover:bg-blue-400 text-white py-2 rounded flex justify-center gap-2"
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
