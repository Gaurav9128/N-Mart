import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const PaymentSuccess = () => {
    const location = useLocation();

    // Function to parse query parameters
    const getQueryParams = (queryString) => {
        const params = new URLSearchParams(queryString);
        const entries = {};
        for (const [key, value] of params) {
            entries[key] = decodeURIComponent(value || "N/A"); // Decode & handle empty values
        }
        return entries;
    };

    // Extract query params from URL
    const queryParams = getQueryParams(location.search);
    console.log("queryParams: ", queryParams);

    // Extract `data` parameter and parse it further
    const rawData = queryParams.data || ""; // Ensure `data` exists
    const extractedParams = getQueryParams(rawData); // Parse the nested query string
    console.log("Extracted Params: ", extractedParams);

    // Extract `order_id`
    const orderId = extractedParams.order_id || "N/A";
    console.log("Order ID: ", orderId);

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
                    {Object.entries(extractedParams).map(([key, value]) => (
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

export default PaymentSuccess;