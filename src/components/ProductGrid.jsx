import React, { useEffect, useState, useMemo } from 'react';
import Item from './Item';
import { firestore } from '../firebase/FirebaseConfig';
import { getDocs, collection, query, where } from 'firebase/firestore';
import Loader from './Loader';
import { ChevronLeftIcon, ChevronRightIcon, ArrowsUpDownIcon } from '@heroicons/react/20/solid';

const ProductGrid = ({ selectedCategory }) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("default");
  const productsPerPage = 12;

  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);
    getAllProducts(selectedCategory);
  }, [selectedCategory]);

  const getAllSubcategories = async (categoryName) => {
    let subcategories = [categoryName];
    const fetchSubcategories = async (parent) => {
      if (parent != null) {
        const categoriesRef = collection(firestore, "categories");
        const q = query(categoriesRef, where("parent", "==", parent));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.docs.length > 0) {
          const promises = querySnapshot.docs.map(async (doc) => {
            subcategories.push(doc.id);
            await fetchSubcategories(doc.id);
          });
          await Promise.all(promises);
        }
      }
    };
    await fetchSubcategories(categoryName);
    return subcategories;
  };

  const getAllProducts = async (categoryName) => {
    let subcategories = await getAllSubcategories(categoryName);
    if (subcategories.length > 0) {
      const prodRef = collection(firestore, "products");
      const q = query(prodRef, where("category", "in", subcategories));
      const querySnapshot = await getDocs(q);
      
      // Har product ke liye uski minimum price fetch karna (Sorting ke liye zaroori hai)
      const productsWithPrices = await Promise.all(
        querySnapshot.docs.map(async (productDoc) => {
          const pData = { id: productDoc.id, ...productDoc.data() };
          
          // Variations se price nikalna
          const varRef = collection(firestore, "products", productDoc.id, "variations");
          const varSnap = await getDocs(varRef);
          
          let minPrice = Infinity;

          // Har variation ki prices check karna
          for (const vDoc of varSnap.docs) {
             const priceRef = collection(firestore, "products", productDoc.id, "variations", vDoc.id, "prices");
             const priceSnap = await getDocs(priceRef);
             priceSnap.forEach(p => {
                if (p.data().price < minPrice) minPrice = p.data().price;
             });
          }

          return { 
            ...pData, 
            calculatedPrice: minPrice === Infinity ? 0 : minPrice 
          };
        })
      );

      setProducts(productsWithPrices);
    } else {
      setProducts([]);
    }
    setLoading(false);
  }

  // --- Sorting Logic ---
  const sortedProducts = useMemo(() => {
    let result = [...products];
    if (sortOrder === "lowToHigh") {
      result.sort((a, b) => a.calculatedPrice - b.calculatedPrice);
    } else if (sortOrder === "highToLow") {
      result.sort((a, b) => b.calculatedPrice - a.calculatedPrice);
    }
    return result;
  }, [products, sortOrder]);

  // Pagination Logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const paginate = (num) => {
    setCurrentPage(num);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex-1 bg-gray-50/30 min-h-screen p-4 md:p-8">
      {/* Header & Sorting UI */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
            {selectedCategory || "All Products"}
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            {products.length} Products Found
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
          <ArrowsUpDownIcon className="h-4 w-4 text-gray-400" />
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="text-xs font-bold text-gray-600 outline-none bg-transparent cursor-pointer"
          >
            <option value="default">Default Sort</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><Loader /></div>
      ) : (
        <>
          <section className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentProducts.map((item) => (
              <Item 
                key={item.id} 
                title={item.title} 
                image={item.image} 
                brand={item.brand} 
                id={item.id} 
              />
            ))}
          </section>

          {/* Pagination UI */}
          {sortedProducts.length > productsPerPage && (
            <div className="mt-12 flex items-center justify-center gap-2 pb-10">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    currentPage === number ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'
                  }`}
                >
                  {number}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center text-gray-400 mt-20 italic">No products found.</div>
          )}
        </>
      )}
    </div>
  );
}

export default ProductGrid;