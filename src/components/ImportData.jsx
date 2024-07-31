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
        const { productId, title, description, category, variationName, quantity, price, minQuantity, maxQuantity } = row;

        if (!productId || !variationName) {
          console.warn('Missing required fields in row:', row);
          continue;
        }

        const productDocRef = doc(firestore, 'products', productId);
        const productSnapshot = await getDoc(productDocRef);

        if (productSnapshot.exists()) {
          batch.update(productDocRef, { title, description, category });
        } else {
          batch.set(productDocRef, { title, description, category });
        }

        const variationDocRef = doc(productDocRef, 'variations', variationName);
        const variationSnapshot = await getDoc(variationDocRef);

        if (variationSnapshot.exists()) {
          batch.update(variationDocRef, { quantity, price });
        } else {
          batch.set(variationDocRef, { name: variationName, quantity, price });
        }

        const priceDocRef = doc(variationDocRef, 'prices', `${minQuantity}-${maxQuantity}`);
        const priceSnapshot = await getDoc(priceDocRef);

        if (priceSnapshot.exists()) {
          batch.update(priceDocRef, { minQuantity, maxQuantity, price });
        } else {
          batch.set(priceDocRef, { minQuantity, maxQuantity, price });
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
