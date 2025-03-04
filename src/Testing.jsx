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
        console.log("Raw Data:", data);

        console.log(data);

        const storedOrderDetails = localStorage.getItem("orderDetailsId");
        const orderDetailsTemp = storedOrderDetails ? JSON.parse(storedOrderDetails) : null;

        if (data && orderDetailsTemp) {
            const decodedData = decodeURIComponent(data);
            console.log("Decoded Data:", decodedData);

            const parsedData = Object.fromEntries(
                decodedData.split("&").map((pair) => {
                    const [key, value] = pair.split("=");
                    return [key, value || ""]; // Handle empty values
                })
            );

            console.log("Parsed Data:", parsedData);
            setPaymentData(parsedData);

            // 🔥 Step 1: Determine payment status
            let paymentStatus = "Pending"; // Default status
            if (parsedData.order_status === "Success") {
                paymentStatus = "Completed";
            } else if (parsedData.order_status === "Failure" || parsedData.order_status === "Aborted") {
                paymentStatus = "Failed";
            }

            // 🔥 Step 2: Get the correct Firestore document ID
            const orderId = orderDetailsTemp.id || orderDetailsTemp; // Adjust based on how it's stored

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

    return (
        <div>
            <h2>Payment Status: {paymentData?.order_status || "N/A"}</h2>
            <p>Transaction ID: {paymentData?.tracking_id || "N/A"}</p>
        </div>
    );
};

export default PaymentSuccess;