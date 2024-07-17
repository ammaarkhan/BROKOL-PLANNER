"use client";

import React from "react";
import Link from "next/link";
import withAuth from "../firebase/withAuth";
import useLogPage from "../hooks/useLogPage";

function AddFavRecipes({searchParams}) {
  return (
    <p>
        AddFavRecipes
    </p>
    //router.push(`/recipes?${params}`);
  );
}

export default withAuth(AddFavRecipes);
