import React, { useEffect } from 'react'
import { Fragment, useState } from 'react'
import { Dialog, Disclosure, Menu, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon, FunnelIcon, MinusIcon, PlusIcon, Squares2X2Icon } from '@heroicons/react/20/solid'
import classNames from "classnames";
import ProductGrid from "./ProductGrid"
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { firestore } from '../firebase/FirebaseConfig'

const Sidebar = () => {

    const { category } = useParams();
    const categoryid = category.split("-aesc-")[0];
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState();
    const [parentCategory, setParentCategory] = useState();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(useLocation().search);
    const subcategoryName = searchParams.get("subcategoryName") || "" ;

    

    useEffect(() => {
      console.log(category)
      getCategories();
      

    },[category]);

    const getCategories = async() => {
      setSelectedCategory(categoryid)
      let rootCategory = {
        displayName : "",
        parent : ""
      };
      let catId = categoryid
      do{
        const categoryDoc = doc(firestore, "categories", catId);
        const docSnap = await getDoc(categoryDoc);
        if (docSnap.exists()) {
          rootCategory = {id:docSnap.id,...docSnap.data()};
          catId = rootCategory.parent;
        }else {break}
      }while(catId !=null );
      setParentCategory(rootCategory)
      let catObj = [];

      const categoriesRef = collection(firestore, "categories");
      const q = query(categoriesRef, where("parent", "==", rootCategory.id));
      const querySnapshot = await getDocs(q);
      

// Use Promise.all to execute async operations concurrently
    await Promise.all(querySnapshot.docs.map(async (doc) => {
        const data = {id:doc.id,...doc.data()};
        const subcategories = [];

        const q2 = query(categoriesRef, where("parent", "==", doc.id));
        const subcategorySnapshot = await getDocs(q2);
        subcategorySnapshot.forEach((doc) => {
            const subcategoryData = {id:doc.id,...doc.data()};
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
        <main className="mx-auto w-full md:pr-4 sm:pr-6 flex flex-col flex-grow mt-32 md:mt-[120px]">

          <section aria-labelledby="products-heading" className="flex-grow flex justify-center items-center">

            <div className="md:flex gap-x-4 gap-y-10 flex-grow ">
              {/* Filters */}
              <div className="hidden md:block md:w-52 lg:w-72 border">
                {parentCategory && <h3 className='border-b border-gray-200 py-2 px-4' onClick={() => {setSelectedCategory(categoryid)}}>{parentCategory.displayName}</h3>}
                
                <div className='flex flex-col'>
                {categories && categories.map((category,index) => (
                  <Disclosure key={index} defaultOpen={category.subcategories.some(subcategory => subcategory.id === selectedCategory)}>
                  {({open}) =>(
                    <>
                  <div className=' flex justify-between border-b border-gray-200 px-4 py-2'>
                      <h1 className='cursor-pointer' onClick={() => {navigate(`/category/${category.name.id}-aesc-${category.name.displayName}`)}}>{category.name.displayName} <span>({category.subcategories.length})</span></h1>
                      <Disclosure.Button className="text-lg text-blue-600">
                        {open ? "-" : "+"}
                      </Disclosure.Button>
                    </div>
                    
                    <Disclosure.Panel className="text-gray-500">
                    <ul className='flex flex-col gap-2 bg-gray-200'>
                      {category.subcategories.map((subcategory,idx) => (
                        <li key={idx} className={`${selectedCategory === subcategory.id ? "bg-blue-200" : ""} pl-6 py-2 cursor-pointer text-sm font-normal text-gray-800`} onClick={() => {
                          navigate(`/category/${subcategory.id}-aesc-${subcategory.displayName}`)
                          setSelectedCategory(subcategory.id)}}>{subcategory.displayName}</li>
                      ))}
                      </ul>
                    </Disclosure.Panel>
                    </>
                    )}
                  </Disclosure>
                ))}
                </div>
              </div>

              {/* Product grid */}
              {selectedCategory && <ProductGrid selectedCategory={selectedCategory} />}
              <div className="lg:col-span-2">{/* Your content */}</div>
            </div>
          </section>
        </main>
      
    
  )
}

export default Sidebar
