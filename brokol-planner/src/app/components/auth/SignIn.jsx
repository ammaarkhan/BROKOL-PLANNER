"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../../firebase";
import { useRouter } from "next/navigation";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const signIn = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential);
        router.push("/recipes");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="sign-in-container">
      <form onSubmit={signIn}>
        <div className = "flex justify-center">
          <h1>Login to your Account</h1>
        </div>
        
        <input
          type="email"
          placeholder="Enter your email"
          className = "pl-3 border border-gray-300 mt-2 block w-full rounded-md shadow-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></input>
        <input
          type="password"
          placeholder="Enter your password"
          className = "pl-3 border border-gray-300 mt-2 block w-full rounded-md shadow-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        <div className = "flex justify-center mt-2">
          <button type="submit" className="bg-black text-white py-2 px-4 rounded-lg mt-2">Login</button>
        </div>
        
      </form>
    </div>
  );
};

export default SignIn;