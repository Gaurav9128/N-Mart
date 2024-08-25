import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase/FirebaseConfig';

const ExportData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const productsCollection = collection(firestore, 'products');
      const productsSnapshot = await getDocs(productsCollection);

      if (productsSnapshot.empty) {
        throw new Error('No products found in the database.');
      }

      const data = [];

      // Fetching data concurrently
      const productPromises = productsSnapshot.docs.map(async (productDoc) => {
        const productData = productDoc.data();
        const variationsCollection = collection(productDoc.ref, 'variations');
        const variationsSnapshot = await getDocs(variationsCollection);

        const variationPromises = variationsSnapshot.docs.map(async (variationDoc) => {
          const variationData = variationDoc.data();
          const pricesCollection = collection(variationDoc.ref, 'prices');
          const pricesSnapshot = await getDocs(pricesCollection);

          const pricePromises = pricesSnapshot.docs.map(async (priceDoc) => {
            const priceData = priceDoc.data();
            data.push({
              productId: productDoc.id,
              title: productData.title,
              description: productData.description,
              category: productData.category,
              variationId: variationDoc.id, // Corrected this line to use variationDoc.id
              quantity: variationData.quantity,
              price: priceData.price,
              minQuantity: priceData.minQuantity,
              maxQuantity: priceData.maxQuantity,
              priceId: priceDoc.id
            });
          });

          await Promise.all(pricePromises);
        });

        await Promise.all(variationPromises);
      });

      await Promise.all(productPromises);

      if (data.length === 0) {
        throw new Error('No data found.');
      }

      // Create a new workbook and add the data
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

      // Generate buffer and download
      const wbout = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exported_data.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(`Error exporting data: ${error.message}`);
      console.error('Error exporting data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold">Export Data</h3>
      <button
        onClick={handleExport}
        className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Exporting...' : 'Export Data'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default ExportData;
