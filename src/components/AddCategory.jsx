import { addDoc, collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { Listbox, Transition } from '@headlessui/react'
import React, { useEffect, useState,Fragment } from 'react'
import { firestore } from '../firebase/FirebaseConfig';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { z } from "zod";

const AddCategory = () => {
    const [count, setCount] = useState(0);
    const [categories, setCategories] = useState([]);
    const [parent,setParent] = useState("null");
    const [categoryName, setCategoryName] = useState("");
    const [displayName, setDisplayName] = useState("");
    
    useEffect(() => {
        getCategory();
    },[count]);

    const CategoryNameSchema = z.string().regex(/^\S+$/);

    const getCategory = async() => {
        const querySnapshot = await getDocs(collection(firestore,"categories"));
        const extractedNames = querySnapshot.docs.map(doc => doc.id);
        setCategories([...extractedNames, "null"]);
    }

    const handleAddCategory = async(e) => {
        e.preventDefault();
        try{
            const parsedData = CategoryNameSchema.parse(categoryName);

            const categoryRef = doc(firestore,"categories",parsedData);
            try {
                await setDoc(categoryRef,{
                    displayName : displayName,
                    parent : parent === "null"?null : parent
                })
                setCount(prev => prev+1);
                setCategoryName("");
                setDisplayName("");
                setParent("null")
                alert("Category Added")
            } catch(err) {
                console.error(err);
            }
        }catch(error){
            alert("Category Name is invalid.Don't use spaces.");
        }
    }

  return (
    <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
        <div className="md:col-span-3">
            <label htmlFor="categoryName">Category name</label>
            <input type="text" name="categoryName" id="categoryName" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />

        </div>
        <div className="md:col-span-3">
            <label htmlFor="categoryName">Display name</label>
            <input type="text" name="displayName" id="displayName" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            
        </div>

        <div className="md:col-span-3">
            <label htmlFor="parent">Parent</label>
            {categories &&
                <Listbox value={parent} onChange={setParent}>
                    <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                        <span className="block truncate">{parent}</span>
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
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                        {categories.map((cat, catIdx) => (
                            <Listbox.Option
                            key={catIdx}
                            className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                                }`
                            }
                            value={cat}
                            >
                            {({ categories }) => (
                                <>
                                <span
                                    className={`block truncate ${
                                    categories ? 'font-medium' : 'font-normal'
                                    }`}
                                >
                                    {cat}
                                </span>
                                {categories ? (
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

        <div className="md:col-span-5 text-right">
            <div className="inline-flex items-end">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleAddCategory}>Submit</button>
            </div>
        </div>

    </div>
  )
}

export default AddCategory
