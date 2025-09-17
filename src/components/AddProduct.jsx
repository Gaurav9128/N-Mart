import React, { useState, Fragment, useEffect } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { storage, firestore } from "../firebase/FirebaseConfig";
import { addDoc, collection, getDocs, runTransaction, doc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const AddProduct = () => {
  const [name, setName] = useState("");
  const [variations, setVariations] = useState([]);
  const [newVariation, setNewVariation] = useState({
    size: "",
    price: "",
    discount: "",
    mrp: "",
    youSave: 0,
  });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // categories fetch
  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(firestore, "categories"));
      setCategories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchCategories();
  }, []);

  // variation change handler with youSave calculation
  const handleVariationChange = (field, value) => {
    const updatedVariation = { ...newVariation, [field]: value };

    const price = parseFloat(updatedVariation.price) || 0;
    const discount = parseFloat(updatedVariation.discount) || 0;
    const mrp = parseFloat(updatedVariation.mrp) || 0;

    updatedVariation.youSave = mrp - (price - discount);

    setNewVariation(updatedVariation);
  };

  // add variation
  const addVariation = () => {
    if (newVariation.size && newVariation.price && newVariation.mrp) {
      setVariations([...variations, newVariation]);
      setNewVariation({ size: "", price: "", discount: "", mrp: "", youSave: 0 });
    }
  };

  // remove variation
  const removeVariation = (index) => {
    const updated = [...variations];
    updated.splice(index, 1);
    setVariations(updated);
  };

  // tag add
  const addTag = (e) => {
    e.preventDefault();
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  // image upload
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    const uploaded = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const storageRef = ref(storage, `products/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      uploaded.push(url);
    }
    setImages([...images, ...uploaded]);
  };

  // remove image
  const removeImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  // save product
  const saveProduct = async () => {
    if (!name || !selectedCategory) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      await runTransaction(firestore, async (transaction) => {
        const categoryRef = doc(firestore, "categories", selectedCategory.id);
        const productRef = collection(categoryRef, "products");
        await addDoc(productRef, {
          name,
          variations,
          tags,
          images,
        });
      });

      alert("Product saved successfully!");
      resetForm();
    } catch (error) {
      console.error("Error saving product: ", error);
      alert("Error saving product");
    }
  };

  // reset form
  const resetForm = () => {
    setName("");
    setVariations([]);
    setNewVariation({ size: "", price: "", discount: "", mrp: "", youSave: 0 });
    setTags([]);
    setTagInput("");
    setImages([]);
    setSelectedCategory(null);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Add Product</h2>

      {/* Product Name */}
      <input
        type="text"
        placeholder="Product Name"
        className="w-full border p-2 rounded mb-3"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Category */}
      <Listbox value={selectedCategory} onChange={setSelectedCategory}>
        <div className="relative mb-3">
          <Listbox.Button className="w-full border p-2 rounded flex justify-between items-center">
            <span>{selectedCategory ? selectedCategory.name : "Select Category"}</span>
            <ChevronUpDownIcon className="w-5 h-5" />
          </Listbox.Button>
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Listbox.Options className="absolute w-full bg-white shadow rounded mt-1">
              {categories.map((category) => (
                <Listbox.Option
                  key={category.id}
                  value={category}
                  className="cursor-pointer p-2 hover:bg-gray-100"
                >
                  {category.name}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      {/* Variation Add */}
      <div className="border p-3 rounded mb-3">
        <h3 className="font-semibold mb-2">Add Variation</h3>
        <input
          type="text"
          placeholder="Size"
          className="border p-2 rounded w-full mb-2"
          value={newVariation.size}
          onChange={(e) => handleVariationChange("size", e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          className="border p-2 rounded w-full mb-2"
          value={newVariation.price}
          onChange={(e) => handleVariationChange("price", e.target.value)}
        />
        <input
          type="number"
          placeholder="Discount"
          className="border p-2 rounded w-full mb-2"
          value={newVariation.discount}
          onChange={(e) => handleVariationChange("discount", e.target.value)}
        />
        <input
          type="number"
          placeholder="MRP"
          className="border p-2 rounded w-full mb-2"
          value={newVariation.mrp}
          onChange={(e) => handleVariationChange("mrp", e.target.value)}
        />
        <p className="mb-2 text-green-600 font-medium">
          You Save: ₹{newVariation.youSave || 0}
        </p>
        <button onClick={addVariation} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Variation
        </button>
      </div>

      {/* Variations List */}
      {variations.map((variation, index) => (
        <div key={index} className="border p-3 rounded mb-2">
          <p><strong>Size:</strong> {variation.size}</p>
          <p><strong>Price:</strong> ₹{variation.price}</p>
          <p><strong>Discount:</strong> ₹{variation.discount}</p>
          <p><strong>MRP:</strong> ₹{variation.mrp}</p>
          <p className="text-green-600"><strong>You Save:</strong> ₹{variation.youSave}</p>
          <button onClick={() => removeVariation(index)} className="mt-2 text-red-500">
            Remove
          </button>
        </div>
      ))}

      {/* Tags */}
      <form onSubmit={addTag} className="mb-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add Tag"
            className="border p-2 rounded flex-1"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
          />
          <button type="submit" className="bg-gray-500 text-white px-4 rounded">Add</button>
        </div>
      </form>
      <div className="flex gap-2 flex-wrap mb-3">
        {tags.map((tag, index) => (
          <span key={index} className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded">
            {tag}
            <XMarkIcon className="w-4 h-4 cursor-pointer" onClick={() => setTags(tags.filter((_, i) => i !== index))} />
          </span>
        ))}
      </div>

      {/* Images */}
      <input type="file" multiple onChange={handleImageUpload} className="mb-3" />
      <div className="flex gap-2 flex-wrap mb-3">
        {images.map((url, index) => (
          <div key={index} className="relative">
            <img src={url} alt="Product" className="w-20 h-20 object-cover rounded" />
            <XMarkIcon
              className="absolute top-0 right-0 w-5 h-5 bg-white rounded-full cursor-pointer"
              onClick={() => removeImage(index)}
            />
          </div>
        ))}
      </div>

      {/* Save Product */}
      <button onClick={saveProduct} className="bg-green-500 text-white px-6 py-2 rounded">
        Save Product
      </button>
    </div>
  );
};

export default AddProduct;
