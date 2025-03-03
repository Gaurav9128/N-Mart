import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "./firebase/FirebaseConfig"; // Adjust the import based on your project setup

const PaymentSuccess = () => {
    const location = useLocation();
    const [paymentData, setPaymentData] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const data = params.get("data");
        const storedOrderDetails = localStorage.getItem('orderDetailsId');
        const orderDetailsTemp = storedOrderDetails ? JSON.parse(storedOrderDetails) : null;

        if (data && orderDetailsTemp?.id) {
            const decodedData = decodeURIComponent(data);
            const parsedData = Object.fromEntries(
                decodedData.split("&").map((pair) => {
                    const [key, value] = pair.split("=");
                    return [key, value || ""];
                })
            );

            setPaymentData(parsedData);

            // 🔥 Step 1: Determine payment status
            let paymentStatus = "Pending"; // Default status
            if (parsedData.order_status === "Success") {
                paymentStatus = "Completed";
            } else if (parsedData.order_status === "Failure" || parsedData.order_status === "Aborted") {
                paymentStatus = "Failed";
            }

            // 🔥 Step 2: Update Firestore
            const orderRef = doc(firestore, "orderDetails", orderDetailsTemp.id);
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
        }
    }, [location]);

    return (
        <div>
            <h2>Payment Status: {paymentData?.order_status}</h2>
            <p>Transaction ID: {paymentData?.tracking_id || "N/A"}</p>
        </div>
    );
};

export default PaymentSuccess;