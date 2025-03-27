import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore } from "./firebase/FirebaseConfig";

const PaymentStatus = () => {
  const location = useLocation();
  const [allData, setAllData] = useState(null);

  // ✅ Ensure `getQueryParams` function is defined before use
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
      const orderStatus = params.get('order_status');
      const transactionId = params.get('transaction_id');
      return { orderStatus, transactionId };
    }
    return { orderStatus: null, transactionId: null };
  };

  const updateOrderStatus = async (orderId, orderStatus, transactionId) => {
    try {
      const ordersRef = collection(firestore, 'orderDetails');
      const q = query(ordersRef, where('orderId', '==', orderId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("Order not found for Order ID:", orderId);
        return;
      }

      const orderDoc = querySnapshot.docs[0];
      const docRef = doc(firestore, 'orderDetails', orderDoc.id);

      await updateDoc(docRef, {
        paymentStatus: orderStatus?.orderStatus,
        transactionId: transactionId || "N/A"
      });

      console.log("Order updated with Transaction ID:", transactionId);
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  useEffect(() => {
    const updateData = () => {
      const queryParams = getQueryParams(location.search); // ✅ Now it will work
      console.log("queryParams ", queryParams);
      setAllData(queryParams);

      let OrderId;
      try {
        const storedOrderId = localStorage.getItem('orderid');
        OrderId = storedOrderId ? JSON.parse(storedOrderId) : null;
        console.log("OrderId:", OrderId);
      } catch (error) {
        console.error("Error parsing orderid:", error);
      }

      const { orderStatus, transactionId } = getOrderDetails(queryParams);
      console.log("OrderStatus:", orderStatus, "TransactionID:", transactionId);

      updateOrderStatus(OrderId, orderStatus, transactionId);
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
          {/* Render fetched data here */}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentStatus;
