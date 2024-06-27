"use client";

import React from "react";
import { useRouter } from "next/navigation";
import withAuth from "../firebase/withAuth";

function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center flex-1 py-5">
        <h1 className="text-4xl font-bold text-center mb-10">Homepage</h1>
        <div className="flex gap-8">
          <button
            className="w-48 h-32 font-bold bg-white border-2 border-black text-black text-xl rounded-lg hover:bg-gray-200"
            onClick={() => router.push("/input")}
          >
            Generate a new meal plan
          </button>
          <button
            className="w-48 h-32 font-bold bg-white border-2 border-black text-black text-xl rounded-lg hover:bg-gray-200"
            onClick={() => router.push("/mealplan")}
          >
            View saved <br></br> meal plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Home);
