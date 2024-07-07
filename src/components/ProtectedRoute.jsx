import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth, UserVerifiedStatus } from "../hooks/useAuth";

const ProtectedRoute = ({children }) => {
    const user = UserAuth();
    const verified = UserVerifiedStatus();
    const [loading, setLoading] = useState(true);
    console.log("v", verified);
    const navigate = useNavigate();

    useEffect(() => {
        if(user !== null){
            setLoading(false);
        }
    },[user,verified])

    if (loading) {
    return <div>Loading...</div>;
  }

  return (user && verified)? children : <div>Verification Pending...</div>;
}

export default ProtectedRoute
