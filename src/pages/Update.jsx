import React, { useState, useEffect, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { firestore, storage } from "../firebase/FirebaseConfig";
import { doc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Loader from '../components/Loader';

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

      // Update variations and prices
      for (const variation of variations) {
        const variationRef = doc(firestore, "products", selectedProduct.id, "variations", variation.id);
        await updateDoc(variationRef, {
          name: variation.name,
          quantity: variation.quantity,
        });

        for (const price of variation.prices) {
          const priceRef = doc(firestore, "products", selectedProduct.id, "variations", variation.id, "prices", price.id);
          await updateDoc(priceRef, {
            price: price.price,
            minQuantity: price.minQuantity,
            maxQuantity: price.maxQuantity,
          });
        }
      }

      setLoading(false);
      alert("Product updated successfully");
    } catch (error) {
      console.error(error);
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
                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                  {categories.map((category, index) => (
                    <Listbox.Option key={index} className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-amber-100 text-black' : 'text-gray-900'}`
                    } value={category}>
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{category}</span>
                          {selected ? (
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
        }
      </div>

      <div className="md:col-span-5">
        <label htmlFor="product">Product</label>
        {products.length > 0 &&
          <Listbox value={selectedProduct} onChange={setSelectedProduct}>
            <div className="relative mt-1">
              <Listbox.Button className="cursor-pointer relative w-full cursor-default rounded-lg bg-white py-4 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                <span className="block truncate">{selectedProduct ? selectedProduct.title : 'Select a product'}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                  {products.map((product, index) => (
                    <Listbox.Option key={index} className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-amber-100 text-black' : 'text-gray-900'}`
                    } value={product}>
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{product.title}</span>
                          {selected ? (
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
        }
      </div>

      {selectedProduct &&
        <form onSubmit={handleUpdateProduct} className="md:col-span-5">
          <div className="md:col-span-5">
            <label htmlFor="title">Title</label>
            <input type="text" name="title" id="title" value={title} onChange={(e) => setTitle(e.target.value)}
              className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" required />
          </div>

          <div className="md:col-span-5">
            <label htmlFor="description">Description</label>
            <textarea name="description" id="description" value={description} onChange={(e) => setDescription(e.target.value)}
              className="h-20 border mt-1 rounded px-4 w-full bg-gray-50" required />
          </div>

          <div className="md:col-span-5">
            <label htmlFor="brand">Brand</label>
            <input type="text" name="brand" id="brand" value={brand} onChange={(e) => setBrand(e.target.value)}
              className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
          </div>

          <div className="md:col-span-5">
            <label htmlFor="voucher">Voucher</label>
            <input type="text" name="voucher" id="voucher" value={voucher} onChange={(e) => setVoucher(e.target.value)}
              className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
          </div>

          <div className="md:col-span-5">
            <label htmlFor="visible">Visible</label>
            <select name="visible" id="visible" value={visible} onChange={(e) => setVisible(e.target.value === 'true')}
              className="h-10 border mt-1 rounded px-4 w-full bg-gray-50">
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
          </div>

          <div className="md:col-span-5">
            <label htmlFor="tags">Tags</label>
            <input type="text" name="tags" id="tags" value={tags.join(', ')} onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()))}
              className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
          </div>

          <div className="md:col-span-5">
            <label htmlFor="image">Image</label>
            <input type="file" name="image" id="image" multiple onChange={(e) => setImage([...e.target.files])}
              className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
            <div className="mt-2">
              {imagePreview.map((url, index) => (
                <img key={index} src={url} alt={`Product ${index}`} className="w-20 h-20 object-cover inline-block mr-2" />
              ))}
            </div>
          </div>

          <div className="md:col-span-5">
            <label htmlFor="variations">Variations</label>
            {variations.map((variation, variationIndex) => (
              <div key={variationIndex} className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="block">Variation Name</label>
                    <input type="text" value={variation.name} onChange={(e) => handleVariationChange(variationIndex, 'name', e.target.value)}
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" required />
                  </div>
                  <div>
                    <label className="block">Quantity</label>
                    <input type="number" value={variation.quantity} onChange={(e) => handleVariationChange(variationIndex, 'quantity', e.target.value)}
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" required />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block">Prices</label>
                  {variation.prices && variation.prices.map((price, priceIndex) => (
                    <div key={priceIndex} className="flex justify-between items-center mt-2">
                      <div>
                        <label className="block">Price</label>
                        <input type="number" value={price.price} onChange={(e) => handlePriceChange(variationIndex, priceIndex, 'price', e.target.value)}
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" required />
                      </div>
                      <div>
                        <label className="block">Min Quantity</label>
                        <input type="number" value={price.minQuantity} onChange={(e) => handlePriceChange(variationIndex, priceIndex, 'minQuantity', e.target.value)}
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" required />
                      </div>
                      <div>
                        <label className="block">Max Quantity</label>
                        <input type="number" value={price.maxQuantity} onChange={(e) => handlePriceChange(variationIndex, priceIndex, 'maxQuantity', e.target.value)}
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" required />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-5 text-right">
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Update Product</button>
          </div>
        </form>
      }
    </div>
  );
};

export default UpdateProduct;
