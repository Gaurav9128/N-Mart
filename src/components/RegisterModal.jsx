import React, { useState, useEffect } from 'react'
import { Fragment } from 'react'
import { Modal, Label, TextInput,Button } from 'flowbite-react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getAuth,RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth, firestore } from "../firebase/FirebaseConfig";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, query, where, getDocs, Timestamp, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Loader from './Loader';
import OtpTimer from "otp-timer";
import { Tab } from '@headlessui/react';

const RegisterModal = (props) => {
    //register form
    const [tabIndex, setTabIndex] = useState(1);
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        companyname: '',
        companyProof: '',
        areaname: '',
        cityname: '',
        statename: '',
        postalcode: '',
        phonenumber: ''
    });

    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState("");
    const [user,setUser] = useState(null);
    const [otp,setOtp] = useState("");
    const [showOtpInput, setShowOtpInput] = useState(false);
    const navigate = useNavigate();
     const auth = getAuth();

    const setUpRecaptcha = () => {
        if(!window.recaptchaVerifier){
      window.recaptchaVerifier = new RecaptchaVerifier(auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );
    }

        window.recaptchaVerifier.verify();
    };

    const isPhoneNumberValid = formData.phonenumber.length >= 10;

    const sendOtp = async() => {
        setUpRecaptcha()
        const appVerifier = await window.recaptchaVerifier;
        try {
            if(formData.phonenumber.length !== 10)alert("Please enter a valid Phone number");
            else {
            setLoading(true);
            // const recaptcha = new RecaptchaVerifier(auth,"recaptcha",{});
            // setLoading(false);
            const confirmation = await signInWithPhoneNumber(auth, "+91"+formData.phonenumber, appVerifier)
            setUser (confirmation);
            setShowOtpInput(true);
            setLoading(false);
            }
        } catch(e) {
            setLoading(false);
            console.log(e);
            window.recaptchaVerifier.recaptcha.reset();
            window.recaptchaVerifier.clear();
            alert("Please write your phone number without spaces. Eg. 999xxxxxxx")
        }
    }

    const verifyOtp = async() => {
        try {
            setLoading(true);
            const data = await user.confirm(otp);
            
            const userRef = doc(firestore, "users",data.user.uid);
            const querySnapshot = await getDoc(userRef);
            if(tabIndex === 1){
                if(!querySnapshot.exists()){ 
                    await setDoc(userRef,{
                        mobile : data.user.phoneNumber,
                        email : data.user.email,
                        role : "customer",
                        registerationTime : serverTimestamp(),
                        firstName: formData.firstname,
                        lastName: formData.lastname,
                        companyName: formData.companyname,
                        companyProof: formData.companyProof,
                        companyAddress : {
                            area : formData.areaname,
                            city: formData.cityname,
                            state: formData.statename,
                            postalcode : formData.postalcode
                        },
                        verified: false
                        
                    })
                }
            }else if(tabIndex === 0){
                if((!querySnapshot.exists())){
                    alert("User does not exists.Please signup!");
                    return;
                }
            }
            localStorage.setItem('userId', data.user.uid)
            setLoading(false);
            navigate("/");
            window.location.reload();
        }catch(e) {
            setLoading(false);
            alert(e);
            // alert("Somethign went wrong!Please try again")
        }
        setOtp("");

    }

    // const resendOTP = async() => {
    //     setUpRecaptcha()
    //     const appVerifier = await window.recaptchaVerifier;
    //     try{
    //         const confirmation = await signInWithPhoneNumber(auth, "+91"+formData.phonenumber, appVerifier)
    //         setUser (confirmation);
    //         setShowOtpInput(true);
    //         setLoading(false);
    //     } catch(e) {
    //         setLoading(false);
    //         console.log(e);
    //         alert("Something went wrong! Contact administrator if situation persists")
    //     }
    //     }
    
        const handleChange = (e) => {
        const { name, value } = e.target;
        if(name === 'phonenumber'){
        // Remove any non-numeric characters from the input value
        const sanitizedValue = value.replace(/\D/g, '');
        // Limit the input to 10 digits
        const truncatedValue = sanitizedValue.slice(0, 10);
        console.log(truncatedValue)
        setFormData(prevData => ({
            ...prevData,
            [name]: truncatedValue,
        }));
        }
        else {

        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

         if (!formData.firstname || !formData.lastname || !formData.companyname || !formData.companyProof || !formData.areaname || !formData.cityname || !formData.statename || !formData.postalcode) {
            alert('Please fill in all the fields.');
            return;
        }
        sendOtp();
    }

  return (
    <div className={` ${props.modal?"":"hidden"} bg-opacity-60 h-screen w-screen absolute bg-black text-gray-900 flex flex-row justify-center items-center`}>
    {loading && <Loader />}
    <div className="max-w-screen-md h-5/6 max-h-[768px]   bg-white shadow sm:rounded-lg overflow-auto mx-2 sm:mx-12">
        {showOtpInput?
           <div className="">
            <div>
                <h1 className='py-4 flex justify-center items-center border-b text-md text-black'>Almost Done!</h1>
            </div>
            <div className='p-8 space-y-6'>
            <h1>OTP Sent via SMS to +91 {phone} to verify your mobile number</h1>
            <div className="max-w-md">
                <div className="mb-2 block">
                    <Label htmlFor="otp" value="Enter OTP" className='text-gray-400 font-normal' />
                </div>
                <TextInput id="otp" type='text' value={otp}  onChange={(e) => setOtp(e.target.value)}  required />
            </div>
            <OtpTimer
            minutes={1}
            seconds={30}
            text="Resend OTP in:"
            ButtonText="Resend"
            buttonColor = "red" 
            background ="white"
            resend={sendOtp}
            />
            <h2 className='text-gray-400'>By continuing, you agree to our Terms, Refunds and Privacy Policy</h2>
            <Button color='warning' className='w-full' onClick={verifyOtp}>Verify OTP</Button>
            <Button onClick={() => {setShowOtpInput(false)}}>Go Back</Button>
            </div>
            </div>
            :
            <div className="w-full">
                <Tab.Group defaultIndex={1} onChange={(index) => {
                    setTabIndex(index);
                }}>
                    <Tab.List className="flex border-b-2 ">

                    <Tab as={Fragment} className="flex-1 py-2">
                    {({selected}) =>(
                        <button className={selected ? "bg-gray-200" : "bg-white"}>Sign In</button>
                    )}
                    </Tab>
                    <Tab as={Fragment} className="flex-1 py-2">
                    {({selected}) =>(
                        <button className={selected ? "bg-gray-200" : "bg-white"}>Register</button>
                    )}
                    </Tab>
                    </Tab.List>
                    <Tab.Panels>
                    {/* <h1 className='py-4 flex justify-center items-center border-b text-md text-black'></h1> */}
                    <Tab.Panel>
                    <div className='p-8  space-y-6'>
                    <div className="max-w-md">
                        <div className="mb-2 block">
                            <Label htmlFor="phonenumber" value="Enter your 10 digit mobile number" className='text-gray-400 font-normal' />
                        </div>
                        <TextInput name="phonenumber" addon="+91" type='tel' pattern='[0-9]{10}' maxLength="10" value={formData.phonenumber} onChange={handleChange}  required />
                    </div>
                    <h2 className='text-gray-400'>By continuing, you agree to our Terms, Refunds and Privacy Policy</h2>
                    
                    <Button color='warning' className='max-w-md w-full' disabled={!isPhoneNumberValid} onClick={sendOtp}>CONTINUE</Button>
                    </div>
                    </Tab.Panel>
                    <Tab.Panel>
                    <form id='registeration-form' onSubmit={handleFormSubmit}>
                    <div className='p-8  space-y-6'>
                    <div className="max-w-md">
                        <div className="mb-2 block">
                            <Label htmlFor="firstname" value="First Name" className='text-gray-400 font-normal' />
                        </div>
                        <TextInput name="firstname" type='text' value={formData.firstname} onChange={handleChange}   required />
                         <div className="mb-2 block">
                            <Label htmlFor="lastname" value="Last Name" className='text-gray-400 font-normal' />
                        </div>
                        <TextInput name="lastname" type='text' value={formData.lastname} onChange={handleChange}   required />
                         <div className="mb-2 block">
                            <Label htmlFor="companyname" value="Company Name" className='text-gray-400 font-normal' />
                        </div>
                        <TextInput name="companyname" type='text' value={formData.companyname} onChange={handleChange}   required />
                        <div className="mb-2 block">
                            <Label htmlFor="companyProof" value="GSTIN/PAN" className='text-gray-400 font-normal' />
                        </div>
                        <TextInput name="companyProof" type='text' value={formData.companyProof} onChange={handleChange}   required />
                        <div className="mb-2 pt-3">
                            <Label value="Company Address" className='text-gray-400 font-normal' />
                            <div className="mt-2 -mx-3 flex flex-wrap">
                                <div className="w-full px-3 sm:w-1/2">
                                    <div className="mb-5">
                                        <TextInput name="areaname" type='text' value={formData.areaname} onChange={handleChange} placeholder='Enter area'   required />
                                    </div>
                                </div>
                                <div className="w-full px-3 sm:w-1/2">
                                    <div className="mb-5">
                                        <TextInput name="cityname" type='text' value={formData.cityname} onChange={handleChange} placeholder='Enter city'   required />
                                    </div>
                                </div>
                                <div className="w-full px-3 sm:w-1/2">
                                    <div className="mb-5">
                                        <TextInput name="statename" type='text' value={formData.statename} onChange={handleChange} placeholder='Enter state'   required />
                                        </div>
                                </div>
                                <div className="w-full px-3 sm:w-1/2">
                                    <div className="mb-5">
                                        <TextInput name="postalcode" type='text' value={formData.postalcode} onChange={handleChange} placeholder='Postal Code'   required />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mb-2 block">
                            <Label htmlFor="phonenumber" value="Enter your 10 digit mobile number" className='text-gray-400 font-normal' />
                        </div>
                        <TextInput name="phonenumber" addon="+91" type='tel' pattern='[0-9]{10}' maxLength="10" value={formData.phonenumber} onChange={handleChange}  required />
                    </div>
                    <h2 className='text-gray-400'>By continuing, you agree to our Terms, Refunds and Privacy Policy</h2>
                    
                    <Button color='warning' className='max-w-md w-full' disabled={!isPhoneNumberValid} onClick={handleFormSubmit}>CONTINUE</Button>
                    </div>
                    </form>
                    </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>

        }
        
    </div>
    {/* x mark to close modal */}
    {/* <div className='h-5/6 max-h-[768px] ml-2 cursor-pointer' onClick={() => {props.setModal(false)}}><XMarkIcon className="h-6 w-6" color='white' aria-hidden="true" /></div> */}
    
    </div>
    
  )
}

export default RegisterModal
