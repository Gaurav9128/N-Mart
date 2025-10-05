import React, { useState, Fragment, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { storage, firestore } from "../firebase/FirebaseConfig";
import { addDoc, collection, getDocs, runTransaction, doc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Loader from './Loader';
import { z } from "zod";

const AddProduct = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedCategory, setSelectedCategory] = useState();
    const [categories, setCategories] = useState([]);
    const [variationInput, setVariationInput] = useState("");
    const [variations, setVariations] = useState([]);
    const [quantity, setQuantity] = useState([]);
    const [minQuantity, setMinQuantity] = useState([]);
    const [maxQuantity, setMaxQuantity] = useState([]);
    const [price, setPrice] = useState([]);
    const [priceRanges, setPriceRanges] = useState([]);
    const [tags, setTags] = useState([]);
    const [image, setImage] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);
    const [voucher, setVoucher] = useState("");
    const [brand, setBrand] = useState("");
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(true);
    const [discount1, setDiscount1] = useState("");
    const [discount2, setDiscount2] = useState("");
    const [mrp, setMrp] = useState([]);
     const [bestseller, setBestseller] = useState(false);


    useEffect(() => {
        getCategory();
    }, []);

    // zod schema verification
    const URLRegex = /^(ftp|http|https):\/\/[^ "]+$/;

    const ProductSchema = z.object({
        title: z.string().min(1).max(100),
        description: z.string().min(1),
        category: z.string().min(1),
        tags: z.array(z.string()).max(10),
        image: z.array(z.string().refine(url => URLRegex.test(url), { message: "Invalid URL format" })).min(1),
        voucher: z.string().optional(),
        brand: z.string().min(1),
        visible: z.boolean(),
        discount1: z.string().optional(),
        discount2: z.string().optional(),
        bestseller: z.boolean(),
    });
    

    const VariationSchema = z.object({
        name: z.string().min(1).max(50),
        quantity: z.number().int().min(0),
        price: z.number().min(0),
    });

    const getCategory = async () => {
        const querySnapshot = await getDocs(collection(firestore, "categories"));
        const extractedNames = querySnapshot.docs.map(doc => doc.id);
        setCategories(extractedNames);
    };

    const addRange = (index) => {
        const minQty = parseFloat(minQuantity[index]);
        const maxQty = parseFloat(maxQuantity[index]);
        const Qty = parseFloat(quantity[index]);
        const priceVal = parseFloat(price[index]);
    
        if (isNaN(minQty) || isNaN(maxQty) || isNaN(priceVal)) {
            alert("Ranges field cannot be empty");
            return;
        }
    
        if (minQty >= maxQty) {
            alert("Minimum quantity cannot be greater than Maximum Quantity");
            return;
        }
        if (maxQty > Qty) {
            alert("Minimum quantity cannot be greater than Maximum Quantity");
            return;
        }
    
        if (!priceRanges[index]) {
            priceRanges[index] = [];
        }
    
        priceRanges[index].push([minQty, maxQty, priceVal]);
        setPriceRanges([...priceRanges]);
    
        const newMinQuantity = [...minQuantity];
        const newMaxQuantity = [...maxQuantity];
        const newPrice = [...price];
    
        newMinQuantity[index] = '';
        newMaxQuantity[index] = '';
        newPrice[index] = '';
    
        setMinQuantity(newMinQuantity);
        setMaxQuantity(newMaxQuantity);
        setPrice(newPrice);
    };
    

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = [...image, ...files];
        setImage(newImages);

        const previews = newImages.map((file) => URL.createObjectURL(file));
        setImagePreview(previews);
    };

    const addTag = (e) => {
        if (e.key === "Enter" && e.target.value.length > 0) {
            setTags([...tags, e.target.value]);
            e.target.value = "";
        }
    };

    const removeTag = (removedTag) => {
        setTags(tags.filter(tag => tag !== removedTag));
    };

    const addVariation = () => {
        if (variationInput.length < 1) {
            alert("Variations field is empty");
            return;
        }
        setVariations([...variations, variationInput]);
        setMrp([...mrp, ""]); // Initialize MRP value
        setVariationInput("");
    };


    const removeImage = (index) => {
        const newImages = [...image];
        newImages.splice(index, 1);
        setImage(newImages);

        const newPreviews = [...imagePreview];
        newPreviews.splice(index, 1);
        setImagePreview(newPreviews);
    };

    const removeVariation = (removedVariation) => {
        const newVariations = variations.filter((variation, i) => variation !== removedVariation);
        setVariations(newVariations);

        const newQuantity = quantity.filter((q, i) => i !== removedVariation);
        setQuantity(newQuantity);

        const newPriceRanges = priceRanges.filter((range, i) => i !== removedVariation);
        setPriceRanges(newPriceRanges);
    };

    const handleAddProducts = async (e) => {
        e.preventDefault();
        setLoading(true);
        const prodRef = collection(firestore, "products");
    
        try {
            let imgUrls = [];
            for (let i = 0; i < image.length; i++) {
                const imgRef = ref(storage, `product-images/${selectedCategory}/${image[i].name}`);
                await uploadBytes(imgRef, image[i]);
                const url = await getDownloadURL(imgRef);
                imgUrls.push(url);
            }
    
            try {
                const validatedProduct = ProductSchema.parse({
                    title,
                    description,
                    category: selectedCategory,
                    tags,
                    image: imgUrls,
                    voucher,
                    brand,
                    discount1,
                    discount2,
                    visible,
                    bestseller,
                });
    
                const variationDataArray = variations.map((variation, index) => ({
                    name: variation,
                    quantity: parseInt(quantity[index], 10),
                    price: parseFloat(price[index]),
                    mrp: parseFloat(mrp[index]), // Add MRP value here
                }));
    
                await runTransaction(firestore, async (transaction) => {
                    const docRef = doc(prodRef);
                    transaction.set(docRef, validatedProduct);
                    const variationsCollection = collection(firestore, "products", docRef.id, "variations");
    
                    for (const [index, variation] of variationDataArray.entries()) {
                        const variationdocRef = doc(variationsCollection);
                        transaction.set(variationdocRef, variation);
    
                        const pricesCollection = collection(firestore, "products", docRef.id, "variations", variationdocRef.id, "prices");
                        for (const priceData of priceRanges[index]) {
                            const priceDocRef = doc(pricesCollection);
                            transaction.set(priceDocRef, {
                                minQuantity: priceData[0],
                                maxQuantity: priceData[1],
                                price: priceData[2],
                            });
                        }
                    }
                });
    
                setLoading(false);
                alert("Product added");
                resetForm();
            } catch (prodError) {
                console.error(prodError);
                alert("Product data is invalid");
                setLoading(false);
            }
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };
    
    const handlemrpdis = (index, e) => {
        if (!mrp) {
            return;
        }
        console.log(e);
        let totalmrp = parseFloat(e) || 0; // Ensure totalmrp is a number
        if (discount1) {
            let disamount = totalmrp * discount1 / 100;
            totalmrp -= disamount;
        }
        if (discount2) {
            let disamount = totalmrp * discount2 / 100;
            totalmrp -= disamount;
        }
    
        const newPrice = [...price];
        newPrice[index] = totalmrp.toFixed(2);
        setPrice(newPrice);
    };
    
    useEffect(() => {
        if (Array.isArray(mrp)) {
            setPrice(prevPrice => {
                return mrp.map((mrpValue, index) => {
                    let totalmrp = parseFloat(mrpValue) || 0; // Ensure totalmrp is a number
                    if (discount1) {
                        let disamount = totalmrp * discount1 / 100;
                        totalmrp -= disamount;
                    }
                    if (discount2) {
                        let disamount = totalmrp * discount2 / 100;
                        totalmrp -= disamount;
                    }
                    return totalmrp.toFixed(2);
                });
            });
        } else {
            console.error("Expected mrp to be an array but got:", mrp);
            // Optionally, handle the case where mrp is not an array
        }
    }, [discount1, discount2]);
    
    


    const resetForm = () => {
        setTitle("");
        setDescription("");
        setSelectedCategory(undefined);
        setVariationInput("");
        setVariations([]);
        setBrand("");
        setPrice([]);
        setQuantity([]);
        setVoucher("");
        setTags([]);
        setPriceRanges([]);
        setImage([]);
        setImagePreview([]);
        setDiscount1("");
        setDiscount2("");
        setMrp("");
        setBestseller(false);
    };

    return (
        <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
            {loading && <Loader />}
            <div className="md:col-span-5">
                <label htmlFor="title">Title</label>
                <input type="text" name="title" id="title" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" value={title || ''} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="md:col-span-5">
                <label htmlFor="description">Description</label>
                <textarea type="text" name="description" id="description" className="border mt-1 rounded px-4 w-full bg-gray-50" value={description || ''} onChange={(e) => setDescription(e.target.value)} placeholder="Product Description" rows={4} cols={50} />
            </div>

            <div className="md:col-span-5">
                <label htmlFor="category">Category</label>
                <Listbox value={selectedCategory} onChange={setSelectedCategory}>
                    <div className="relative mt-1">
                        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                            <span className="block truncate">{selectedCategory ? selectedCategory : "Select a category"}</span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDownIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                            </span>
                        </Listbox.Button>
                        <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {categories && categories.map((category, categoryIdx) => (
                                    <Listbox.Option
                                        key={categoryIdx}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'}`
                                        }
                                        value={category}
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span
                                                    className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                                                >
                                                    {category}
                                                </span>
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
            </div>

             {/* Bestseller */}
            <div className="md:col-span-5 flex items-center gap-2 mt-2">
                <input type="checkbox" id="bestseller" checked={bestseller} onChange={(e) => setBestseller(e.target.checked)} />
                <label htmlFor="bestseller" className="text-sm">Bestseller</label>
            </div>

            <div className="md:col-span-5">
                <label htmlFor="image">Upload Image</label>
                <input type="file" name="image" id="image" accept=".png, .jpg, .jpeg, .img" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" onChange={handleImageChange} multiple />
            </div>
            <div className="md:col-span-5 flex flex-wrap gap-2 mt-2">
                {imagePreview.map((imgSrc, index) => (
                    <div key={index} className="relative">
                        <img src={imgSrc} alt={`Preview ${index}`} className="h-20 w-20 object-cover" />
                        <button type="button" className="absolute top-0 right-0" onClick={() => removeImage(index)}>
                            <XMarkIcon className="w-5 h-5 text-red-500" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="md:col-span-5">
                <label htmlFor="voucher">Voucher</label>
                <input type="text" name="voucher" id="voucher" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" value={voucher || ''} onChange={(e) => setVoucher(e.target.value)} />
            </div>

            <div className="md:col-span-5">
                <label htmlFor="brand">Brand</label>
                <input type="text" name="brand" id="brand" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" value={brand || ''} onChange={(e) => setBrand(e.target.value)} />
            </div>
            <div className="md:col-span-5">
                <label htmlFor="discount1">Discount 1 (in %)</label>
                <input type="number" name="discount1" id="discount1" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="Discount 1 (in %)" value={discount1} onChange={(e) => { setDiscount1(e.target.value) }} />
            </div>
            <div className="md:col-span-5">
                <label htmlFor="discount2">Discount 2 (in %)</label>
                <input type="number" name="discount2" id="discount2" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="Discount 2 (in %)" value={discount2} onChange={(e) => { setDiscount2(e.target.value) }} />
            </div>
            <div className="md:col-span-5">
                <label htmlFor="tags">Tags (Press Enter to Add)</label>
                <input type="text" name="tags" id="tags" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" onKeyDown={addTag} />
                <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                        <span key={index} className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
                            {tag} <XMarkIcon className="h-4 w-4 cursor-pointer" onClick={() => removeTag(tag)} />
                        </span>
                    ))}
                </div>
            </div>

            <div className="md:col-span-5">
                <label htmlFor="variations">Variations</label>
                <div className="flex gap-2">
                    <input type="text" name="variations" id="variations" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" value={variationInput} onChange={(e) => setVariationInput(e.target.value)} />
                    <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded mt-1" onClick={() => { addVariation() }}>Add</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {variations.map((variation, index) => (
                        <div key={index} className="flex flex-col gap-2 mt-2">
                            <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                                {variation} <XMarkIcon className="h-4 w-4 cursor-pointer" onClick={() => removeVariation(variation)} />
                            </span>
                            <input type="number" name={`mrp-${index}`} id={`mrp-${index}`} className="h-10 border rounded px-4 w-full bg-gray-50" placeholder={`MRP for ${variation}`} value={mrp[index] || ''} onChange={(e) => {
                                const newMrp = [...mrp];
                                newMrp[index] = e.target.value;
                                handlemrpdis(index,e.target.value);
                                setMrp(newMrp);
                            }} />
                        </div>
                    ))}
                </div>
            </div>


            <div className="md:col-span-5">
                <label htmlFor="quantity">Quantity</label>
                {variations.map((variation, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                        <input type="number" name={`quantity-${index}`} id={`quantity-${index}`} className="h-10 border rounded px-4 w-full bg-gray-50" placeholder={`Quantity for ${variation}`} value={quantity[index] || ''} onChange={(e) => {
                            const newQuantity = [...quantity];
                            newQuantity[index] = e.target.value;
                            setQuantity(newQuantity);
                        }} />
                    </div>
                ))}
            </div>

            <div className="md:col-span-5">
                <label htmlFor="price">Price Ranges</label>
                {variations.map((variation, index) => (
                    <div key={index} className="mt-2">
                        <h3 className="font-semibold">Price Ranges for {variation}</h3>
                        <div className="flex gap-2">
                            <input type="number" name={`minQuantity-${index}`} id={`minQuantity-${index}`} className="h-10 border rounded px-4 w-full bg-gray-50" placeholder="Min Quantity" value={minQuantity[index] || ''} onChange={(e) => {
                                const newMinQuantity = [...minQuantity];
                                newMinQuantity[index] = e.target.value;
                                setMinQuantity(newMinQuantity);
                            }} />
                            <input type="number" name={`maxQuantity-${index}`} id={`maxQuantity-${index}`} className="h-10 border rounded px-4 w-full bg-gray-50" placeholder="Max Quantity" value={maxQuantity[index] || ''} onChange={(e) => {
                                const newMaxQuantity = [...maxQuantity];
                                newMaxQuantity[index] = e.target.value;
                                setMaxQuantity(newMaxQuantity);
                            }} />
                            <input type="number" name={`price-${index}`} id={`price-${index}`} className="h-10 border rounded px-4 w-full bg-gray-50" placeholder="Price" value={price[index] || ''} onChange={(e) => {
                                const newPrice = [...price];
                                newPrice[index] = e.target.value;
                                setPrice(newPrice);
                            }} />
                            <button type="button" className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => addRange(index)}>Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {priceRanges[index] && priceRanges[index].map((range, rangeIndex) => (
                                <span key={rangeIndex} className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full flex items-center gap-1">
                                    {range[0]} - {range[1]}: ₹{range[2]} <XMarkIcon className="h-4 w-4 cursor-pointer" onClick={() => {
                                        const newPriceRanges = [...priceRanges];
                                        newPriceRanges[index].splice(rangeIndex, 1);
                                        setPriceRanges(newPriceRanges);
                                    }} />
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="md:col-span-5 flex justify-end">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleAddProducts}>Add Product</button>
            </div>
        </div>
    );
};

export default AddProduct;
