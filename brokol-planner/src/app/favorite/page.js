"use client";

import withAuth from "../firebase/withAuth";
import useLogPage from "../hooks/useLogPage";

function Favorite() {
  useLogPage();

  return (
    <div className="flex justify-center min-h-screen bg-white">
      <h1 className="text-4xl mb-4 font-bold text-center mt-10">
        Favorite Recipes
      </h1>
    </div>
  );
}

export default withAuth(Favorite);
