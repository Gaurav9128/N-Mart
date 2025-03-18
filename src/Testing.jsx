import React from "react";
import { useLocation } from "react-router-dom";

const PaymentStatus = () => {
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

  function getOrderId(queryParams) {
    if (queryParams?.data) {
      const params = new URLSearchParams(queryParams.data);
      return params.get('order_id');
    }
    return null;
  }
  // Extract query params from URL
  const queryParams = getQueryParams(location.search);
  const orderId = getOrderId(queryParams)
  console.log("orderId",orderId);
  

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
          {Object.entries(queryParams).map(([key, value]) => (
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

export default PaymentStatus;