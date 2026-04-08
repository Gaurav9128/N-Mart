import React, { useEffect, useState, Fragment } from 'react'
import { Disclosure, Transition } from '@headlessui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import ProductGrid from "./ProductGrid"
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { firestore } from '../firebase/FirebaseConfig'

const Sidebar = () => {
    const { category } = useParams();
    const categoryid = category.split("-aesc-")[0];
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState();
    const [parentCategory, setParentCategory] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        getCategories();
    }, [category]);

    const getCategories = async () => {
        setSelectedCategory(categoryid);
        let rootCategory = { displayName: "", parent: "" };
        let catId = categoryid;

        // Find the root parent category
        do {
            const categoryDoc = doc(firestore, "categories", catId);
            const docSnap = await getDoc(categoryDoc);
            if (docSnap.exists()) {
                rootCategory = { id: docSnap.id, ...docSnap.data() };
                catId = rootCategory.parent;
            } else { break; }
        } while (catId != null);

        setParentCategory(rootCategory);
        let catObj = [];

        const categoriesRef = collection(firestore, "categories");
        const q = query(categoriesRef, where("parent", "==", rootCategory.id));
        const querySnapshot = await getDocs(q);

        await Promise.all(querySnapshot.docs.map(async (doc) => {
            const data = { id: doc.id, ...doc.data() };
            const subcategories = [];

            const q2 = query(categoriesRef, where("parent", "==", doc.id));
            const subcategorySnapshot = await getDocs(q2);
            subcategorySnapshot.forEach((doc) => {
                const subcategoryData = { id: doc.id, ...doc.data() };
                subcategories.push(subcategoryData);
            });

            catObj.push({
                name: data,
                subcategories: subcategories
            });
        }));

        setCategories(catObj);
    }

    return (
        <main className="mx-auto w-full px-4 md:px-8 bg-gray-50/50 min-h-screen mt-32 md:mt-[100px]">
            <section className="flex flex-col md:flex-row gap-8 py-8">
                
                {/* --- PROFESSIONAL SIDEBAR --- */}
                <aside className="w-full md:w-64 lg:w-80 shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-[120px]">
                        
                        {/* Parent Category Header */}
                        {parentCategory && (
                            <div className="bg-gray-900 p-4 text-white">
                                <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold mb-1">Department</p>
                                <h2 className="text-lg font-bold truncate">{parentCategory.displayName}</h2>
                            </div>
                        )}

                        <div className="p-2 space-y-1">
                            {categories && categories.map((category, index) => (
                                <Disclosure key={index} defaultOpen={category.subcategories.some(sub => sub.id === selectedCategory)}>
                                    {({ open }) => (
                                        <div className="mb-1">
                                            <div className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group cursor-pointer ${open ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                                                <h1 
                                                    className={`flex-1 text-sm font-semibold transition-colors ${open ? 'text-blue-700' : 'text-gray-700'}`}
                                                    onClick={() => navigate(`/category/${category.name.id}-aesc-${category.name.displayName}`)}
                                                >
                                                    {category.name.displayName}
                                                    <span className="ml-2 text-[10px] font-bold opacity-40 uppercase">({category.subcategories.length})</span>
                                                </h1>
                                                
                                                <Disclosure.Button className="p-1 rounded-md hover:bg-blue-100 transition-colors">
                                                    {open ? (
                                                        <ChevronUpIcon className="h-4 w-4 text-blue-600" />
                                                    ) : (
                                                        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </Disclosure.Button>
                                            </div>

                                            <Transition
                                                show={open}
                                                enter="transition duration-100 ease-out"
                                                enterFrom="transform scale-95 opacity-0"
                                                enterTo="transform scale-100 opacity-100"
                                                leave="transition duration-75 ease-out"
                                                leaveFrom="transform scale-100 opacity-100"
                                                leaveTo="transform scale-95 opacity-0"
                                            >
                                                <Disclosure.Panel static className="mt-1 ml-4 border-l-2 border-gray-100">
                                                    <ul className="py-1 space-y-1 pl-3">
                                                        {category.subcategories.map((subcategory, idx) => (
                                                            <li 
                                                                key={idx} 
                                                                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                                                    selectedCategory === subcategory.id 
                                                                    ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                                                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                                                }`} 
                                                                onClick={() => {
                                                                    navigate(`/category/${subcategory.id}-aesc-${subcategory.displayName}`);
                                                                    setSelectedCategory(subcategory.id);
                                                                }}
                                                            >
                                                                {subcategory.displayName}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </Disclosure.Panel>
                                            </Transition>
                                        </div>
                                    )}
                                </Disclosure>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* --- PRODUCT GRID --- */}
                <div className="flex-1">
                    {selectedCategory ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <ProductGrid selectedCategory={selectedCategory} />
                        </div>
                    ) : (
                        <div className="h-96 flex flex-col items-center justify-center text-gray-400">
                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                           <p className="text-sm font-medium">Fetching awesome products...</p>
                        </div>
                    )}
                </div>

            </section>
        </main>
    )
}

export default Sidebar