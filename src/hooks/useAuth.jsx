import { getAuth, onAuthStateChanged, signInWithPhoneNumber, signOut } from "firebase/auth"
import { useEffect, useState } from "react";
import { firestore} from "../firebase/FirebaseConfig";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import { userState } from "../store/atoms/userState";
import { verifiedState } from "../store/atoms/verifiedState";
import { doc, getDoc } from "firebase/firestore";


export default function AuthProvider ({children }){
    const [user,setUser] = useRecoilState(userState);
    const [userVerificationStatus, setUserVerificationStatus] = useRecoilState(verifiedState);



    useEffect(() => {
      const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async(currentUser) => {
          const userObj = {
            uid : currentUser.uid,
            verified: currentUser.verified
          }
            setUser(userObj);
            if(currentUser){
              const userDoc =doc(firestore, "users", currentUser.uid);
              const querySnapshot = await getDoc(userDoc);
              if(querySnapshot.exists()){
                setUserVerificationStatus(querySnapshot.data().verified);
              }
            }
            else{
            //setUserVerificationStatus(false);
            }
        });
        return () =>unsubscribe()
    },[]);

      return children;
}

export const UserAuth = () => {
  return useRecoilValue(userState)
};

export const UserVerifiedStatus = () => {
  return useRecoilValue(verifiedState)
};