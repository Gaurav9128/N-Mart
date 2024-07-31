// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAp4yN67uEQ-rThw9FYwfelWjTkDzc2fDA",
  authDomain: "ajmerclient.firebaseapp.com",
  projectId: "ajmerclient",
  storageBucket: "ajmerclient.appspot.com",
  messagingSenderId: "846509056495",
  appId: "1:846509056495:web:29267fc981802690b2d61a",
  measurementId: "G-RMVC0ZBYN1"
};

// const firebaseConfig = {
//   apiKey: "AIzaSyCjMDeZfnLx0ZbEacq-yJQ-ad6IkNZK8KQ",
//   authDomain: "ajmer-n-mart.firebaseapp.com",
//   projectId: "ajmer-n-mart",
//   storageBucket: "ajmer-n-mart.appspot.com",
//   messagingSenderId: "23005225518",
//   appId: "1:23005225518:web:459423a45d6537da9c35bf",
//   measurementId: "G-9GV8F8QB6V"
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const firestore = getFirestore(app);
export {
    app,
    auth,
    storage,
    firestore,
    firebaseConfig
};