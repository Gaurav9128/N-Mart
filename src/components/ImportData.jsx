import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { firestore } from '../firebase/FirebaseConfig';

const ImportData = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const requiredHeaders = [
    'productId',
    'title',
    'description',
    'category',
    'variationId',
    'variationName',
    'quantity',
    'price',
    'minQuantity',
    'maxQuantity',
    'priceId'
  ];

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
    setProgress(0);

    try {
      if (!file.type.includes('excel') && !file.type.includes('sheet')) {
        throw new Error('Invalid file type. Please upload an Excel file.');
      }

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const headers = Object.keys(jsonData[0]);
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

      if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
      }

      const totalRows = jsonData.length;
      let processedRows = 0;

      const batchSize = 500; // Batch size for Firestore
      let batch = writeBatch(firestore);
      let batchCount = 0;

      for (const row of jsonData) {
        processedRows++;
        batchCount++;

        setProgress(((processedRows / totalRows) * 100).toFixed(2));

        const {
          productId,
          title,
          description,
          category,
          variationId,
          variationName,
          quantity,
          price,
          minQuantity,
          maxQuantity,
          priceId
        } = row;

        for (const header of requiredHeaders) {
          if (!row[header]) {
            throw new Error(`Missing value for column: ${header} in row ${processedRows}`);
          }
        }

        const productDocRef = doc(firestore, 'products', productId);
        const productSnapshot = await getDoc(productDocRef);

        if (!productSnapshot.exists()) {
          throw new Error(`Product with ID ${productId} not found in the database.`);
        }

        const variationDocRef = doc(productDocRef, 'variations', variationId);
        const variationSnapshot = await getDoc(variationDocRef);

        if (!variationSnapshot.exists()) {
          throw new Error(`Variation with ID ${variationId} not found for product ${productId}.`);
        }

        const priceDocRef = doc(variationDocRef, 'prices', priceId);
        const priceSnapshot = await getDoc(priceDocRef);

        if (!priceSnapshot.exists()) {
          throw new Error(`Price with ID ${priceId} not found for variation ${variationId}.`);
        }

        batch.update(productDocRef, {
          title,
          description,
          category
        });

        batch.update(variationDocRef, {
          quantity,
          price
        });

        batch.update(priceDocRef, {
          minQuantity,
          maxQuantity,
          price
        });

        // Commit batch every `batchSize` records
        if (batchCount === batchSize) {
          await batch.commit();
          console.log(`Committed batch of ${batchSize} records`);
          batch = writeBatch(firestore); // Reset batch
          batchCount = 0; // Reset counter
        }
      }

      // Commit any remaining records in the final batch
      if (batchCount > 0) {
        await batch.commit();
        console.log(`Committed final batch of ${batchCount} records`);
      }

      alert('Data successfully imported and updated!');
      console.log('All rows processed successfully!');
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
      
      {loading && (
        <div className="mt-4">
          <p>Importing: {progress}% complete</p>
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default ImportData;
