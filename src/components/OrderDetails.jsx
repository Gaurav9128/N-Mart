import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/FirebaseConfig';
import * as XLSX from 'xlsx';

const OrderDetails = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState({});

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchUserDetails = async (userId) => {
    if (users[userId]) return users[userId]; // Return cached user details if available

    const userDoc = await getDoc(doc(firestore, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const userDetails = {
        fullName: `${userData.firstName} ${userData.lastName}`,
        address: `${userData.companyAddress.area} ${userData.companyAddress.city} ${userData.companyAddress.postalcode} ${userData.companyAddress.state}` // Assuming address is stored in Firestore
      };
      setUsers(prevUsers => ({ ...prevUsers, [userId]: userDetails }));
      return userDetails;
    } else {
      console.error("No such user!");
      return null;
    }
  };

  const fetchOrderDetails = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'orderDetails'));
      const ordersArray = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const orderData = doc.data();
        const userDetails = await fetchUserDetails(orderData.userId);
        return {
          ...orderData,
          id: doc.id,
          userName: userDetails ? userDetails.fullName : 'Unknown',
          userAddress: userDetails ? userDetails.address : 'No address available',
        };
      }));
      setOrders(ordersArray);
    } catch (err) {
      console.error("Error fetching order details:", err);
    }
  };

  const downloadExcel = () => {
    const formatOrderItems = (items) => {
      return items.map(item => 
        `Title: ${item.title}\nQuantity: ${item.quantity}\nPrice: ${item.pricePerPiece ? item.pricePerPiece.toFixed(2) : 'N/A'}`
      ).join('\n\n'); // Separate each item with a blank line
    };
  
    const ws = XLSX.utils.json_to_sheet(orders.map(order => ({
      UserName: order.userName,
      UserAddress: order.userAddress,
      OrderDate: order.orderDate.toDate().toLocaleString(),
      Items: formatOrderItems(order.orderListItems),
      CartTotal: order.cartTotal ? order.cartTotal.toFixed(2) : 'N/A',
      CouponStatus: order.couponStatus,
    })));
  
    // Apply cell styles (optional) for better readability
    ws['!cols'] = [
      { wpx: 120 }, // Set column widths for better display
      { wpx: 150 },
      { wpx: 150 },
      { wpx: 200 }, // Adjust width for items
      { wpx: 100 },
      { wpx: 120 }
    ];
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, "OrderDetails.xlsx");
  };
  

  return (
    <div className="p-4">
      <div className="mb-4">
        <button
          onClick={downloadExcel}
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
        >
          Download as Excel
        </button>
      </div>
      <h2 className="font-semibold text-2xl text-gray-800 mb-4">Order Details</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600">User Name</th>
              <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600">User Address</th>
              <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600">Order Date</th>
              <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600">Items</th>
              <th className="py-2 px-4 border-b border-gray-200 text-sm font-semibold text-gray-600">Cart Total</th>
              <th className="py-2 px-4 border-b border-gray-200 text-sm font-semibold text-gray-600">Coupon Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b border-gray-200 text-sm">{order.userName}</td>
                  <td className="py-2 px-4 border-b border-gray-200 text-sm">{order.userAddress}</td>
                  <td className="py-2 px-4 border-b border-gray-200 text-sm">{order.orderDate.toDate().toLocaleString()}</td>
                  <td className="py-2 px-4 border-b border-gray-200 text-sm">
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-1 px-2 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600">Title</th>
                          <th className="py-1 px-2 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600">Quantity</th>
                          <th className="py-1 px-2 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600">Price per Piece</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.orderListItems.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-100">
                            <td className="py-1 px-2 border-b border-gray-200 text-xs">{item.title}</td>
                            <td className="py-1 px-2 border-b border-gray-200 text-xs">{item.quantity} pcs</td>
                            <td className="py-1 px-2 border-b border-gray-200 text-xs">{item.pricePerPiece ? item.pricePerPiece.toFixed(2) : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200 text-sm">{order.cartTotal ? order.cartTotal.toFixed(2) : 'N/A'}</td>
                  <td className="py-2 px-4 border-b border-gray-200 text-sm">{order.couponStatus}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-4 px-4 text-center text-sm text-gray-500">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderDetails;
