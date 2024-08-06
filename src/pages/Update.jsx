import React, { useState, useEffect, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { firestore, storage } from "../firebase/FirebaseConfig";
import { doc, collection, getDocs, updateDoc, addDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Loader from '../components/Loader';
import { deleteDoc } from "firebase/firestore";

const UpdateProduct = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [brand, setBrand] = useState('');
  const [voucher, setVoucher] = useState('');
  const [visible, setVisible] = useState(true);
  const [image, setImage] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState([]);

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      getProducts(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedProduct) {
      populateProductDetails();
    }
  }, [selectedProduct]);

  const getCategories = async () => {
    const querySnapshot = await getDocs(collection(firestore, "categories"));
    const extractedNames = querySnapshot.docs.map(doc => doc.id);
    setCategories(extractedNames);
  };

  const getProducts = async (category) => {
    const querySnapshot = await getDocs(collection(firestore, "products"));
    const extractedProducts = [];

    for (const doc of querySnapshot.docs) {
      const productData = doc.data();
      if (productData.category === category) {
        const product = { id: doc.id, ...productData };

        // Retrieve variations
        const variationsCollection = collection(firestore, "products", doc.id, "variations");
        const variationsSnapshot = await getDocs(variationsCollection);
        const variations = variationsSnapshot.docs.map(variationDoc => ({
          id: variationDoc.id,
          ...variationDoc.data()
        }));
        product.variations = variations;

        // Retrieve prices
        for (const variation of variations) {
          const pricesCollection = collection(firestore, "products", doc.id, "variations", variation.id, "prices");
          const pricesSnapshot = await getDocs(pricesCollection);
          const variationPrices = pricesSnapshot.docs.map(priceDoc => ({
            id: priceDoc.id,
            ...priceDoc.data()
          }));
          variation.prices = variationPrices; // Store prices in the variation object
        }

        extractedProducts.push(product);
      }
    }

    setProducts(extractedProducts);
  };

  const populateProductDetails = () => {
    setTitle(selectedProduct.title);
    setDescription(selectedProduct.description);
    setTags(selectedProduct.tags || []);
    setBrand(selectedProduct.brand);
    setVoucher(selectedProduct.voucher);
    setVisible(selectedProduct.visible);
    setImagePreview(selectedProduct.image || []);
    setVariations(selectedProduct.variations || []);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      let imgUrls = [...imagePreview];
      for (let i = 0; i < image.length; i++) {
        const imgRef = ref(storage, `product-images/${selectedCategory}/${image[i].name}`);
        await uploadBytes(imgRef, image[i]);
        const url = await getDownloadURL(imgRef);
        imgUrls.push(url);
      }
  
      const updatedProduct = {
        title,
        description,
        category: selectedCategory,
        tags,
        image: imgUrls,
        voucher,
        brand,
        visible,
      };
  
      await updateDoc(doc(firestore, "products", selectedProduct.id), updatedProduct);
  
      // Fetch existing variations and prices
      const existingVariationsSnapshot = await getDocs(collection(firestore, "products", selectedProduct.id, "variations"));
      const existingVariations = existingVariationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      // Handle variations
      for (const variation of variations) {
        const existingVariation = existingVariations.find(v => v.name === variation.name);
        if (existingVariation) {
          // Update existing variation
          await updateDoc(doc(firestore, "products", selectedProduct.id, "variations", existingVariation.id), {
            name: variation.name,
            quantity: variation.quantity,
          });
  
          // Fetch existing prices
          const existingPricesSnapshot = await getDocs(collection(firestore, "products", selectedProduct.id, "variations", existingVariation.id, "prices"));
          const existingPrices = existingPricesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
          // Update prices
          for (const price of variation.prices) {
            const existingPrice = existingPrices.find(p => p.id === price.id);
            if (existingPrice) {
              await updateDoc(doc(firestore, "products", selectedProduct.id, "variations", existingVariation.id, "prices", existingPrice.id), {
                price: price.price,
                minQuantity: price.minQuantity,
                maxQuantity: price.maxQuantity,
              });
            } else {
              await addDoc(collection(firestore, "products", selectedProduct.id, "variations", existingVariation.id, "prices"), {
                price: price.price,
                minQuantity: price.minQuantity,
                maxQuantity: price.maxQuantity,
              });
            }
          }
  
          // Handle deleted prices
          const pricesToDelete = existingPrices.filter(existingPrice => !variation.prices.some(price => price.id === existingPrice.id));
          for (const price of pricesToDelete) {
            await deleteDoc(doc(firestore, "products", selectedProduct.id, "variations", existingVariation.id, "prices", price.id));
          }
        } else {
          // Add new variation
          const newVariationRef = await addDoc(collection(firestore, "products", selectedProduct.id, "variations"), {
            name: variation.name,
            quantity: variation.quantity,
          });
          for (const price of variation.prices) {
            await addDoc(collection(firestore, "products", selectedProduct.id, "variations", newVariationRef.id, "prices"), {
              price: price.price,
              minQuantity: price.minQuantity,
              maxQuantity: price.maxQuantity,
            });
          }
        }
      }
  
      // Handle deleted variations
      const variationsToDelete = existingVariations.filter(existingVariation => !variations.some(variation => variation.name === existingVariation.name));
      for (const variation of variationsToDelete) {
        await deleteDoc(doc(firestore, "products", selectedProduct.id, "variations", variation.id));
      }
  
      setLoading(false);
      alert("Product updated successfully");
    } catch (error) {
      console.error("Error updating product:", error);
      setLoading(false);
      alert("Error updating product");
    }
  };
  const handleVariationChange = (index, field, value) => {
    const updatedVariations = [...variations];
    updatedVariations[index][field] = value;
    setVariations(updatedVariations);
  };

  const handlePriceChange = (variationIndex, priceIndex, field, value) => {
    const updatedVariations = [...variations];
    updatedVariations[variationIndex].prices[priceIndex][field] = value;
    setVariations(updatedVariations);
  };

  const handleAddVariation = () => {
    const newVariation = { name: '', quantity: 0, prices: [{ price: 0, minQuantity: 0, maxQuantity: 0 }] };
    setVariations([...variations, newVariation]);
  };

  const handleDeleteVariation = (index) => {
    const updatedVariations = [...variations];
    updatedVariations.splice(index, 1);
    setVariations(updatedVariations);
  };

  const handleDeleteImage = (url) => {
    const updatedImages = imagePreview.filter((img) => img !== url);
    setImagePreview(updatedImages);
  };

  const handleDeleteProduct = async () => {
    if (selectedProduct) {
      setLoading(true);
      try {
        await deleteDoc(doc(firestore, "products", selectedProduct.id));
        setLoading(false);
        alert("Product deleted successfully");

        // Remove the deleted product from the state
        setProducts(products.filter(product => product.id !== selectedProduct.id));
        setSelectedProduct(null);
      } catch (error) {
        console.error(error);
        setLoading(false);
        alert("Error deleting product");
      }
    }
  };

  return (
    <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
      {loading && <Loader />}
      <div className="md:col-span-5">
        <label htmlFor="category">Category</label>
        {categories.length > 0 &&
          <Listbox value={selectedCategory} onChange={setSelectedCategory}>
            <div className="relative mt-1">
              <Listbox.Button className="cursor-pointer relative w-full cursor-default rounded-lg bg-white py-4 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                <span className="block truncate">{selectedCategory || 'Select a category'}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {categories.map((category, index) => (
                    <Listbox.Option key={index} className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'}`} value={category}>
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{category}</span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        }
      </div>

      {selectedCategory && (
        <div className="md:col-span-5">
          <label htmlFor="product">Product</label>
          {products.length > 0 && (
            <Listbox value={selectedProduct} onChange={setSelectedProduct}>
              <div className="relative mt-1">
                <Listbox.Button className="cursor-pointer relative w-full cursor-default rounded-lg bg-white py-4 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <span className="block truncate">{selectedProduct?.title || 'Select a product'}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </Listbox.Button>
                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {products.map((product, index) => (
                      <Listbox.Option key={index} className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'}`} value={product}>
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{product.title}</span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          )}
        </div>
      )}

      {selectedProduct && (
        <>
          <div className="md:col-span-5">
            <label htmlFor="title">Title</label>
            <input type="text" name="title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
          </div>
          <div className="md:col-span-5">
            <label htmlFor="description">Description</label>
            <textarea name="description" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="h-20 border mt-1 rounded px-4 w-full bg-gray-50"></textarea>
          </div>
          <div className="md:col-span-5">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input type="text" name="tags" id="tags" value={tags.join(', ')} onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()))} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
          </div>
          <div className="md:col-span-5">
            <label htmlFor="brand">Brand</label>
            <input type="text" name="brand" id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
          </div>
          <div className="md:col-span-5">
            <label htmlFor="voucher">Voucher</label>
            <input type="text" name="voucher" id="voucher" value={voucher} onChange={(e) => setVoucher(e.target.value)} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
          </div>
          <div className="md:col-span-5">
            <label htmlFor="visible">Visible</label>
            <input type="checkbox" name="visible" id="visible" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="h-10 border mt-1 rounded px-4 bg-gray-50" />
          </div>
          <div className="md:col-span-5">
            <label htmlFor="image">Image</label>
            <input type="file" name="image" id="image" multiple onChange={(e) => setImage(Array.from(e.target.files))} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
          </div>
          <div className="md:col-span-5">
            <label>Image Preview</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {imagePreview.map((url, index) => (
                <div key={index} className="relative">
                  <img src={url} alt="Product" className="h-20 w-20 object-cover" />
                  <button type="button" onClick={() => handleDeleteImage(url)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {variations.map((variation, variationIndex) => (
            <div key={variationIndex} className="md:col-span-5 border-t pt-4 mt-4">
              <div className="md:col-span-5 flex justify-between items-center">
                <h3 className="text-lg font-medium">Variation {variationIndex + 1}</h3>
                <button type="button" onClick={() => handleDeleteVariation(variationIndex)} className="bg-red-500 text-white rounded-full p-1">
                  &times;
                </button>
              </div>
              <div className="md:col-span-5 mt-2">
                <label htmlFor={`variation-name-${variationIndex}`}>Variation Name</label>
                <input type="text" name={`variation-name-${variationIndex}`} id={`variation-name-${variationIndex}`} value={variation.name} onChange={(e) => handleVariationChange(variationIndex, 'name', e.target.value)} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
              </div>
              <div className="md:col-span-5 mt-2">
                <label htmlFor={`variation-quantity-${variationIndex}`}>Quantity</label>
                <input type="number" name={`variation-quantity-${variationIndex}`} id={`variation-quantity-${variationIndex}`} value={variation.quantity} onChange={(e) => handleVariationChange(variationIndex, 'quantity', e.target.value)} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
              </div>
              {variation.prices.map((price, priceIndex) => (
                <div key={priceIndex} className="md:col-span-5 mt-2">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <label htmlFor={`price-${variationIndex}-${priceIndex}`}>Price</label>
                      <input type="number" name={`price-${variationIndex}-${priceIndex}`} id={`price-${variationIndex}-${priceIndex}`} value={price.price} onChange={(e) => handlePriceChange(variationIndex, priceIndex, 'price', e.target.value)} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
                    </div>
                    <div className="flex-1">
                      <label htmlFor={`minQuantity-${variationIndex}-${priceIndex}`}>Min Quantity</label>
                      <input type="number" name={`minQuantity-${variationIndex}-${priceIndex}`} id={`minQuantity-${variationIndex}-${priceIndex}`} value={price.minQuantity} onChange={(e) => handlePriceChange(variationIndex, priceIndex, 'minQuantity', e.target.value)} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
                    </div>
                    <div className="flex-1">
                      <label htmlFor={`maxQuantity-${variationIndex}-${priceIndex}`}>Max Quantity</label>
                      <input type="number" name={`maxQuantity-${variationIndex}-${priceIndex}`} id={`maxQuantity-${variationIndex}-${priceIndex}`} value={price.maxQuantity} onChange={(e) => handlePriceChange(variationIndex, priceIndex, 'maxQuantity', e.target.value)} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="md:col-span-5 mt-4">
            <button type="button" onClick={handleAddVariation} className="bg-green-500 text-white py-2 px-4 rounded">Add Variation</button>
          </div>
          <div className="md:col-span-5 mt-4">
            <button type="submit" onClick={handleUpdateProduct} className="bg-blue-500 text-white py-2 px-4 rounded">Update Product</button>
          </div>
          <div className="md:col-span-5 mt-4">
            <button type="button" onClick={handleDeleteProduct} className="bg-red-500 text-white py-2 px-4 rounded">Delete Product</button>
          </div>
        </>
      )}
    </div>
  );
};

export default UpdateProduct;