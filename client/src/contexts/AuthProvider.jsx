import { auth } from "../firebase/firebase.init";
import { AuthContext } from "./AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const updateUser = (updatedData) => {
    return updateProfile(auth.currentUser, updatedData);
  };

  const logOut = () => {
    localStorage.removeItem("token");
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // post request for jwt using user email
      // api end-point: /jwt (post method)
      if (currentUser?.email) {
        axios
          .post(
            `${import.meta.env.VITE_API_URL}/jwt`,
            {
              email: currentUser?.email,
            },
            { withCredentials: true }
          )
          .then((res) => {
            // To store token in localstorage method only
            // localStorage.setItem("token", data?.data.token);
            console.log(res.data);
          });
      } else {
        localStorage.removeItem("token");
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const authData = {
    user,
    setUser,
    createUser,
    logOut,
    signIn,
    loading,
    setLoading,
    updateUser,
  };
  return <AuthContext value={authData}>{children}</AuthContext>;
};

export default AuthProvider;
