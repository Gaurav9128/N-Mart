import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "../firebase/FirebaseConfig";

function RelatedProducts({ category, currentProductId }) {
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const q = query(
          collection(firestore, "products"),
          where("category", "==", category)
        );
        const querySnapshot = await getDocs(q);

        const products = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== currentProductId) {
            products.push({ id: doc.id, ...doc.data() });
          }
        });

        setRelatedProducts(products);
      } catch (error) {
        console.error("Error fetching related products:", error);
      }
    };

    if (category) fetchRelated();
  }, [category, currentProductId]);

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-4">Related Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {relatedProducts.length > 0 ? (
          relatedProducts.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg shadow-md p-2 hover:scale-105 transition cursor-pointer"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-40 object-cover rounded-md"
              />
              <h3 className="mt-2 font-semibold text-sm">{item.title}</h3>
              <p className="text-gray-600 text-xs">₹{item.price}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No related products found.</p>
        )}
      </div>
    </div>
  );
}

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(firestore, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such product!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Product Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-96 object-cover rounded-lg shadow-md"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <p className="text-gray-700 text-lg mb-2">₹{product.price}</p>
          <p className="text-sm text-gray-500 mb-6">{product.brand}</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition">
            Add to Cart
          </button>
        </div>
      </div>

      {/* Description Section */}
      <div className="w-full px-2 py-16 sm:px-0">
        <h1 className="text-2xl underline mb-4">Description</h1>
        <p className="text-lg font-normal">{product.description}</p>
      </div>

      {/* Related Products Section */}
      <RelatedProducts category={product.category} currentProductId={id} />
    </div>
  );
}


export default Product
