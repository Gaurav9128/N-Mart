import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
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

  function getOrderDetails(queryParams) {
    if (queryParams?.data) {
      const params = new URLSearchParams(queryParams.data);
      const orderStatus = params.get("order_status");
      return { orderStatus };
    }
    return { orderStatus: null };
  }

  const updateOrderStatus = async (orderId, orderStatus) => {
    try {
      const ordersRef = collection(firestore, "orderDetails");
      const q = query(ordersRef, where("paymentStatus", "not-in", ["Aborted"]));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("Order not found for Order ID:", orderId);
        return;
      }

      const orderDoc = querySnapshot.docs[0];
      const docRef = doc(firestore, "orderDetails", orderDoc.id);

      await updateDoc(docRef, {
        paymentStatus: orderStatus?.orderStatus,
      });

      if (orderStatus?.orderStatus === "Success") {
        setTimeout(() => {
          window.open("https://www.n-mart.in/", "_self");
        }, 2000);
      } else if (orderStatus?.orderStatus === "Aborted") {
        setTimeout(() => {
          window.open("https://www.n-mart.in/", "_self");
        }, 1000);
      }

    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  useEffect(() => {
    const updateData = () => {
      const queryParams = getQueryParams(location.search);
      let OrderId;
      setAllData(queryParams);

      try {
        const storedOrderId = localStorage.getItem("orderid");
        OrderId = storedOrderId ? JSON.parse(storedOrderId) : null;
      } catch (error) {
        console.error("Error parsing orderid:", error);
      }

      const orderStatus = getOrderDetails(queryParams);
      updateOrderStatus(OrderId, orderStatus);
    };
    updateData();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>✅ Thank You So much!</h2>
      <p>Redirecting you to N-Mart homepage...</p>

      <table
        border="1"
        cellPadding="10"
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}
      >
        <thead>
          <tr>
            <th>Visit</th>
            <th>Again N-Mart</th>
          </tr>
        </thead>
      </table>
    </div>
  );
};

export default PaymentStatus;
