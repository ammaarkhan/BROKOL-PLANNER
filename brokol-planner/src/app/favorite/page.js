"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import withAuth from "../firebase/withAuth";
import useLogPage from "../hooks/useLogPage";
import { analytics } from "../../config/firebase";
import { logEvent } from "firebase/analytics";

function Favorite() {
  useLogPage();
  const [uid, setUid] = useState(null);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [newFavoriteRecipe, setNewFavoriteRecipe] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (uid) {
      const fetchFavoriteRecipes = async () => {
        const favoritesRef = collection(db, `users/${uid}/favorites`);
        const favoritesSnapshot = await getDocs(favoritesRef);
        const favorites = favoritesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFavoriteRecipes(favorites);
      };

      fetchFavoriteRecipes();
    }
  }, [uid]);

  const removeFavoriteRecipe = async (recipeId) => {
    if (
      window.confirm("Are you sure you want to delete this favorite recipe?")
    ) {
      try {
        await deleteDoc(doc(db, `users/${uid}/favorites/${recipeId}`));
        logEvent(analytics, "remove_favorite_recipe");
        setFavoriteRecipes(
          favoriteRecipes.filter((recipe) => recipe.id !== recipeId)
        );
      } catch (error) {
        console.error("Error deleting favorite recipe:", error);
        alert("Failed to delete favorite recipe.");
      }
    }
  };

  const addFavoriteRecipe = async () => {
    if (newFavoriteRecipe.trim() === "") {
      alert("Please enter a recipe name.");
      return;
    }

    try {
      const favoritesRef = collection(db, `users/${uid}/favorites`);
      await addDoc(favoritesRef, {
        recipe: { name: newFavoriteRecipe },
        manualAdd: true,
      });
      setFavoriteRecipes([
        ...favoriteRecipes,
        { recipe: { name: newFavoriteRecipe }, manualAdd: true },
      ]);
      setNewFavoriteRecipe("");
    } catch (error) {
      console.error("Error adding favorite recipe:", error);
      alert("Failed to add favorite recipe.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white relative">
      <h1 className="text-4xl mb-4 font-bold text-center mt-10">
        Favorite Recipes
      </h1>
      <div className="flex w-full max-w-6xl mt-4">
        <div className="w-4/6 pr-4">
          {favoriteRecipes.length > 0 ? (
            <FavoriteRecipesView
              recipeStream={favoriteRecipes}
              removeRecipe={removeFavoriteRecipe}
            />
          ) : (
            <p className="flex justify-center text-lg mt-10">
              Your favorited recipes will be listed here. You can favorite
              generated recipes or manually add recipes to the favorite list.
            </p>
          )}
        </div>
        <div className="w-2/6 pl-4">
          <div className="mt-4 bg-white border-2 border-black rounded-xl text-center px-4 py-4">
            <h2 className="text-xl mb-4 font-bold">Add your favorite recipe</h2>
            <input
              type="text"
              value={newFavoriteRecipe}
              onChange={(e) => setNewFavoriteRecipe(e.target.value)}
              placeholder="Your favorite recipe name"
              className="w-full p-2 mb-4 border-2 border-black rounded-lg"
            />
            <button
              onClick={addFavoriteRecipe}
              className="w-full bg-black text-white py-2 px-4 rounded-lg"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FavoriteRecipesView({ recipeStream, removeRecipe }) {
  return (
    <div className="flex flex-col gap-4 mt-4 mb-4">
      {recipeStream.map((recipeData, index) => (
        <div
          className="flex flex-col gap-4 p-4 bg-white border-2 border-black rounded-xl shadow-sm"
          key={index}
        >
          <div className="flex items-center justify-between">
            <p className="font-bold text-xl">{recipeData.recipe?.name}</p>
            <button
              onClick={() => removeRecipe(recipeData.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
          {!recipeData.manualAdd && (
            <div className="flex-1">
              <p className="font-medium text-md inline-block bg-gray-200 rounded-md px-3 py-1 mb-2">
                Preparation Time: {recipeData.recipe?.prepTime} | Effort:{" "}
                {recipeData.recipe?.effort}
              </p>
              <div className="mb-2">
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

export default withAuth(Favorite);
