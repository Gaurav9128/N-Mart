import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';
import { cartTotalAtom } from '../store/atoms/totalCartQuantity';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../firebase/FirebaseConfig';

const CartIcon = () => {
    const navigate = useNavigate();
    const [cartTotal,setCartTotal] = useRecoilState(cartTotalAtom);

    useEffect(() => {
        getCartTotal();
    },[])

    const getCartTotal = async() => {
        const q = query(collection(firestore, "carts"), where("userId", "==",localStorage.getItem("userId")));
        const querySnapshot = await getDocs(q);
        if(!querySnapshot.empty){
                const currdoc = querySnapshot.docs[0];
                const existingItemsCollection = collection(firestore, 'carts', currdoc.id, "items");
                const docSnap = await getDocs(existingItemsCollection);
                let allItems =[];
                if(!docSnap.empty){
                    docSnap.forEach((doc) => {
                    allItems.push({id: doc.id ,...doc.data()});
                    })
                    setCartTotal(allItems.reduce((total, currentItem) => {return total + parseInt(currentItem.quantity)},0))
                    
                }
        }

    }

  return (
    <div className='relative'>
     <ShoppingCartIcon className="mt-2 mr-2 h-6 w-6 text-gray-500 cursor-pointer" onClick={() => {navigate("/cart")}}/>
     <span className='absolute top-0 right-0 w-4 h-4 text-center  text-xs bg-yellow-400 rounded-full'>{cartTotal}</span>
    </div>

  )
}

export default CartIcon
