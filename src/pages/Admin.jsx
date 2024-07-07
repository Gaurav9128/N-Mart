import React, { useEffect, useState } from 'react';
import AddProduct from '../components/AddProduct';
import { PlusIcon, PlusCircleIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import AddCategory from '../components/AddCategory';
import UpdateProduct from './Update'; // Import the new component
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/FirebaseConfig';
import Loader from '../components/Loader';

const Admin = () => {
    const [isAdmin, setisAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeComponent, setActiveComponent] = useState("add");

    useEffect(() => {
        checkUserRole();
    },[])

    const checkUserRole = () => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if(user) {
                const uid = user.uid;
                const userRef = doc(firestore, "users",uid);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    if(docSnap.data().role === "admin") setisAdmin(true);
                } else {
                    console.log("No such document!");
                }
            } else {
                console.log("not signed in");
            }
            setLoading(false);
        })
    }

    const renderComponent = () => {
        switch(activeComponent){
            case 'add':
                return <AddProduct />
            case 'addCategory':
                return <AddCategory />
            case 'update':
                return <UpdateProduct /> // Add the new case
            default:
                return null;
        }
    }

    return (
        <div className="min-h-screen p-6 bg-gray-100 flex items-center justify-center">
        {loading && <Loader />}
        {isAdmin ?
            <div className="container max-w-screen-lg mx-auto">
                <div>
                    <h2 className="font-semibold text-xl text-gray-600">Admin Dashboard</h2>
                    <p className="text-gray-500 mb-6">Manage products and categories</p>

                    <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
                        <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-4">
                            <div className="flex flex-col text-gray-600 bg-gray-200">
                                <button className={`${activeComponent === 'add' ? "bg-gray-400" : ""} flex p-2`} onClick={() => setActiveComponent('add')}><PlusIcon className='w-6 h-6' /><span className='pl-1'>Add Product </span></button>
                                <button className={`${activeComponent === 'addCategory' ? "bg-gray-400" : ""} flex p-2`} onClick={() => setActiveComponent('addCategory')}><PlusCircleIcon className='w-6 h-6' /><span className='pl-1'>New Category </span></button>
                                <button className={`${activeComponent === 'update' ? "bg-gray-400" : ""} flex p-2`} onClick={() => setActiveComponent('update')}><ArrowPathIcon className='w-6 h-6' /><span className='pl-1'>Update Product </span></button>
                            </div>
                            <div className="lg:col-span-3">
                                {renderComponent()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
       :
            <h1>Unauthorized Access</h1>
        } 
        </div>
    )
}

export default Admin;
