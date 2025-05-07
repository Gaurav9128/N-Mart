import React, { useEffect, useState } from 'react';

const CartTotal = ({ cartItems, onCheckout }) => {
    const [cartTotal, setCartTotal] = useState(0);
    const [savings, setSavings] = useState(0);
    const [warning, setWarning] = useState('');

    useEffect(() => {
        const total = cartItems.reduce((acc, currItem) => {
            if (currItem.pricePerPiece && currItem.quantity) {
                return acc + (currItem.pricePerPiece * currItem.quantity);
            }
            return acc;
        }, 0);
        setCartTotal(total);
    }, [cartItems]);

    useEffect(() => {
        const totalSavings = cartItems.reduce((acc, currItem) => {
            const discountPrice = currItem.discountPrice || 0;
            if (currItem.pricePerPiece && currItem.quantity) {
                return acc + ((currItem.pricePerPiece - discountPrice) * currItem.quantity);
            }
            return acc;
        }, 0);
        setSavings(totalSavings);
    }, [cartItems]);

    useEffect(() => {
        if (cartTotal < 5000) {
            setWarning('Warning: Total amount exceeds ₹5000');
        } else {
            setWarning('');
        }
    }, [cartTotal]);

    return (
        <div className="mt-6 h-full md:mt-0 w-full lg:w-1/4">
            <div className="border bg-white rounded-sm shadow-md">
                <div className='w-full py-4 pl-2 border-b'>
                    <h1 className='font-medium text-md'>Price Summary</h1>
                </div>
                <div className="py-4 w-11/12 mx-auto flex border-b justify-between">
                    <p className="text-gray-700">Cart Total</p>
                    <p className="text-green-700">₹{cartTotal}</p>
                </div>
                <div className="py-4 w-11/12 mx-auto flex border-b justify-between">
                    <p className="text-gray-700">Delivery Charge</p>
                    <p className="text-red-700">+ Extra</p>
                </div>
                <div className="py-4 w-11/12 mx-auto flex justify-between">
                    <p className="text-gray-700">Savings</p>
                    <p className="text-green-700">₹{savings}</p>
                </div>
                {warning && (
                    <div className="py-4 w-11/12 mx-auto flex justify-between">
                        <p className="text-red-700">{warning}</p>
                    </div>
                )}
            </div>
            {(cartTotal >= 5000) && <button
                className="mt-6 w-full rounded-md bg-blue-400 py-2 font-medium text-white hover:bg-blue-400"
                disabled={cartTotal < 5000}
                onClick={onCheckout}
            >
                PROCEED TO CHECKOUT
            </button>}
        </div>
    );
}

export default CartTotal;
