import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "./firebase/FirebaseConfig"; // Ensure correct path

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentData, setPaymentData] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState("Pending");

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
                    value = value === "null" || value === undefined ? "" : decodeURIComponent(value);
                    return [key, value];
                })
            );

            console.log("Parsed Data:", parsedData);
            setPaymentData(parsedData);

            // ✅ Ensure `order_status` exists & is a string
            const orderStatus = parsedData?.order_status ? String(parsedData.order_status) : "Pending";

            // 🔥 Determine payment status
            let newPaymentStatus = "Pending";
            if (orderStatus.includes("Success")) {
                newPaymentStatus = "Completed";
            } else if (orderStatus.includes("Failure") || orderStatus.includes("Aborted")) {
                newPaymentStatus = "Failed";
            }

            setPaymentStatus(newPaymentStatus);

            // ✅ Firestore document update
            const orderId = orderDetailsTemp.id || orderDetailsTemp;
            if (orderId) {
                const orderRef = doc(firestore, "orderDetails", orderId);

                updateDoc(orderRef, {
                    paymentStatus: newPaymentStatus,
                    transactionId: parsedData.tracking_id || "",
                })
                    .then(() => console.log("Payment status updated successfully!"))
                    .catch((error) => console.error("Error updating payment status:", error));
            } else {
                console.error("Order ID not found in localStorage.");
            }
        }
    }, [location]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md text-center">
                <h2 className="text-xl font-bold">Payment Status</h2>
                <p
                    className={`mt-3 font-semibold text-lg ${
                        paymentStatus === "Completed" ? "text-green-600" :
                        paymentStatus === "Failed" ? "text-red-600" :
                        "text-yellow-600"
                    }`}
                >
                    {paymentStatus}
                </p>
                <p className="mt-2 text-gray-600">Transaction ID: <span className="font-mono">{paymentData?.tracking_id || "N/A"}</span></p>

                <button
                    onClick={() => navigate("/")}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccess;
