"use client";

import React from "react";
import Link from "next/link";
import withAuth from "../firebase/withAuth";
import useLogPage from "../hooks/useLogPage";
import AuthDetails from "../components/AuthDetails";

function Home() {
  useLogPage();
  return (
    <><AuthDetails></AuthDetails><div className="min-h-screen flex flex-col items-center justify-center">
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
    </div></>
  );
}

export default withAuth(Home);
