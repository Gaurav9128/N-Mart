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

    const getCategory = async () => {
        const querySnapshot = await getDocs(collection(firestore, "categories"));
        const extractedNames = querySnapshot.docs.map(doc => doc.id);
        setCategories(extractedNames);
    };

    // 🔹 Helper function for savings
    const calculateSavings = (mrpValue, priceValue) => {
        const mrpNum = parseFloat(mrpValue) || 0;
        const priceNum = parseFloat(priceValue) || 0;
        if (mrpNum > priceNum) {
            const saving = mrpNum - priceNum;
            const discountPercent = ((saving / mrpNum) * 100).toFixed(0);
            return { saving, discountPercent };
        }
        return { saving: 0, discountPercent: 0 };
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

    const handlemrpdis = (index, e) => {
        if (!mrp) return;
        let totalmrp = parseFloat(e) || 0;
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
                    let totalmrp = parseFloat(mrpValue) || 0;
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
        }
    }, [discount1, discount2]);

    return (
        <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
            {loading && <Loader />}

            {/* Variations */}
            <div className="md:col-span-5">
                <label htmlFor="variations">Variations</label>
                <div className="flex gap-2">
                    <input type="text" name="variations" id="variations"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        value={variationInput}
                        onChange={(e) => setVariationInput(e.target.value)} />
                    <button type="button"
                        className="bg-blue-500 text-white px-4 py-2 rounded mt-1"
                        onClick={addVariation}>Add</button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                    {variations.map((variation, index) => {
                        const { saving, discountPercent } = calculateSavings(mrp[index], price[index]);

                        return (
                            <div key={index} className="flex flex-col gap-2 mt-2 p-3 border rounded-md bg-gray-50">
                                <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                                    {variation}
                                    <XMarkIcon className="h-4 w-4 cursor-pointer"
                                        onClick={() => removeVariation(variation)} />
                                </span>

                                {/* MRP Input */}
                                <input
                                    type="number"
                                    name={`mrp-${index}`}
                                    id={`mrp-${index}`}
                                    className="h-10 border rounded px-4 w-full bg-white"
                                    placeholder={`MRP for ${variation}`}
                                    value={mrp[index] || ''}
                                    onChange={(e) => {
                                        const newMrp = [...mrp];
                                        newMrp[index] = e.target.value;
                                        handlemrpdis(index, e.target.value);
                                        setMrp(newMrp);
                                    }}
                                />

                                {/* Show Savings Info */}
                                {saving > 0 && (
                                    <p className="text-sm text-red-500 font-medium">
                                        You Save: ₹{saving} ({discountPercent}% OFF)
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AddProduct;
