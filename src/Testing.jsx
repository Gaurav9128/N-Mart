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

    if (data) {
        const decodedData = decodeURIComponent(data);
        console.log("Decoded Data:", decodedData);

        const parsedData = Object.fromEntries(
            decodedData.split("&").map((pair) => {
                let [key, value] = pair.split("=");
                value = value === "null" || !value ? "" : decodeURIComponent(value); // Ensure value is a string
                return [key, value];
            })
        );

        console.log("Parsed Data:", parsedData);

        // Update state with parsed data
        setPaymentData(parsedData);

        // Update payment type separately
        if (parsedData.payment_type) {
            console.log("Payment Type:", parsedData.payment_type);
            setPaymentType(parsedData.payment_type); // Ensure you have a state setter for this
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
