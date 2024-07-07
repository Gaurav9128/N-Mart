import React, { useEffect } from 'react';

const CartTotal = ({ cartItems }) => {
  useEffect(() => {
    console.log('cartItems:', cartItems);
  }, [cartItems]);
  
  return (
    <div className="mt-6 h-full md:mt-0 w-full lg:w-1/4">
      <div className="border bg-white rounded-sm shadow-md">
        <div className='w-full py-4 pl-2 border-b'>
          <h1 className='font-medium text-md'>Price Summary</h1>
        </div>
        <div className="py-4 w-11/12 mx-auto flex border-b justify-between">
          <p className="text-gray-700">Cart Total</p>
          <p className="text-green-700">₹{cartItems.reduce((acc, currItem) => {
            const discountPrice = currItem.discountPrice || 0; // Default to 0 if discountPrice is undefined
            console.log("Discount Price:", discountPrice); // Debugging log
            if (
              currItem.pricePerPiece &&
              currItem.quantity 
            ) {
              const savingsPerItem = (currItem.pricePerPiece - discountPrice) * currItem.quantity;
              return acc + savingsPerItem;
            } else {
              return acc;
            }
          }, 0)}</p>

        </div>
        <div className="py-4 w-11/12 mx-auto flex border-b justify-between">
          <p className="text-gray-700">Delivery Charge</p>
          <p className="text-red-700">+ Extra</p>
        </div>
        <div className="py-4 w-11/12 mx-auto flex justify-between">
          <p className="text-gray-700">Savings</p>
          <p className="text-green-700">₹{cartItems.reduce((acc, currItem) => {
            const discountPrice = currItem.discountPrice || 0; // Default to 0 if discountPrice is undefined
            console.log("Discount Price:", discountPrice); // Debugging log
            if (
              currItem.pricePerPiece &&
              currItem.quantity 
            ) {
              const savingsPerItem = 0;
              return acc + savingsPerItem;
            } else {
              return acc;
            }
          }, 0)}</p>
        </div>
      </div>
      <button className="mt-6 w-full rounded-md bg-blue-500 py-2 font-medium text-white hover:bg-blue-400">PROCEED TO CHECKOUT</button>
    </div>
  );
}

export default CartTotal;
