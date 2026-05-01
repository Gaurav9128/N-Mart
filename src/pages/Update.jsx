import React, { useState, useEffect, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { firestore, storage } from "../firebase/FirebaseConfig";
import { doc, collection, getDocs, updateDoc, addDoc, serverTimestamp, deleteDoc, query, where } from 'firebase/firestore';
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
  const [discount1, setDiscount1] = useState('');
  const [discount2, setDiscount2] = useState('');
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

  // 🔥 Auto-calculate prices whenever discounts or MRPs change
  useEffect(() => {
    if (variations.length > 0) {
      const updatedVariations = variations.map(v => {
        let totalmrp = parseFloat(v.mrp) || 0;
        if (discount1) totalmrp -= (totalmrp * parseFloat(discount1) / 100);
        if (discount2) totalmrp -= (totalmrp * parseFloat(discount2) / 100);
        
        const discountedPrice = totalmrp.toFixed(2);
        
        return {
          ...v,
          price: discountedPrice,
          prices: v.prices ? v.prices.map(p => ({ ...p, price: discountedPrice })) : []
        };
      });
      
      if (JSON.stringify(updatedVariations) !== JSON.stringify(variations)) {
        setVariations(updatedVariations);
      }
    }
  }, [discount1, discount2]);

  const getCategories = async () => {
    const querySnapshot = await getDocs(collection(firestore, "categories"));
    setCategories(querySnapshot.docs.map(doc => doc.id));
  };

  // 🚀 Optimized Fast Loading getProducts
  const getProducts = async (category) => {
    setLoading(true);
    try {
      const q = query(collection(firestore, "products"), where("category", "==", category));
      const querySnapshot = await getDocs(q);
      
      const extractedProducts = await Promise.all(querySnapshot.docs.map(async (d) => {
        const productData = d.data();
        const productId = d.id;

        const varSnap = await getDocs(collection(firestore, "products", productId, "variations"));
        const variations = await Promise.all(varSnap.docs.map(async (vDoc) => {
          const vData = vDoc.data();
          const priceSnap = await getDocs(collection(firestore, "products", productId, "variations", vDoc.id, "prices"));
          return {
            id: vDoc.id,
            ...vData,
            prices: priceSnap.docs.map(p => ({ id: p.id, ...p.data() }))
          };
        }));

        return { id: productId, ...productData, variations };
      }));

      setProducts(extractedProducts);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const populateProductDetails = () => {
    setTitle(selectedProduct.title || '');
    setDescription(selectedProduct.description || '');
    setTags(selectedProduct.tags || []);
    setBrand(selectedProduct.brand || '');
    setVoucher(selectedProduct.voucher || '');
    setDiscount1(selectedProduct.discount1 || '');
    setDiscount2(selectedProduct.discount2 || '');
    setVisible(selectedProduct.visible !== undefined ? selectedProduct.visible : true);
    setImagePreview(selectedProduct.image || []);
    setVariations(selectedProduct.variations || []);
  };

  // ✅ Missing Function Added
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    if (window.confirm("Kya aap sach mein is product ko delete karna chahte hain?")) {
      setLoading(true);
      try {
        await deleteDoc(doc(firestore, "products", selectedProduct.id));
        alert("Product delete ho gaya!");
        setSelectedProduct(null);
        getProducts(selectedCategory); // List refresh karein
      } catch (error) {
        alert("Delete failed: " + error.message);
      }
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imgUrls = [...imagePreview.filter(url => typeof url === 'string' && url.startsWith('http'))];
      if (image.length > 0) {
        for (const file of image) {
          const imgRef = ref(storage, `product-images/${selectedCategory}/${file.name}`);
          await uploadBytes(imgRef, file);
          const url = await getDownloadURL(imgRef);
          imgUrls.push(url);
        }
      }
  
      const updatedProduct = {
        title, description, category: selectedCategory, tags,
        image: imgUrls, voucher, brand, visible, discount1, discount2,
        updatedAt: serverTimestamp()
      };
  
      await updateDoc(doc(firestore, "products", selectedProduct.id), updatedProduct);

      // Variations Update Logic
      for (const variation of variations) {
        const varData = {
          name: variation.name,
          quantity: parseInt(variation.quantity) || 0,
          price: parseFloat(variation.price) || 0,
          mrp: parseFloat(variation.mrp) || 0
        };

        if (variation.id) {
          await updateDoc(doc(firestore, "products", selectedProduct.id, "variations", variation.id), varData);
        } else {
          await addDoc(collection(firestore, "products", selectedProduct.id, "variations"), varData);
        }
      }
  
      alert("Product updated!");
      getProducts(selectedCategory);
    } catch (error) {
      alert("Update failed: " + error.message);
    }
    setLoading(false);
  };

  const handleVariationChange = (index, field, value) => {
    const updated = [...variations];
    updated[index][field] = value;
    if (field === 'mrp') {
      let total = parseFloat(value) || 0;
      if (discount1) total -= (total * parseFloat(discount1) / 100);
      if (discount2) total -= (total * parseFloat(discount2) / 100);
      updated[index].price = total.toFixed(2);
    }
    setVariations(updated);
  };

  const handlePriceChange = (vIndex, pIndex, field, value) => {
    const updated = [...variations];
    updated[vIndex].prices[pIndex][field] = value;
    setVariations(updated);
  };

  const handleAddVariation = () => {
    setVariations([...variations, { name: '', quantity: 0, mrp: 0, price: 0, prices: [{ price: 0, minQuantity: 0, maxQuantity: 0 }] }]);
  };

  const handleDeleteVariation = (index) => {
    const updated = [...variations];
    updated.splice(index, 1);
    setVariations(updated);
  };

  const handleDeleteImage = (url) => {
    setImagePreview(imagePreview.filter(u => u !== url));
    setImage(image.filter(f => URL.createObjectURL(f) !== url));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImage([...image, ...files]);
    setImagePreview([...imagePreview, ...files.map(f => URL.createObjectURL(f))]);
  };

  return (
    <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5 p-4 bg-white rounded shadow">
      {loading && <Loader />}
      
      <div className="md:col-span-5">
        <label className="font-bold">Category</label>
        <select className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </select>
      </div>

      {selectedCategory && (
        <div className="md:col-span-5">
          <label className="font-bold">Product</label>
          <select className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" value={selectedProduct?.id || ''} onChange={(e) => setSelectedProduct(products.find(p => p.id === e.target.value))}>
            <option value="">Select Product</option>
            {products.map((p, i) => <option key={i} value={p.id}>{p.title}</option>)}
          </select>
        </div>
      )}

      {selectedProduct && (
        <>
          <div className="md:col-span-5">
            <label>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
          </div>

          <div className="md:col-span-2">
            <label>Discount 1 (%)</label>
            <input type="number" value={discount1} onChange={(e) => setDiscount1(e.target.value)} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
          </div>

          <div className="md:col-span-2">
            <label>Discount 2 (%)</label>
            <input type="number" value={discount2} onChange={(e) => setDiscount2(e.target.value)} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
          </div>

          <div className="md:col-span-5">
            <label>Upload Images</label>
            <input type="file" multiple onChange={handleImageChange} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
            <div className="flex flex-wrap gap-2 mt-2">
              {imagePreview.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} className="h-20 w-20 object-cover rounded" />
                  <button onClick={() => handleDeleteImage(url)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">×</button>
                </div>
              ))}
            </div>
          </div>

          {variations.map((variation, vIndex) => (
            <div key={vIndex} className="md:col-span-5 border p-4 rounded bg-gray-50 mt-4 shadow-inner">
              <div className="flex justify-between">
                <h3 className="font-bold text-blue-600">Variation {vIndex + 1}</h3>
                <button onClick={() => handleDeleteVariation(vIndex)} className="text-red-500 text-xs font-bold uppercase">Remove</button>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-2">
                <input placeholder="Name (80ml)" value={variation.name} onChange={(e) => handleVariationChange(vIndex, 'name', e.target.value)} className="h-10 border rounded px-2" />
                
                <div>
                  <label className="text-[10px] font-bold">MRP</label>
                  <input type="number" placeholder="MRP" value={variation.mrp} onChange={(e) => handleVariationChange(vIndex, 'mrp', e.target.value)} className="h-10 border rounded px-2 w-full" />
                </div>

                <div>
                  <label className="text-[10px] font-bold">Selling Price</label>
                  <input type="number" value={variation.price} readOnly className="h-10 border rounded px-2 w-full bg-gray-200 font-bold text-green-700" />
                </div>
              </div>
            </div>
          ))}

          <div className="md:col-span-5 flex flex-col sm:flex-row gap-2 mt-6">
            <button onClick={handleAddVariation} className="bg-green-600 text-white px-4 py-3 rounded-lg font-bold flex-1">Add Variation</button>
            <button onClick={handleUpdateProduct} className="bg-blue-600 text-white px-4 py-3 rounded-lg font-bold flex-1">Update Product</button>
            <button onClick={handleDeleteProduct} className="bg-red-600 text-white px-4 py-3 rounded-lg font-bold flex-1">Delete Product</button>
          </div>
        </>
      )}
    </div>
  );
};

export default UpdateProduct;