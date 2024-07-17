"use client";

import React from "react";
import withAuth from "../firebase/withAuth";

function AddFavRecipes({searchParams}) {
  return (
    <p>
        AddFavRecipes
    </p>
    //router.push(`/recipes?${params}`);
  );
}

export default withAuth(AddFavRecipes);
