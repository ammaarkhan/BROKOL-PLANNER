"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../config/firebase";
import { addFavoriteRecipe } from "../db";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import Link from "next/link";
import withAuth from "../firebase/withAuth";
import useLogPage from "../hooks/useLogPage";
import { analytics } from "../../config/firebase";
import { logEvent } from "firebase/analytics";
import Confetti from "react-confetti";

function MealPlan({ searchParams }) {
  useLogPage();

  const { confetti } = searchParams;

  const [recipeList, setRecipeList] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [uid, setUid] = useState(null);

  const categories = [
    "Produce (Fruit & Vegetables)",
    "Meat & Seafood",
    "Dairy & Eggs",
    "Bakery & Bread",
    "Dry Goods & Canned Foods",
    "Other",
  ];

  const categorizedList = categories.map((category) => ({
    category,
    items: shoppingList.filter((item) => item?.category === category),
  }));

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        // User is signed out
        setUid(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLatestMealPlan = async (uid) => {
      if (!uid) return;

      try {
        const mealPlansRef = collection(db, `users/${uid}/mealPlans`);
        const q = query(mealPlansRef, orderBy("dateAdded", "desc"), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const latestMealPlan = querySnapshot.docs[0].data();
          setRecipeList(latestMealPlan.recipes || []);
          setShoppingList(latestMealPlan.shoppingList || []);
        } else {
          console.log("No meal plans found");
        }
      } catch (error) {
        console.error("Error fetching latest meal plan:", error);
      }
    };

    if (uid) {
      fetchLatestMealPlan(uid);
    }
  }, [uid]);

  const addFavorite = async (recipeData, index) => {
    logEvent(analytics, "recipe_favorited_mealplan_page");
    try {
      await addFavoriteRecipe(uid, recipeData);
      // Fetch the latest meal plan
      const mealPlansRef = collection(db, `users/${uid}/mealPlans`);
      const q = query(mealPlansRef, orderBy("dateAdded", "desc"), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const mealPlanDoc = querySnapshot.docs[0];
        const mealPlanData = mealPlanDoc.data();
        const mealPlanId = mealPlanDoc.id;

        // Update the recipe in the meal plan
        const updatedRecipes = mealPlanData.recipes.map((recipe, i) =>
          i === index ? { ...recipe, favorited: true } : recipe
        );

        // Update Firestore with the modified meal plan
        await updateDoc(doc(db, `users/${uid}/mealPlans/${mealPlanId}`), {
          recipes: updatedRecipes,
        });

        // Update the local state
        setRecipeList(updatedRecipes);

        alert(
          "Recipe added to favorites! You can access it from the home page."
        );
      } else {
        console.log("No meal plans found");
      }
    } catch (error) {
      console.error("Error adding favorite recipe:", error);
      alert("Failed to add favorite recipe.");
    }
  };

  return (
    <div className="flex flex-col items-center my-4">
      {confetti === "true" ? (
        <Confetti numberOfPieces={2500} recycle={false} />
      ) : null}
      <button className="absolute left-4 bg-black text-white py-2 px-4 rounded-lg">
        <Link href="/home">Back</Link>
      </button>
      <h1 className="text-4xl mb-4 font-bold text-center mt-10">
        Current Meal Plan
      </h1>
      {recipeList.length > 0 ? (
        <div className="flex w-full max-w-6xl">
          <div className="w-4/6 pr-4">
            <RecipesView recipeList={recipeList} addFavorite={addFavorite} />
          </div>
          <div className="w-2/6 pl-4">
            {shoppingList.length > 0 && (
              <div className="mt-4 bg-gray-200 rounded-xl px-4 py-4">
                <h2 className="text-3xl mb-4 font-bold">Grocery List</h2>
                {categorizedList.map(
                  ({ category, items }) =>
                    items.length > 0 && (
                      <div key={category} className="mb-4">
                        <h3 className="text-xl font-bold">{category}</h3>
                        <ul className="list-disc list-inside text-gray-700">
                          {items.map((item, index) => (
                            <li key={index}>
                              {item.amount} {item.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p>
          No meal plan found or please refresh the page if you just saved a meal
          plan.
        </p>
      )}
    </div>
  );
}

function RecipesView({ recipeList, addFavorite }) {
  return (
    <div className="flex flex-col gap-4 mt-4 max-w-4xl mx-auto">
      {recipeList.map((recipeData, index) => (
        <div
          className="flex flex-col gap-4 p-4 bg-white border-2 border-black rounded-xl shadow-sm"
          key={index}
        >
          <div className="flex items-center justify-between">
            <p className="font-bold text-xl">{recipeData.recipe?.name}</p>
            <div className="flex gap-2">
              <button
                onClick={() => addFavorite(recipeData, index)}
                className={`${
                  recipeData.favorited
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-500 hover:text-blue-700"
                }`}
                disabled={recipeData.favorited}
              >
                {recipeData.favorited ? "Favorited" : "Favorite"}
              </button>
            </div>
          </div>
          {!recipeData.manualAdd && (
            <div className="flex-1 space-y-2">
              <p className="font-medium text-md inline-block bg-gray-200 rounded-md px-3 py-1 mb-2">
                Preparation Time: {recipeData.recipe?.prepTime} | Effort:{" "}
                {recipeData.recipe?.effort}
              </p>
              <div>
                <p className="font-bold mb-1">Ingredients:</p>
                <ul className="list-disc list-inside text-gray-700">
                  {recipeData.recipe?.ingredients?.map((ingredient, idx) => (
                    <li key={idx}>
                      {ingredient?.amount} {ingredient?.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-bold mb-1">Recipe:</p>
                <ol className="list-decimal list-inside text-gray-700">
                  {recipeData.recipe?.steps?.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default withAuth(MealPlan);
