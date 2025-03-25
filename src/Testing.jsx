import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore } from "./firebase/FirebaseConfig";

const PaymentStatus = () => {
  const location = useLocation();
  const [allData, setAllData] = useState(null);

  const getQueryParams = (queryString) => {
    const params = new URLSearchParams(queryString);
    const entries = {};
    for (const [key, value] of params) {
      entries[key] = decodeURIComponent(value || "N/A");
    }
    return entries;
  };

  const getOrderDetails = (queryParams) => {
    if (queryParams?.data) {
      const params = new URLSearchParams(queryParams.data);
      return { orderStatus: params.get('order_status') };
    }
    return { orderStatus: null };
  };

  const updateOrderStatus = async (orderId, orderStatus) => {
    try {
      if (!orderId) {
        console.error("Order ID is missing!");
        return;
      }

      const ordersRef = collection(firestore, 'orderDetails');
      const q = query(ordersRef, where('orderId', '==', orderId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("Order not found for Order ID:", orderId);
        return;
      }

      querySnapshot.forEach(async (orderDoc) => {
        const docRef = doc(firestore, 'orderDetails', orderDoc.id);
        await updateDoc(docRef, { paymentStatus: orderStatus });
      });

    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  useEffect(() => {
    const updateData = () => {
      const queryParams = getQueryParams(location.search);
      setAllData(queryParams);

      console.log("queryParams:", queryParams);

      const storedOrderId = localStorage.getItem('orderid');
      let OrderId = null;

      try {
        OrderId = storedOrderId ? JSON.parse(storedOrderId) : null;
        console.log("OrderId:", OrderId);
      } catch (error) {
        console.error("Error parsing orderid:", error);
      }

      const orderDetails = getOrderDetails(queryParams);
      console.log("orderStatus:", orderDetails.orderStatus);

      updateOrderStatus(OrderId, orderDetails.orderStatus);
    };

    updateData();
  }, []);

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
          {allData && Object.entries(allData).map(([key, value]) => (
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
