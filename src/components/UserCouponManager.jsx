import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase/FirebaseConfig'; // Adjust import based on your project structure
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const UserCouponManager = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCol = collection(firestore, 'users');
        const userSnapshot = await getDocs(usersCol);
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched users:", userList); // Debugging line
        setUsers(userList);
        setFilteredUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredUsers(
        users.filter(user =>
          user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) || // Adjust property name if needed
          user.lastName?.toLowerCase().includes(searchQuery.toLowerCase())    // Adjust property name if needed
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const handleAddCoupon = async () => {
    if (!selectedUser || !couponCode || !startDate || !endDate) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      const couponRef = doc(firestore, 'coupons', couponCode);
      await updateDoc(couponRef, {
        user: selectedUser,
        code: couponCode,
        startDate,
        endDate,
        isActive,
      });
      alert('Coupon added/updated successfully');
    } catch (error) {
      console.error("Error adding/updating coupon:", error);
      alert('Failed to add/update coupon');
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-lg">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Manage Coupons</h2>

      <div className="mb-4">
        <label className="block text-gray-700">Search Users</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Select User</label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded w-full"
        >
          <option value="">-- Select User --</option>
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.firstName || 'Unnamed User'} {/* Adjust if needed */}
              </option>
            ))
          ) : (
            <option value="">No users found</option>
          )}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Coupon Code</label>
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Status</label>
        <select
          value={isActive ? 'active' : 'inactive'}
          onChange={(e) => setIsActive(e.target.value === 'active')}
          className="mt-1 p-2 border border-gray-300 rounded w-full"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <button
        onClick={handleAddCoupon}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Save Coupon
      </button>
    </div>
  );
};

export default UserCouponManager;
