import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';
import { firestore } from '../firebase/FirebaseConfig';
import * as XLSX from 'xlsx';

const OrderDetails = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [users, setUsers] = useState({});
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  useEffect(() => {
    if (filterDate) {
      const filtered = orders.filter(order =>
        order.orderDate.toDate().toISOString().split('T')[0] === filterDate
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [filterDate, orders]);

  const fetchUserDetails = async (userId) => {
    if (users[userId]) return users[userId];
    const userDoc = await getDoc(doc(firestore, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const userDetails = {
        fullName: `${userData.firstName} ${userData.lastName}`,
        address: `${userData.companyAddress.area} ${userData.companyAddress.city} ${userData.companyAddress.postalcode} ${userData.companyAddress.state}`
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
      const ordersRef = collection(firestore, 'orderDetails');
      const q = query(ordersRef, where("paymentStatus", "not-in", ["Pending", "Aborted"])); // Exclude "Aborted" & "Pending"
      const querySnapshot = await getDocs(q);

      const ordersArray = await Promise.all(querySnapshot.docs.map(async (doc, index) => {
        const orderData = doc.data();
        if (orderData.status === 'delivered') return null;
        const userDetails = await fetchUserDetails(orderData.userId);
        return {
          ...orderData,
          id: doc.id,
          srNo: index + 1,
          userName: userDetails ? userDetails.fullName : 'Unknown',
          userAddress: userDetails ? userDetails.address : 'No address available',
        };
      }));
      setOrders(ordersArray.filter(order => order !== null));
    } catch (err) {
      console.error("Error fetching order details:", err);
    }
  };

  const handleDeliveredChange = async (orderId) => {
    try {
      const orderRef = doc(firestore, 'orderDetails', orderId);
      await updateDoc(orderRef, {
        status: 'delivered',
      });
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-4 py-2 border rounded mr-4"
        />
      </div>
      <h2 className="font-semibold text-2xl text-gray-800 mb-4">Order Details</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Sr No.</th>
              <th className="border border-gray-300 px-4 py-2">User Name</th>
              <th className="border border-gray-300 px-4 py-2">User Address</th>
              <th className="border border-gray-300 px-4 py-2">Order Date</th>
              <th className="border border-gray-300 px-4 py-2">Items</th>
              <th className="border border-gray-300 px-4 py-2">Cart Total</th>
              <th className="border border-gray-300 px-4 py-2">Coupon Status</th>
              <th className="border border-gray-300 px-4 py-2">Transaction ID</th>
              <th className="border border-gray-300 px-4 py-2">Delivered</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <tr key={order.id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.userName}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.userAddress}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.orderDate.toDate().toLocaleString()}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {order.orderListItems.map((item, idx) => (
                      <div key={idx} className="flex gap-4 py-2 border-b border-gray-200">
                        <span><strong>Title:</strong> {item.title}</span>
                        <span><strong>Variant:</strong> {item.variantName}</span>
                        <span><strong>Quantity:</strong> {item.quantity} pcs</span>
                        <span><strong>Price per Piece:</strong> {Number(item.pricePerPiece) ? Number(item.pricePerPiece).toFixed(2) : 'N/A'}</span>
                      </div>
                    ))}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{order.cartTotal ? order.cartTotal.toFixed(2) : 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.couponStatus}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {order.transactionId && order.transactionId !== "N/A" ? order.transactionId : 'No Transaction ID'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="checkbox"
                      checked={order.status === 'delivered'}
                      onChange={() => handleDeliveredChange(order.id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="9" className="border border-gray-300 px-4 py-2 text-center">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderDetails;
