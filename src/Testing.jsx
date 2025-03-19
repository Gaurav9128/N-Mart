import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';


const PaymentStatus = () => {
  const location = useLocation();
const [allData,setAllData] = useState(null)
  // Function to parse query parameters
  const getQueryParams = (queryString) => {
    const params = new URLSearchParams(queryString);
    const entries = {};
    for (const [key, value] of params) {
      entries[key] = decodeURIComponent(value || "N/A"); // Decode & handle empty values
    }
    return entries;
    
  };

  function getOrderDetails(queryParams) {
    if (queryParams?.data) {
      const params = new URLSearchParams(queryParams.data);
      const orderStatus = params.get('order_status');
      return { orderId, orderStatus };
    }
    return { orderId: null, orderStatus: null };
  }
  const updateOrderStatus = async (orderId, orderStatus) => {
    try {

      const ordersRef = collection(firestore, 'orderDetails');
      const q = query(ordersRef, where('orderId', '==', orderId));
      console.log("q ",q)
      const querySnapshot = await getDocs(q);
      console.log("querySnapshot ",querySnapshot)
      if (querySnapshot.empty) {
        console.error("Order not found for Order ID:", orderId);
        return;
      }

      const orderDoc = querySnapshot.docs[0]; // Assuming orderId is unique
      const docRef = doc(firestore, 'orderDetails', orderDoc.id);

      await updateDoc(docRef, {
        paymentStatus: orderStatus
      });

    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  useEffect(()=>{
    const updateData = ()=>{
        const queryParams = getQueryParams(location.search);
        console.log("queryParams ",queryParams)
        setAllData(queryParams)
        try {
          const storedOrderId = localStorage.getItem('orderid');
          console.log("storedOrderId:", storedOrderId);
        
          // Parse if it's a valid JSON
          const OrderId = storedOrderId ? JSON.parse(storedOrderId) : null;
        
          console.log("OrderId:", OrderId);
        } catch (error) {
          console.error("Error parsing orderid:", error);
        }
        

        const orderStatus = getOrderDetails(queryParams);
        console.log("orderStatus ",orderStatus)
        updateOrderStatus(OrderId,orderStatus)
    }
    updateData()
  },[])
  // Extract query params from URL
 
  

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Payment Status</h2>
      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(allData).map(([key, value]) => (
            <tr key={key}>
              <td style={{ fontWeight: "bold" }}>{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentStatus;