import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "./firebase/FirebaseConfig"; // Ensure the correct import

const PaymentSuccess = () => {
    const location = useLocation();
    const [paymentData, setPaymentData] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const data = params.get("data");
    
        const storedOrderDetails = localStorage.getItem("orderDetailsId");
        const orderDetailsTemp = storedOrderDetails ? JSON.parse(storedOrderDetails) : null;
    
        if (data && orderDetailsTemp) {
            const decodedData = decodeURIComponent(data);
            console.log("Decoded Data:", decodedData);
    
            const parsedData = Object.fromEntries(
                decodedData.split("&").map((pair) => {
                    let [key, value] = pair.split("=");
                    value = value === "null" || value === undefined ? null : decodeURIComponent(value); // Convert "null" strings to actual null
                    return [key, value];
                })
            );
    
            console.log("Parsed Data:", parsedData);
            setPaymentData(parsedData);
    
            // 🔥 Determine payment status
            let paymentStatus = "Pending"; // Default status
            if (parsedData.order_status === "Success") {
                paymentStatus = "Completed";
            } else if (parsedData.order_status === "Failure" || parsedData.order_status === "Aborted") {
                paymentStatus = "Failed";
            }
    
            // 🔥 Get Firestore document ID
            const orderId = orderDetailsTemp.id || orderDetailsTemp;
    
            if (orderId) {
                const orderRef = doc(firestore, "orderDetails", orderId);
    
                updateDoc(orderRef, {
                    paymentStatus,
                    transactionId: parsedData.tracking_id || null,
                })
                .then(() => {
                    console.log("Payment status updated successfully!");
                })
                .catch((error) => {
                    console.error("Error updating payment status:", error);
                });
            } else {
                console.error("Order ID not found in localStorage.");
            }
        }
    }, [location]);

    console.log(paymentData);
    return (
        <div>
            <h2>Payment Status: {paymentData?.order_status || "N/A"}</h2>
            <p>Transaction ID: {paymentData?.tracking_id || "N/A"}</p>
        </div>
    );
};

export default PaymentSuccess;