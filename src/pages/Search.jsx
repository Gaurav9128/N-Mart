import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
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
      const searchTerm = searchItem.toLowerCase().trim();
      console.log('Search Term:', searchTerm);

      if (!searchTerm) {
        console.log('No valid search term provided');
        setProducts([]);
        return;
      }

      const querySnapshot = await getDocs(productsRef);
      const allProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const filteredProducts = allProducts.filter(product => {
        const lowerCaseTags = product.tags.map(tag => tag.toLowerCase());
        const lowerCaseTitle = product.title.toLowerCase();
        const lowerCaseDescription = product.description.toLowerCase();

        return (
          lowerCaseTags.includes(searchTerm) ||
          lowerCaseTitle.includes(searchTerm) ||
          lowerCaseDescription.includes(searchTerm)
        );
      });

      console.log("Filtered Products:", filteredProducts);
      setProducts(filteredProducts);
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
          {products.map((item) => (
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
          ))}
        </section>
      </div>
      <FooterComponent />
    </div>
  )
}

export default Search;
