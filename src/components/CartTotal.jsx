import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faShieldHalved, 
    faTruck, 
    faInfoCircle, 
    faArrowRight, 
    faLock 
} from '@fortawesome/free-solid-svg-icons';

const CartTotal = ({ cartItems, onCheckout }) => {
    const [totals, setTotals] = useState({ subtotal: 0, savings: 0, finalPay: 0 });
    const MIN_ORDER_VALUE = 5000;

    useEffect(() => {
        // 1. Subtotal calculation (Original MRP Total)
        const subtotal = cartItems.reduce((acc, item) => {
            const price = Number(item.pricePerPiece || 0);
            const qty = Number(item.quantity || 0);
            return acc + (price * qty);
        }, 0);

        // 2. Final Pay calculation (Actual Discounted Price Total)
        // Yahan 'item.discountPrice' wo price hai jo customer ko deni hai.
        const finalPay = cartItems.reduce((acc, item) => {
            const sellingPrice = Number(item.discountPrice || item.pricePerPiece || 0);
            const qty = Number(item.quantity || 0);
            return acc + (sellingPrice * qty);
        }, 0);

        // 3. Savings calculation (MRP Total - Discounted Total)
        const totalSavings = subtotal - finalPay;

        setTotals({
            subtotal: Number(subtotal.toFixed(2)),
            savings: Number(totalSavings.toFixed(2)),
            finalPay: Number(finalPay.toFixed(2))
        });
    }, [cartItems]);

    const isDisabled = totals.finalPay < MIN_ORDER_VALUE;

    return (
        <div className="w-full lg:w-[380px]">
            {/* Main Summary Card */}
            <div className="bg-[#111827] text-white rounded-3xl shadow-2xl overflow-hidden border border-gray-800">
                {/* Header */}
                <div className='px-6 py-5 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between'>
                    <h2 className='font-bold text-xl tracking-tight'>Order Summary</h2>
                    <span className="text-[10px] bg-blue-600 px-2 py-1 rounded-md font-black uppercase">Secure</span>
                </div>

                {/* Price Details */}
                <div className="p-6 space-y-4">
                    {/* Original Price */}
                    <div className="flex justify-between items-center text-gray-400">
                        <span className="text-sm font-medium">Items Total (MRP)</span>
                        <span className="font-semibold text-white">₹{totals.subtotal}</span>
                    </div>

                    {/* Delivery Info */}
                    <div className="flex justify-between items-center text-gray-400">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Delivery Charges</span>
                            <FontAwesomeIcon icon={faTruck} className="text-xs text-orange-400" />
                        </div>
                        <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Extra</span>
                    </div>

                    {/* Final Payable Amount */}
                    <div className="pt-4 mt-4 border-t border-gray-800 flex justify-between items-end">
                        <span className="text-base font-bold text-gray-200">Total Amount</span>
                        <div className="text-right">
                            <p className="text-3xl font-black text-blue-500">₹{totals.finalPay}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-tighter mt-1 italic">Exclusive of delivery</p>
                        </div>
                    </div>
                </div>

                {/* Savings Banner */}
                {totals.savings > 0 && (
                    <div className="bg-green-500/10 border-t border-gray-800 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            <p className="text-green-400 text-sm font-bold tracking-tight">
                                You are saving ₹{totals.savings} on this order!
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Checkout Action Area */}
            <div className="mt-6 space-y-4">
                {/* Minimum Order Warning */}
                {isDisabled && (
                    <div className="flex gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                        <FontAwesomeIcon icon={faInfoCircle} className="text-red-500 mt-1 shrink-0" />
                        <p className="text-sm text-red-400 font-medium leading-snug">
                            Min. order value is <span className="font-bold underline">₹{MIN_ORDER_VALUE}</span>. 
                            Add ₹{MIN_ORDER_VALUE - totals.finalPay} more to proceed.
                        </p>
                    </div>
                )}

                {/* Checkout Button */}
                <button
                    disabled={isDisabled}
                    onClick={onCheckout}
                    className={`group w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-lg transition-all duration-300 shadow-xl
                        ${isDisabled 
                            ? "bg-gray-800 text-gray-600 cursor-not-allowed" 
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/25 active:scale-95"
                        }`}
                >
                    {isDisabled ? "LIMIT NOT REACHED" : "PROCEED TO PAY"}
                    <FontAwesomeIcon 
                        icon={faArrowRight} 
                        className={`text-sm transition-transform duration-300 ${!isDisabled && "group-hover:translate-x-1"}`} 
                    />
                </button>

                {/* Trust Badges */}
                <div className="flex flex-col items-center gap-2 opacity-70">
                    <div className="flex items-center gap-2 text-gray-400 text-[11px] uppercase tracking-widest font-bold">
                        <FontAwesomeIcon icon={faShieldHalved} className="text-green-500 text-sm" />
                        100% Secure Transaction
                    </div>
                    <div className="flex gap-3 text-gray-500 items-center justify-center">
                        <FontAwesomeIcon icon={faLock} className="text-[10px]" />
                        <span className="text-[9px] font-bold">SSL ENCRYPTED</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartTotal;