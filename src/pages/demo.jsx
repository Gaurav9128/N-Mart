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
    const [mrprs, setMrpRs] = useState('');

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
        if (!minQuantity[index] || !maxQuantity[index] || !price[index]) {
            alert("Ranges field cannot be empty");
            return;
        }

        if (!priceRanges[index]) {
            priceRanges[index] = [];
        }
        priceRanges[index].push([parseFloat(minQuantity[index]), parseFloat(maxQuantity[index]), parseFloat(price[index])]);
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
                });

                const variationDataArray = variations.map((variation, index) => ({
                    name: variation,
                    quantity: parseInt(quantity[index], 10),
                    price: parseFloat(price[index]),
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

    const handlemrpdis = () => {
        if (!mrprs) {
            alert("Please fill MRP first");
            return;
        }

        let discountPrice = parseFloat(mrprs);

        if (discount1) {
            discountPrice -= (discountPrice * (parseFloat(discount1) / 100));
        }

        if (discount2) {
            discountPrice -= (discountPrice * (parseFloat(discount2) / 100));
        }

        setPrice([discountPrice.toFixed(2)]);
    };

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
        setMrpRs("");
    };

    return (
        <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
            {loading && <Loader />}
            <div className="md:col-span-5">
                <label htmlFor="title">Title</label>
                <input type="text" name="title" id="title" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="md:col-span-5">
                <label htmlFor="description">Description</label>
                <textarea name="description" id="description" className="h-20 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
            </div>
            <div className="md:col-span-5">
                <label htmlFor="category">Category</label>
                <Listbox value={selectedCategory} onChange={setSelectedCategory}>
                    <div className="relative mt-1">
                        <Listbox.Button className="relative w-full cursor-default rounded-lg border bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                            <span className="block truncate">{selectedCategory || "Select a category"}</span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                        </Listbox.Button>
                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {categories.map((category, index) => (
                                    <Listbox.Option key={index} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-amber-100 text-amber-900" : "text-gray-900"}`} value={category}>
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{category}</span>
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
            <div className="md:col-span-5">
                <label htmlFor="brand">Brand</label>
                <input type="text" name="brand" id="brand" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
            <div className="md:col-span-5">
                <label htmlFor="voucher">Voucher</label>
                <input type="text" name="voucher" id="voucher" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="Voucher" value={voucher} onChange={(e) => setVoucher(e.target.value)} />
            </div>
            <div className="md:col-span-5">
                <label htmlFor="mrprs">MRP (in Rs.)</label>
                <input type="number" name="mrprs" id="mrprs" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="MRP (in Rs.)" value={mrprs} onChange={(e) => setMrpRs(e.target.value)} />
            </div>
            <div className="md:col-span-5">
                <label htmlFor="discount1">Discount 1 (in %)</label>
                <input type="number" name="discount1" id="discount1" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="Discount 1 (in %)" value={discount1} onChange={(e) => setDiscount1(e.target.value)} />
            </div>
            <div className="md:col-span-5">
                <label htmlFor="discount2">Discount 2 (in %)</label>
                <input type="number" name="discount2" id="discount2" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="Discount 2 (in %)" value={discount2} onChange={(e) => setDiscount2(e.target.value)} />
            </div>
            <div className="md:col-span-5">
                <label htmlFor="price">Price after Discounts</label>
                <input type="number" name="price" id="price" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="Price after Discounts" value={price[0] || ""} onChange={(e) => setPrice([e.target.value])} />
                <button type="button" onClick={handlemrpdis} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">Calculate Price</button>
            </div>
            <div className="md:col-span-5">
                <label htmlFor="tags">Tags (press Enter to add)</label>
                <input type="text" name="tags" id="tags" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="Tags" onKeyUp={addTag} />
                <div className="mt-2">
                    {tags.map((tag, index) => (
                        <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-red-500 hover:text-red-700">
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </span>
                    ))}
                </div>
            </div>
            <div className="md:col-span-5">
                <label htmlFor="image">Images</label>
                <input type="file" name="image" id="image" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" onChange={handleImageChange} multiple />
                <div className="mt-2 flex flex-wrap">
                    {imagePreview.map((src, index) => (
                        <div key={index} className="relative w-20 h-20 mr-2 mb-2">
                            <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover rounded" />
                            <button type="button" onClick={() => removeImage(index)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="md:col-span-5">
                <label htmlFor="variation">Variations</label>
                <div className="flex items-center mb-2">
                    <input type="text" name="variation" id="variation" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="Add a variation" value={variationInput} onChange={(e) => setVariationInput(e.target.value)} />
                    <button type="button" onClick={addVariation} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2">Add</button>
                </div>
                <div className="mt-2">
                    {variations.map((variation, index) => (
                        <div key={index} className="mb-2">
                            <span className="block text-sm font-semibold text-gray-700">{variation}</span>
                            <div className="flex items-center">
                                <input type="number" name={`minQuantity-${index}`} className="h-10 border mt-1 rounded px-4 w-1/3 bg-gray-50 mr-2" placeholder="Min Quantity" value={minQuantity[index] || ""} onChange={(e) => {
                                    const newMinQuantity = [...minQuantity];
                                    newMinQuantity[index] = e.target.value;
                                    setMinQuantity(newMinQuantity);
                                }} />
                                <input type="number" name={`maxQuantity-${index}`} className="h-10 border mt-1 rounded px-4 w-1/3 bg-gray-50 mr-2" placeholder="Max Quantity" value={maxQuantity[index] || ""} onChange={(e) => {
                                    const newMaxQuantity = [...maxQuantity];
                                    newMaxQuantity[index] = e.target.value;
                                    setMaxQuantity(newMaxQuantity);
                                }} />
                                <button type="button" onClick={() => removeVariation(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="md:col-span-5">
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit</button>
            </div>
        </div>
};

export default MyForm;
