import React, { useState, useEffect } from 'react';
import { firestore } from "../firebase/FirebaseConfig"; 
import { collection, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Real-time listener for all products
    const unsubscribe = onSnapshot(collection(firestore, "products"), async (snapshot) => {
      // 1. Pehle basic product data set kar dete hain (Fast UI)
      const initialData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        displayPrice: "..." // Placeholder while fetching
      }));
      setProducts(initialData);
      setLoading(false);

      // 2. Parallel background price fetching from variations sub-collection
      const pricePromises = snapshot.docs.map(async (productDoc) => {
        const variationsRef = collection(firestore, "products", productDoc.id, "variations");
        const variationsSnap = await getDocs(variationsRef);
        
        let price = "N/A";
        if (!variationsSnap.empty) {
          price = variationsSnap.docs[0].data().price;
        }
        return { id: productDoc.id, price };
      });

      const allPrices = await Promise.all(pricePromises);

      // 3. Update products state with actual prices
      setProducts(prevProducts => 
        prevProducts.map(p => {
          const found = allPrices.find(item => item.id === p.id);
          return found ? { ...p, displayPrice: found.price } : p;
        })
      );
    });

    return () => unsubscribe();
  }, []);

  const handleToggleStatus = async (productId, currentStatus) => {
    const productRef = doc(firestore, "products", productId);
    try {
      await updateDoc(productRef, {
        isAvailable: !currentStatus
      });
      // State will auto-update because of onSnapshot
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  const getValidImageUrl = (url) => {
    if (!url || typeof url !== 'string' || url.startsWith('blob:')) {
      return `https://api.dicebear.com/7.x/initials/svg?seed=NMart&backgroundColor=F87171`; 
    }
    return url;
  };

  // Pure data par search filter
  const filteredProducts = products.filter(product => 
    (product.title || product.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center p-10 font-semibold text-gray-600">Loading All Products...</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">N-Mart Inventory</h2>
          <p className="text-sm text-gray-500 font-medium">Total: {products.length} Products</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </span>
          <input 
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm shadow-sm transition-all"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-200">
        <table className="min-w-full table-auto text-left">
          <thead className="bg-gray-50 text-gray-600 font-bold text-xs uppercase border-b">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Details</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <img 
                      src={getValidImageUrl(product.image)} 
                      alt="" 
                      className="w-14 h-14 object-cover rounded-lg border border-gray-100 shadow-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-800 leading-tight mb-1">{product.title || product.name}</div>
                    <div className="text-sm text-green-600 font-extrabold tracking-wide">
                      {product.displayPrice === "..." ? (
                        <span className="text-gray-400 animate-pulse">Loading Price...</span>
                      ) : (
                        `₹${product.displayPrice}`
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      product.isAvailable 
                      ? "bg-green-100 text-green-700 border-green-200" 
                      : "bg-red-100 text-red-700 border-red-200"
                    }`}>
                      {product.isAvailable ? "Live" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(product.id, product.isAvailable)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all active:scale-95 ${
                        product.isAvailable ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {product.isAvailable ? "Stop Selling" : "Go Live"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-20">
                  <div className="text-gray-400 font-medium">No products found for "{searchTerm}"</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;