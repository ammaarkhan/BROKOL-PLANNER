"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../config/firebase";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const signIn = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        router.push("/home");
      })
      .catch((error) => {
        setError(
          "Incorrect password. Contact hello@brokol.app if you need help :)"
        );
        console.log(error);
      });
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl mb-4 font-bold">Meal Planner</h1>
      <form onSubmit={signIn} className="w-full max-w-56">
        <div className="flex justify-center">
          <h1>Login to your Account</h1>
        </div>
        <input
          type="email"
          placeholder="Enter your email"
          className="pl-3 border border-gray-300 mt-2 block w-full rounded-md shadow-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></input>
        <input
          type="password"
          placeholder="Enter your password"
          className="pl-3 border border-gray-300 mt-2 block w-full rounded-md shadow-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        {error && (
          <div className="w-full bg-red-500 text-white p-2 mb-2 mt-4 rounded-md">
            {error}
          </div>
        )}
        <div className="flex justify-center mt-2">
          <button
            type="submit"
            className="bg-black text-white py-2 px-4 rounded-lg mt-2"
          >
            Login
          </button>
        </div>
      </form>
    </main>
  );
}
