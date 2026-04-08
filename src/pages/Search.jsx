import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useSearchParams } from 'react-router-dom';
import { firestore } from '../firebase/FirebaseConfig';
import Item from '../components/Item';
import Navbar from '../components/Navbar';
import FooterComponent from '../components/FooterComponent';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'; // Icons for pagination

const Search = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  
  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10; // Ek page pe 10 products

  const searchItem = searchParams.get("searchItem") || "";

  const handleSearch = async () => {
    try {
      const searchTerm = searchItem.toLowerCase().trim();
      if (!searchTerm) {
        setProducts([]);
        return;
      }

      setLoading(true);
      setCurrentPage(1); // Nayi search par page 1 se start karein

      const productsRef = collection(firestore, 'products');

      // Prefix Search on titleLower
      const titleQuery = query(
        productsRef,
        where("titleLower", ">=", searchTerm),
        where("titleLower", "<=", searchTerm + "\uf8ff")
      );

      const snapshot = await getDocs(titleQuery);
      let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (results.length === 0) {
        const tagQuery = query(
          productsRef,
          where("tags", "array-contains", searchTerm)
        );
        const tagSnapshot = await getDocs(tagQuery);
        results = tagSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      setProducts(results);
    } catch (error) {
      console.error("Search Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      handleSearch();
    }, 400);
    return () => clearTimeout(delay);
  }, [searchItem]);

  // --- Pagination Logic ---
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Page badalne par upar scroll karein
  };

  return (
    <div className='min-h-screen flex flex-col justify-between bg-gray-50/30'>
      <Navbar />

      <div className='max-w-screen-2xl mx-auto w-full mt-32 md:mt-40 px-4 md:px-12 lg:px-24'>
        
        <div className='mb-10'>
          <h1 className='flex flex-col md:flex-row md:items-end gap-2 md:gap-4'>
            <span className='text-gray-900 font-black text-2xl md:text-4xl uppercase tracking-tighter'>
              Search Results
            </span>
            <span className='text-gray-400 font-bold text-xs md:text-sm uppercase tracking-widest mb-1'>
              Showing {products.length} results for "{searchItem}"
            </span>
          </h1>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
             <p className="animate-pulse text-blue-600 font-bold uppercase tracking-widest">Searching products...</p>
          </div>
        )}

        {!loading && products.length === 0 && searchItem && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No products found for your search.</p>
          </div>
        )}

        {/* Product Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
          {currentProducts.map((item) => (
            <Item
              key={item.id}
              title={item.title}
              image={item.image}
              brand={item.brand}
              id={item.id}
              // Item component ke according props pass karein
            />
          ))}
        </section>

        {/* --- PROFESSIONAL PAGINATION UI --- */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12 mb-20">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                  currentPage === number
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-110'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {number}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        )}

      </div>

      <FooterComponent />
    </div>
  );
};

export default Search;