import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { firestore } from "./firebase/FirebaseConfig";

const PaymentStatus = () => {
  const location = useLocation();
  const [allData, setAllData] = useState(null);
  const [whatsappURL, setWhatsappURL] = useState(null);

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
        const orderData = orderDoc.data();
        const customerName = orderData.customerName || "Customer";
        const phone = orderData.phone || "N/A";
        const items = orderData.items
          ? orderData.items.map(item => `${item.name} x${item.quantity}`).join(", ")
          : "Items not listed";
        const total = orderData.totalAmount || "N/A";

        const adminNumber = "9119129138";
        const message = `🛒 *New Order!*
👤 Name: ${customerName}
📱 Phone: ${phone}
📦 Items: ${items}
💰 Total: ₹${total}`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${adminNumber}?text=${encodedMessage}`;

        // ✅ Store WhatsApp URL to trigger on button click
        setWhatsappURL(whatsappURL);

        // Redirect after 4 seconds (enough time for user to click button)
        setTimeout(() => {
          window.open("https://www.n-mart.in/", "_self");
        }, 4000);
      } else if (orderStatus?.orderStatus === "Aborted") {
        setTimeout(() => {
          window.open("https://www.n-mart.in/", "_self");
        }, 2000);
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

  const handleWhatsAppClick = () => {
    if (whatsappURL) {
      window.open(whatsappURL, "_blank");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>✅ Thank You So much!</h2>
      <p>Redirecting you to N-Mart homepage...</p>
      
      {whatsappURL && (
        <button
          onClick={handleWhatsAppClick}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            marginTop: "20px",
            backgroundColor: "#25D366",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          📱 Click to Send Order on WhatsApp
        </button>
      )}

      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Visit</th>
            <th>again n-mart</th>
          </tr>
        </thead>
      </table>
    </div>
  );
};

export default PaymentStatus;
