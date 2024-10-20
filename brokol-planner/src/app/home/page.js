"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import withAuth from "../firebase/withAuth";
import useLogPage from "../hooks/useLogPage";

function Home() {
  useLogPage();
  const [showPopup, setShowPopup] = useState(false);

  // useEffect hook to check if the screen width is less than 768px (mobile view)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowPopup(true);
      } else {
        setShowPopup(false);
      }
    };

    // Call the handler right away so we set the initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="relative bg-white p-8 rounded-xl shadow-lg text-center max-w-[350px] mx-auto">
          {/* Close Button */}
          <button
            className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPopup(false)}
            style={{ fontSize: '1.5rem'}}
          >
            &times;
          </button>
          <p className="text-lg font-semibold mb-6">
              The app is currently desktop-optimized. Rotate your phone <br></br> for better mobile use.
          </p>
            <div className="flex justify-center gap-4">
                <button
                className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 w-48"
                onClick={() => {
                  setShowPopup(false);
                }}
                >
                Got it!
                </button>
            </div>
          </div>
      </div>
      )}
      <div className="flex flex-col items-center justify-center flex-1 py-5">
        <h1 className="text-4xl font-bold text-center mb-10">Homepage</h1>
        <div className="flex gap-8">
          <Link href="/input">
            <div className="w-48 h-32 font-bold bg-white border-2 border-black text-black text-xl rounded-lg hover:bg-gray-200 cursor-pointer flex items-center justify-center text-center">
              Generate new meal plan
            </div>
          </Link>
          <Link href="/mealplan">
            <div className="w-48 h-32 font-bold bg-white border-2 border-black text-black text-xl rounded-lg hover:bg-gray-200 cursor-pointer flex items-center justify-center text-center">
              View current<br></br>meal plan
            </div>
          </Link>
          <Link href="/favorite">
            <div className="w-48 h-32 font-bold bg-white border-2 border-black text-black text-xl rounded-lg hover:bg-gray-200 cursor-pointer flex items-center justify-center text-center">
              View favorite recipes
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Home);
