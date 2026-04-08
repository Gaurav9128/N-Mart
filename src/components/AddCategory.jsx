import React, { useEffect, useState, Fragment } from 'react';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { Listbox, Transition } from '@headlessui/react';
import { firestore } from '../firebase/FirebaseConfig';
import { CheckIcon, ChevronUpDownIcon, PlusIcon, TagIcon, ViewColumnsIcon } from '@heroicons/react/20/solid';
import { z } from "zod";
import { toast, Toaster } from 'react-hot-toast'; // Notification ke liye

const AddCategory = () => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [parent, setParent] = useState("None (Root)");
    const [categoryName, setCategoryName] = useState("");
    const [displayName, setDisplayName] = useState("");
    
    // Zod Schema
    const CategorySchema = z.object({
        name: z.string().min(2, "Name too short").regex(/^\S+$/, "Spaces are not allowed"),
        display: z.string().min(2, "Display name is required")
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const querySnapshot = await getDocs(collection(firestore, "categories"));
            const extracted = querySnapshot.docs.map(doc => doc.id);
            setCategories(["None (Root)", ...extracted]);
        } catch (error) {
            toast.error("Failed to load categories");
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        const validation = CategorySchema.safeParse({ name: categoryName, display: displayName });
        
        if (!validation.success) {
            toast.error(validation.error.issues[0].message);
            setLoading(false);
            return;
        }

        try {
            const categoryRef = doc(firestore, "categories", categoryName.toLowerCase());
            await setDoc(categoryRef, {
                displayName: displayName,
                parent: parent === "None (Root)" ? null : parent,
                createdAt: new Date().toISOString()
            });

            toast.success("Category created successfully!");
            setCategoryName("");
            setDisplayName("");
            setParent("None (Root)");
            fetchCategories(); // Refresh list
        } catch (err) {
            console.error(err);
            toast.error("Firebase Error: Could not save");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Toaster position="top-right" />
            
            {/* Header Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Add New Category</h2>
                <p className="text-gray-500 text-sm">Organize your products by creating hierarchical categories.</p>
            </div>

            <form onSubmit={handleAddCategory} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    
                    {/* Category ID / Slug */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <TagIcon className="h-4 w-4 mr-2 text-blue-500" />
                            Category Name
                        </label>
                        <input 
                            type="text" 
                            placeholder="e.g. electronics-gadgets"
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                            value={categoryName} 
                            onChange={(e) => setCategoryName(e.target.value)} 
                        />
                        <p className="text-[11px] text-gray-400 italic">No spaces allowed. This is used in URLs.</p>
                    </div>

                    {/* Display Name */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <ViewColumnsIcon className="h-4 w-4 mr-2 text-purple-500" />
                            Display Name
                        </label>
                        <input 
                            type="text" 
                            placeholder="e.g. Electronics & Gadgets"
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                            value={displayName} 
                            onChange={(e) => setDisplayName(e.target.value)} 
                        />
                    </div>

                    {/* Parent Category Dropdown */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Parent Category</label>
                        <Listbox value={parent} onChange={setParent}>
                            <div className="relative">
                                <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-gray-50/50 border border-gray-200 py-3 pl-4 pr-10 text-left focus:ring-2 focus:ring-blue-500 outline-none sm:text-sm">
                                    <span className="block truncate text-gray-700">{parent}</span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </Listbox.Button>
                                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 shadow-xl ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                        {categories.map((cat, idx) => (
                                            <Listbox.Option
                                                key={idx}
                                                className={({ active }) => `relative cursor-default select-none py-3 pl-10 pr-4 ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}`}
                                                value={cat}
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>{cat}</span>
                                                        {selected ? (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
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
                </div>

                {/* Submit Button */}
                <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
                    <button 
                        disabled={loading}
                        className={`flex items-center justify-center px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-200 
                        ${loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                            <PlusIcon className="h-5 w-5 mr-2" />
                        )}
                        {loading ? "Adding..." : "Save Category"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddCategory;