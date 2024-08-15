import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { collection, doc, getDoc, writeBatch } from 'firebase/firestore';
import { firestore } from '../firebase/FirebaseConfig';

const ImportData = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file.');
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      if (!file.type.includes('excel') && !file.type.includes('sheet')) {
        throw new Error('Invalid file type. Please upload an Excel file.');
      }
  
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error('No data found in the file.');
      }
  
      const batch = writeBatch(firestore);
  
      for (const row of jsonData) {
        const { productId, title, description, category, variationId, quantity, price, minQuantity, maxQuantity } = row;
  
        if (!productId || !variationId) {
          console.warn('Missing required fields in row:', row);
          continue;
        }
  
        const productDocRef = doc(firestore, 'products', productId);
        const variationDocRef = doc(productDocRef, 'variations', variationId);
        const priceDocRef = doc(variationDocRef, 'prices', `${minQuantity}-${maxQuantity}`);
  
        const productSnapshot = await getDoc(productDocRef);
        const variationSnapshot = await getDoc(variationDocRef);
        const priceSnapshot = await getDoc(priceDocRef);
  
        if (productSnapshot.exists()) {
          // Update product details if they exist
          batch.update(productDocRef, { title, description, category });
        } else {
          console.warn(`Product ID ${productId} not found in the database.`);
          continue;
        }
  
        if (variationSnapshot.exists()) {
          // Update variation details if they exist
          batch.update(variationDocRef, { quantity, price });
        } else {
          console.warn(`Variation ID ${variationId} not found in the database.`);
          continue;
        }
  
        if (priceSnapshot.exists()) {
          // Update price details if they exist
          batch.update(priceDocRef, { minQuantity, maxQuantity, price });
        } else {
          console.warn(`Price range ${minQuantity}-${maxQuantity} not found for Variation ID ${variationId}.`);
          continue;
        }
      }
  
      await batch.commit();
      alert('Data imported successfully!');
    } catch (error) {
      setError(`Error importing data: ${error.message}`);
      console.error('Error importing data:', error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div>
      <h3 className="text-xl font-semibold">Import Data</h3>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        className="mt-4"
      />
      <button
        onClick={handleImport}
        className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Importing...' : 'Import Data'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default ImportData;
