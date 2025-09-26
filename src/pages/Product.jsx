import React from 'react';
import { useState, Fragment, useEffect } from 'react';
import { RadioGroup, Tab } from '@headlessui/react';
import { CheckIcon, ShoppingCartIcon, TrashIcon } from '@heroicons/react/20/solid'
import Navbar from '../components/Navbar';
import CategoryBanner from '../components/CategoryBanner';
import { firestore } from '../firebase/FirebaseConfig';
import { doc, getDoc, query, where, collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { cartTotalAtom } from '../store/atoms/totalCartQuantity';
import '../App.css'

const Product = (props) => {

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

  // ✅ Related products
  const [relatedProducts, setRelatedProducts] = useState([]);

  const { id } = useParams();

  useEffect(() => {
    getProductDetails();
  }, [id]);

  useEffect(() => {
    if (prices.length > 0) {
      const minQuantity = prices[0][0];
      setQuantity(minQuantity);
      setPricePerPiece(prices[0][2]);
      setTotal(minQuantity * prices[0][2]);
    }
  }, [prices]);

  const getProductDetails = async () => {
    const productRef = doc(firestore, 'products', id);
    const prod = await getDoc(productRef);
    const productData = prod.data();

    setProduct(productData);
    setDiscount1(productData.discount1);
    setDiscount2(productData.discount2);
    setActiveImage(productData.image);
    getVariationData();

    // ✅ Fetch related products (same category)
    if (productData.category) {
      getRelatedProducts(productData.category);
    }
  };

  const getRelatedProducts = async (category) => {
    try {
      const q = query(
        collection(firestore, "products"),
        where("category", "==", category)
      );
      const querySnapshot = await getDocs(q);
      let productsArray = [];
      querySnapshot.forEach((docSnap) => {
        if (docSnap.id !== id) {
          productsArray.push({ id: docSnap.id, ...docSnap.data() });
        }
      });
      setRelatedProducts(productsArray);
    } catch (err) {
      console.error("Error fetching related products:", err);
    }
  };

  const getPricesData = async (variationId) => {
    const docRef = collection(firestore, "products", id, "variations", variationId, "prices");
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
    });
    setPrices(pricesArray);
  };

  const getVariationData = async () => {
    const docRef = collection(firestore, "products", id, "variations");
    const docSnap = await getDocs(docRef);
    const newData = docSnap.docs.map(doc => ({ variationId: doc.id, ...doc.data() }));
    setVariations(newData);
    setSelectedVariant(newData[0]);
    getQuantity(newData[0].variationId);
    getPricesData(newData[0].variationId);
  };

  const getQuantity = async (variationid) => {
    const cartRef = collection(firestore, 'carts');
    const q = query(cartRef, where("userId", "==", localStorage.getItem('userId')));
    const querySnapshot = await getDocs(q);
    const currdoc = querySnapshot.docs[0];
    if (!currdoc) return;
    const itemsCollection = collection(firestore, "carts", currdoc.id, "items");
    const itemq = query(itemsCollection, where("productId", "==", id), where("variantId", "==", variationid));
    await getDocs(itemq);
  };

  const handleVariantChange = (v) => {
    let i = -1;
    for (let j = 0; j < variations.length; j++) {
      if (variations[j].name === v) {
        i = j;
        break;
      }
    }
    setSelectedVariant(variations[i]);
    getQuantity(variations[i].variationId);
    getPricesData(variations[i].variationId);
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
        });
        setCartTotal(allItems.reduce((total, currentItem) => total + parseInt(currentItem.quantity), 0));
      }
    }
  };

  const addToCart = async () => {
    try {
      const cartRef = collection(firestore, 'carts');
      if (localStorage.getItem('userId')) {
        const q = query(cartRef, where("userId", "==", localStorage.getItem('userId')));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          const docRef = await addDoc(cartRef, {
            userId: localStorage.getItem('userId')
          });
          const itemsCollection = collection(firestore, "carts", docRef.id, "items");
          await addDoc(itemsCollection, {
            productId: id,
            variantId: selectedVariant.variationId,
            quantity: quantity,
            productImage: product.image,
            productTitle: product.title,
            pricePerPiece: pricePerPiece,
            variantName: selectedVariant.name,
            productBrand: product.brand
          });
        } else {
          const currdoc = querySnapshot.docs[0];
          const existingItemsCollection = collection(firestore, 'carts', currdoc.id, "items");
          const itemQuery = query(existingItemsCollection, where("productId", "==", id), where("variantId", "==", selectedVariant.variationId));
          const itemDoc = await getDocs(itemQuery);
          if (!itemDoc.empty) {
            itemDoc.forEach(async (idoc) => {
              const itemRef = doc(firestore, "carts", currdoc.id, "items", idoc.id);
              await updateDoc(itemRef, {
                pricePerPiece: pricePerPiece,
                quantity: quantity
              });
            });
          } else {
            await addDoc(existingItemsCollection, {
              productId: id,
              variantId: selectedVariant.variationId,
              quantity: quantity,
              productImage: product.image,
              productTitle: product.title,
              pricePerPiece: pricePerPiece,
              variantName: selectedVariant.name,
              productBrand: product.brand
            });
          }
        }
        getCartTotal();
      } else {
        alert("Sign in first");
        return;
      }
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
      const itemq = query(itemsCollection, where("productId", "==", id), where("variantId", "==", selectedVariant.variationId));
      const itemDoc = await getDocs(itemq);
      const docDel = doc(firestore, "carts", currdoc.id, "items", itemDoc.docs[0].id);
      await deleteDoc(docDel);
      setCartTotal(cartTotal - quantity);
      setQuantity(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFocus = (event) => {
    if (quantity === 0) {
      event.target.value = '';
    }
  };

  const handleBlur = (event) => {
    if (event.target.value === '') {
      setQuantity(0);
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

  const [zoomedImageStyle, setZoomedImageStyle] = useState({
    display: 'none',
    left: '0px',
    top: '0px',
  });

  const handleMouseOver = () => {
    setZoomedImageStyle((prevState) => ({ ...prevState, display: 'block' }));
  };

  const handleMouseOut = () => {
    setZoomedImageStyle((prevState) => ({ ...prevState, display: 'none' }));
  };

  const handleMouseMove = (e) => {
    const originalImage = e.target;
    const rect = originalImage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const zoomFactor = 2;
    const zoomedWidth = rect.width * zoomFactor;
    const zoomedHeight = rect.height * zoomFactor;
    const newLeft = -x * zoomFactor + rect.width / 2;
    const newTop = -y * zoomFactor + rect.height / 2;
    setZoomedImageStyle({
      display: 'block',
      left: `${newLeft}px`,
      top: `${newTop}px`,
      width: `${zoomedWidth}px`,
      height: `${zoomedHeight}px`,
    });
  };

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className='pt-20'>
      <Navbar />
      {product && <>
        <div className="mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row -mx-4">
              {/* Product Images */}
              <div className="md:flex-1 px-4">
                <div className="h-64 md:h-80 rounded-lg bg-gray-100 mb-4 flex items-center justify-center">
                  <div className="image-container">
                    <div className="image-wrapper">
                      <img
                        src={activeImage}
                        alt="Zoomable"
                        className="original-image"
                        onMouseOver={handleMouseOver}
                        onMouseOut={handleMouseOut}
                        onMouseMove={handleMouseMove}
                      />
                      <div
                        className="zoomed-image-container"
                        style={{ display: zoomedImageStyle.display }}
                      >
                        <img
                          src={activeImage}
                          alt="Zoomed"
                          className="zoomed-image"
                          style={{
                            left: zoomedImageStyle.left,
                            top: zoomedImageStyle.top,
                            width: zoomedImageStyle.width,
                            height: zoomedImageStyle.height,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex -mx-2 mb-4 gap-2">
                  {product.image.map((img, idx) => (
                    <div key={idx} className="flex-1 px-2">
                      <button
                        onClick={() => setActiveImage(img)}
                        className={`focus:outline-none rounded-lg h-24 md:h-32 bg-gray-100 flex items-center justify-center ${activeImage === img ? 'ring-2 ring-indigo-300 ring-inset' : ''}`}
                      >
                        <img className="border border-gray-400 object-cover w-full h-full" src={img} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Details */}
              {selectedVariant &&
                <div className="md:flex-1 px-4">
                  <h2 className="mb-2 leading-tight tracking-tight font-bold text-gray-800 text-2xl md:text-3xl">
                    {product.title}: <span className='text-md font-normal'>{selectedVariant.name}</span>
                  </h2>
                  <p className="text-gray-500 text-sm">By <span className="text-indigo-600">{product.brand}</span></p>

                  <RadioGroup value={selectedVariant} onChange={handleVariantChange} className="py-8 border-b">
                    <RadioGroup.Label>Variant</RadioGroup.Label>
                    <div className='flex gap-2'>
                      {variations.map((variation) => (
                        <RadioGroup.Option
                          key={variation.name}
                          value={variation.name}
                          data-headlessui-state={selectedVariant.name === variation.name ? 'active checked' : ""}
                          className="mt-4 border rounded-md border-gray-400 w-28 p-4 text-center ui-active:border-blue-400 ui-active:bg-white ui-not-active:bg-gray-200"
                        >
                          {variation.name}
                        </RadioGroup.Option>
                      ))}
                    </div>
                  </RadioGroup>

                  {/* Discounts */}
                  {discount1 && discount2 && (
                    <>
                      <div><label>Discount One</label><input disabled value={discount1 + "%"} style={{ border: 'none' }} /></div>
                      <div><label>Discount Second</label><input disabled value={discount2 + "%"} style={{ border: 'none' }} /></div>
                    </>
                  )}

                  <div className="flex flex-col pt-4 pb-8 space-y-12 border-b">
                    <div className='hidden sm:flex mt-2 w-full flex justify-between items-center'>
                      <div className="flex items-center border-gray-100">
                        <button className={`${quantity > 0 ? "bg-blue-500 hover:bg-blue-300" : "bg-gray-200"} text-white cursor-pointer rounded-l py-1 px-3.5 duration-100`} disabled={quantity < 1} onClick={decreaseQuantity}> - </button>
                        <input className="h-8 w-14 border bg-white text-center text-black text-xs outline-none py-2" type='number' value={quantity} onChange={handleQuantityChange} onFocus={handleFocus} onBlur={handleBlur} />
                        <button className="bg-blue-500 hover:bg-blue-300 h-8 text-white text-xl rounded-r px-3 duration-100" onClick={increaseQuantity}> + </button>
                      </div>
                      <h2 className=' text-xs flex flex-col gap-1'><span className='text-gray-500 font-bold'>Rs/pc</span><span className='text-black'>{pricePerPiece}</span></h2>
                      <h2 className=' text-xs flex flex-col gap-1'><span className='text-gray-500 font-bold'>Total</span><span className='text-black'>{total}</span></h2>
                    </div>
                    <button className='hidden sm:flex mt-2 w-full rounded-md flex gap-2 py-2 justify-center items-center bg-blue-500 hover:bg-blue-400' onClick={addToCart}>
                      <ShoppingCartIcon className='w-auto h-5 text-white' />
                      <span className='text-white font-medium text-sm'>Add To Cart </span>
                    </button>
                  </div>
                </div>
              }
            </div>

            {/* Product Description */}
            <div className="w-full px-2 py-16 sm:px-0">
              <h1 className='text-2xl underline mb-4'>Description</h1>
              <p className='text-lg font-normal'>{product.description}</p>
            </div>

            {/* ✅ Related Products */}
            {relatedProducts.length > 0 && (
              <div className="w-full px-2 py-16 sm:px-0">
                <h1 className='text-2xl underline mb-4'>Related Products</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {relatedProducts.map((item) => (
                    <div className="h-40 w-full flex items-center justify-center bg-white rounded-md mb-2">
                        <img
                          src={Array.isArray(item.image) ? item.image[0] : item.image}
                          alt={item.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <h2 className="text-md font-semibold">{item.title}</h2>
                      <p className="text-sm text-gray-500">{item.brand}</p>
                      <button
                        onClick={() => window.location.href = `/product/${item.id}`}
                        className="mt-2 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-400"
                      >
                        View Product
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </>}
    </div>
  )
}

export default Product;
