import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';
import { firestore } from '../firebase/FirebaseConfig';
import { Calendar, Package, User, MapPin, CheckCircle2, Clock } from 'lucide-react'; // Icons ke liye

const OrderDetails = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [users, setUsers] = useState({});
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);

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
        fullName: `${userData.firstName || ''} ${userData.lastName || ''}`,
        address: `${userData.companyAddress?.area || ''}, ${userData.companyAddress?.city || ''}, ${userData.companyAddress?.state || ''}`
      };
      setUsers(prevUsers => ({ ...prevUsers, [userId]: userDetails }));
      return userDetails;
    }
    return null;
  };

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const ordersRef = collection(firestore, 'orderDetails');
      const q = query(ordersRef, where("paymentStatus", "not-in", ["Pending", "Aborted", "Failure"]));
      const querySnapshot = await getDocs(q);

      const ordersArray = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
        const orderData = docSnap.data();
        if (orderData.status === 'delivered') return null;
        const userDetails = await fetchUserDetails(orderData.userId);
        return {
          ...orderData,
          id: docSnap.id,
          userName: userDetails ? userDetails.fullName : 'Unknown Guest',
          userAddress: userDetails ? userDetails.address : 'No address provided',
        };
      }));
      setOrders(ordersArray.filter(order => order !== null));
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveredChange = async (orderId) => {
    if(!window.confirm("Mark this order as delivered?")) return;
    try {
      const orderRef = doc(firestore, 'orderDetails', orderId);
      await updateDoc(orderRef, { status: 'delivered' });
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500 mt-1">Manage and track your incoming store orders</p>
        </div>
        
        <div className="flex items-center bg-white p-2 rounded-xl shadow-sm border border-gray-200">
          <Calendar className="text-blue-500 ml-2" size={20} />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border-none focus:ring-0 text-gray-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                   <td colSpan="4" className="text-center py-20 text-gray-400">Loading orders...</td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* User Info */}
                    <td className="px-6 py-6 align-top">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{order.userName}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <MapPin size={12} />
                            <span className="truncate max-w-[200px]">{order.userAddress}</span>
                          </div>
                          <p className="mt-2 text-[11px] text-gray-400 flex items-center gap-1">
                            <Clock size={12} /> {order.orderDate.toDate().toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Order Items */}
                    <td className="px-6 py-6 align-top">
                      <div className="space-y-3">
                        {order.orderListItems.map((item, idx) => (
                          <div key={idx} className="flex flex-col border-l-2 border-blue-200 pl-3">
                            <span className="text-sm font-medium text-gray-800">{item.title}</span>
                            <span className="text-xs text-gray-500">
                              Qty: {item.quantity} | {item.variantName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Price & Status */}
                    <td className="px-6 py-6 align-top">
                      <p className="text-lg font-bold text-gray-900">₹{order.cartTotal?.toFixed(2)}</p>
                      <div className="mt-2">
                        {order.couponStatus === "Valid" ? (
                          <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase">
                            Coupon Applied
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-full font-medium">
                            ID: {order.transactionId || 'Prepaid'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-6 text-center align-middle">
                      <button 
                        onClick={() => handleDeliveredChange(order.id)}
                        className="group flex flex-col items-center justify-center mx-auto hover:text-green-600 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-green-50 flex items-center justify-center border border-gray-200 group-hover:border-green-200 transition-all">
                           <CheckCircle2 size={22} className="text-gray-400 group-hover:text-green-600" />
                        </div>
                        <span className="text-[10px] mt-1 font-semibold text-gray-400 group-hover:text-green-600 uppercase">Mark Delivered</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-20">
                    <div className="flex flex-col items-center text-gray-400">
                      <Package size={48} className="mb-2 opacity-20" />
                      <p>No pending orders found for this date.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;