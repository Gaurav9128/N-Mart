import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { firestore } from "./firebase/FirebaseConfig";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { CheckCircleIcon, XCircleIcon, LoaderIcon } from "lucide-react";

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [statusMessage, setStatusMessage] = useState("Processing Payment...");
    const [statusType, setStatusType] = useState("loading"); // 'loading', 'success', 'error'
    // Function to parse query parameters
    const getQueryParams = (queryString) => {
      const params = new URLSearchParams(queryString);
      const entries = {};
      for (const [key, value] of params) {
          entries[key] = decodeURIComponent(value || "N/A"); // Decode & handle empty values
      }
      return entries;
  };

    useEffect(() => {

        const updatePaymentStatus = async () => {
            const queryParams = getQueryParams(location.search);
            const status = queryParams.get("status");
            const transactionID = queryParams.get("txnId");

            console.log("queryParams",queryParams);
            console.log("status",status);
            console.log("transactionID",transactionID);

            if (status === "CHARGED" && transactionID) {
                try {
                    const orderQuery = query(
                        collection(firestore, "orderDetails"),
                        where("transactionId", "==", transactionID)
                    );
                    const orderSnapshot = await getDocs(orderQuery);

                    if (!orderSnapshot.empty) {
                        const orderDoc = orderSnapshot.docs[0];
                        const orderRef = orderDoc.ref;

                        await updateDoc(orderRef, { paymentStatus: "Paid" });

                        setStatusMessage("Payment Successful! Your order has been confirmed.");
                        setStatusType("success");
                    } else {
                        setStatusMessage("Order not found. Please contact support.");
                        setStatusType("error");
                    }
                } catch (error) {
                    console.error("Error updating payment status:", error);
                    setStatusMessage("An error occurred while processing your payment.");
                    setStatusType("error");
                }
            } else {
                setStatusMessage("Payment Failed! Please try again.");
                setStatusType("error");
            }

            // Redirect after 3 seconds
            //setTimeout(() => navigate("/orders"), 3000);
        };

        updatePaymentStatus();
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
            {statusType === "loading" && (
                <LoaderIcon className="animate-spin w-12 h-12 text-blue-500 mb-4" />
            )}
            {statusType === "success" && (
                <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
            )}
            {statusType === "error" && (
                <XCircleIcon className="w-16 h-16 text-red-500 mb-4" />
            )}
            <h1 className="text-xl font-semibold">{statusMessage}</h1>
            <p className="text-gray-600 mt-2">Redirecting you to orders...</p>
        </div>
    );
};

export default PaymentSuccess;
