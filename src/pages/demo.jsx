import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useSearchParams } from 'react-router-dom';
import { firestore } from '../firebase/FirebaseConfig';
import Item from '../components/Item';
import Navbar from '../components/Navbar';
import FooterComponent from '../components/FooterComponent';

const Search = () => {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const searchItem = searchParams.get("searchItem") || ""; // Handle null searchItem

  const handleSearch = async () => {
    try {
      const productsRef = collection(firestore, 'products');
      
      const searchTerms = searchItem.split(' ').filter(term => term.trim() !== '');
      console.log('Search Terms:', searchTerms);

      if (searchTerms.length === 0) {
        console.log('No valid search terms provided');
        setProducts([]);
        return;
      }
      let term = searchTerms[0];
      let finalResults = [];
  
        const q = query(productsRef, where('tags', 'array-contains', term));
        console.log("Executing Query:", q);
  
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          console.log(`No results found for term: ${term}`);
        } else {
          console.log(`Results found for term: ${term}`);
        }
        const results = [];
        querySnapshot.forEach((doc) => {
          results.push(doc.data());
        });
        finalResults = finalResults.concat(results);
      
  
      console.log("Final Results before deduplication:", finalResults);
  
      // const uniqueResults = [...new Set(finalResults.map(result => result.id))]
      //   .map(id => finalResults.find(result => result.id === id));
  
      // console.log("Unique Results after deduplication:", uniqueResults);
      setProducts(finalResults);
      console.log(products)
    } catch (error) {
      console.error('Error searching for products:', error);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchParams]);

  return (
    <div className='min-h-screen flex flex-col justify-between'>
      <Navbar />
      <div className='md:mx-12 lg:mx-24 mt-32 md:mt-[120px]'>
        <h1 className='ml-8 flex gap-4'>
          <p className='text-black font-medium text-sm md:text-3xl'>Search results</p>
          <span className='text-gray-400 font-normal text-sm md:text-lg flex items-end'>
            Showing {products.length} results for "{searchItem}"
          </span>
        </h1>
        <section className="w-full px-2 auto-cols-auto xl:pr-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-items-center justify-center gap-y-10 sm:gap-y-20 gap-x-4 mt-10 mb-5">
        {products.map((item) => {
  console.log(item); // Logging each item before rendering
  return (
    <Item
      key={item.id}
      title={item.title}
      image={item.image}
      brand={item.brand}
      description={item.description}
      price={item.price}
      discounted_price={item.discounted_price}
      id={item.id}
      variationId={item.variationId}
    />
  );
})}

        </section>
      </div>
      <FooterComponent />
    </div>
  )
}

export default Search;
