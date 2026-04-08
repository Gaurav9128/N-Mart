import React, { useState, useEffect, Fragment } from 'react';
import { Modal, Label, TextInput, Button } from 'flowbite-react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth, firestore } from "../firebase/FirebaseConfig";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Loader from './Loader';
import OtpTimer from "otp-timer";
import { Tab } from '@headlessui/react';

const RegisterModal = (props) => {
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
    const [phone, setPhone] = useState(""); // Used to display number on OTP screen
    const [user, setUser] = useState(null);
    const [otp, setOtp] = useState("");
    const [showOtpInput, setShowOtpInput] = useState(false);
    
    const navigate = useNavigate();
    const auth = getAuth();

    const setUpRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
            });
        }
    };

    const isPhoneNumberValid = formData.phonenumber.length === 10;

    const sendOtp = async () => {
        try {
            if (formData.phonenumber.length !== 10) {
                alert("Please enter a valid 10-digit Phone number");
                return;
            }

            setLoading(true);
            setUpRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            
            // Sync the phone state for the UI display
            setPhone(formData.phonenumber);

            const confirmation = await signInWithPhoneNumber(auth, "+91" + formData.phonenumber, appVerifier);
            
            setUser(confirmation);
            setShowOtpInput(true);
            setLoading(false);
        } catch (e) {
            setLoading(false);
            console.error("Auth Error:", e);
            
            // Reset reCAPTCHA so it can be re-initialized on next click
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }

            // Provide a dynamic error message instead of the static "no spaces" alert
            alert(e.message || "Something went wrong. Please check your connection and try again.");
        }
    };

    const verifyOtp = async () => {
        try {
            setLoading(true);
            const data = await user.confirm(otp);
            
            const userRef = doc(firestore, "users", data.user.uid);
            const querySnapshot = await getDoc(userRef);

            if (tabIndex === 1) { // Register Tab
                if (!querySnapshot.exists()) { 
                    await setDoc(userRef, {
                        mobile: data.user.phoneNumber,
                        role: "customer",
                        registerationTime: serverTimestamp(),
                        firstName: formData.firstname,
                        lastName: formData.lastname,
                        companyName: formData.companyname,
                        companyProof: formData.companyProof,
                        companyAddress: {
                            area: formData.areaname,
                            city: formData.cityname,
                            state: formData.statename,
                            postalcode: formData.postalcode
                        },
                        verified: false
                    });
                }
            } else if (tabIndex === 0) { // Login Tab
                if (!querySnapshot.exists()) {
                    setLoading(false);
                    alert("User does not exist. Please sign up!");
                    return;
                }
            }

            localStorage.setItem('userId', data.user.uid);
            setLoading(false);
            navigate("/");
            window.location.reload();
        } catch (e) {
            setLoading(false);
            alert("Invalid OTP. Please try again.");
        }
        setOtp("");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phonenumber') {
            const sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const requiredFields = ['firstname', 'lastname', 'companyname', 'companyProof', 'areaname', 'cityname', 'statename', 'postalcode'];
        const isFormIncomplete = requiredFields.some(field => !formData[field]);

        if (isFormIncomplete) {
            alert('Please fill in all the fields.');
            return;
        }
        sendOtp();
    };

    return (
        <div className={`${props.modal ? "" : "hidden"} fixed inset-0 z-50 bg-opacity-60 bg-black text-gray-900 flex justify-center items-center`}>
            {loading && <Loader />}
            <div id="recaptcha-container"></div>

            <div className="max-w-screen-md w-full h-5/6 max-h-[768px] bg-white shadow sm:rounded-lg overflow-auto mx-4">
                {showOtpInput ? (
                    <div className="p-8 space-y-6">
                        <h1 className='text-center border-b pb-4 text-xl'>Almost Done!</h1>
                        <p className='text-sm'>OTP Sent via SMS to <b>+91 {phone}</b></p>
                        
                        <div className="max-w-md">
                            <Label htmlFor="otp" value="Enter OTP" className='text-gray-400' />
                            <TextInput id="otp" type='text' value={otp} onChange={(e) => setOtp(e.target.value)} required />
                        </div>

                        <OtpTimer
                            minutes={1}
                            seconds={30}
                            text="Resend OTP in:"
                            ButtonText="Resend"
                            buttonColor="red"
                            resend={sendOtp}
                        />

                        <Button color='warning' className='w-full' onClick={verifyOtp}>Verify OTP</Button>
                        <Button color='gray' className='w-full' onClick={() => setShowOtpInput(false)}>Go Back</Button>
                    </div>
                ) : (
                    <div className="w-full">
                        <Tab.Group defaultIndex={1} onChange={setTabIndex}>
                            <Tab.List className="flex border-b">
                                <Tab className={({ selected }) => `flex-1 py-4 outline-none ${selected ? "bg-gray-100 border-b-2 border-yellow-400" : "bg-white"}`}>Sign In</Tab>
                                <Tab className={({ selected }) => `flex-1 py-4 outline-none ${selected ? "bg-gray-100 border-b-2 border-yellow-400" : "bg-white"}`}>Register</Tab>
                            </Tab.List>

                            <Tab.Panels>
                                {/* LOGIN PANEL */}
                                <Tab.Panel className="p-8 space-y-6">
                                    <div className="max-w-md">
                                        <Label value="Enter your 10 digit mobile number" className='text-gray-400' />
                                        <TextInput name="phonenumber" addon="+91" type='tel' maxLength="10" value={formData.phonenumber} onChange={handleChange} required />
                                    </div>
                                    <Button color='warning' className='w-full' disabled={!isPhoneNumberValid} onClick={sendOtp}>CONTINUE</Button>
                                </Tab.Panel>

                                {/* REGISTER PANEL */}
                                <Tab.Panel className="p-8">
                                    <form onSubmit={handleFormSubmit} className="space-y-4">
                                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                            <div>
                                                <Label value="First Name" />
                                                <TextInput name="firstname" value={formData.firstname} onChange={handleChange} required />
                                            </div>
                                            <div>
                                                <Label value="Last Name" />
                                                <TextInput name="lastname" value={formData.lastname} onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div>
                                            <Label value="Company Name" />
                                            <TextInput name="companyname" value={formData.companyname} onChange={handleChange} required />
                                        </div>
                                        <div>
                                            <Label value="GSTIN/PAN" />
                                            <TextInput name="companyProof" value={formData.companyProof} onChange={handleChange} required />
                                        </div>
                                        
                                        <div className='grid grid-cols-2 gap-4'>
                                            <TextInput name="areaname" value={formData.areaname} onChange={handleChange} placeholder='Area' required />
                                            <TextInput name="cityname" value={formData.cityname} onChange={handleChange} placeholder='City' required />
                                            <TextInput name="statename" value={formData.statename} onChange={handleChange} placeholder='State' required />
                                            <TextInput name="postalcode" value={formData.postalcode} onChange={handleChange} placeholder='Pincode' required />
                                        </div>

                                        <div>
                                            <Label value="Mobile Number" />
                                            <TextInput name="phonenumber" addon="+91" type='tel' maxLength="10" value={formData.phonenumber} onChange={handleChange} required />
                                        </div>

                                        <Button type="submit" color='warning' className='w-full' disabled={!isPhoneNumberValid}>REGISTER & CONTINUE</Button>
                                    </form>
                                </Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>
                    </div>
                )}
            </div>
            
            {/* Close Button */}
            <div className="absolute top-5 right-5 cursor-pointer" onClick={() => props.setModal(false)}>
                <XMarkIcon className="h-8 w-8 text-white" />
            </div>
        </div>
    );
};

export default RegisterModal;