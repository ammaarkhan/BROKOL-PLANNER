"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import withAuth from "../firebase/withAuth";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import useLogPage from "../hooks/useLogPage";

function SelectFavRecipes({ searchParams }) {
  useLogPage();

  const [favorites, setFavorites] = useState([]);
  const [selectedFavorites, setSelectedFavorites] = useState([]);
  const [uid, setUid] = useState(null);
  const router = useRouter();

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
    if (uid) {
      const fetchFavorites = async () => {
        try {
          const favoritesRef = collection(db, `users/${uid}/favorites`);
          const snapshot = await getDocs(favoritesRef);
          const favoriteRecipes = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFavorites(favoriteRecipes);
        } catch (error) {
          console.error("Error fetching favorite recipes: ", error);
        }
      };

      fetchFavorites();
    }
  }, [uid]);

  const handleCheckboxChange = (recipeId) => {
    setSelectedFavorites((prevSelected) =>
      prevSelected.includes(recipeId)
        ? prevSelected.filter((id) => id !== recipeId)
        : [...prevSelected, recipeId]
    );
  };

  const handleNextClick = () => {
    const selectedRecipes = favorites
      .filter((recipe) => selectedFavorites.includes(recipe.id))
      .map((recipe) => recipe.recipe.name);

    // Fetch existing URL search parameters
    const currentParams = new URLSearchParams(window.location.search);

    // Add favoriteRecipes as a JSON-encoded string
    currentParams.set("favoriteRecipes", JSON.stringify(selectedRecipes));

    router.push(`/recipes?${currentParams.toString()}`);
  };

  return (
    <div className="flex flex-col items-center my-4">
      <h1 className="text-2xl mb-4 font-bold text-center mt-10">
        Select Your Favorite Recipes
      </h1>
      <p className="flex justify-center text-lg">
        Select your favorite recipes that you would like to include in this
        week&apos;s meal plan.
      </p>
      {favorites.length > 0 ? (
        <div className="flex flex-col w-full max-w-4xl mt-6">
          <div className="w-full flex justify-center">
            <ul className="bg-white p-4 border-2 border-black rounded-xl shadow-sm">
              {favorites.map((recipe) => (
                <li key={recipe.id} className="my-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      value={recipe.id}
                      onChange={() => handleCheckboxChange(recipe.id)}
                      className="mr-2"
                    />
                    {recipe.recipe.name}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center gap-4 my-4">
            <button
              className="bg-black text-white py-2 px-4 rounded-lg"
              onClick={handleNextClick}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <p className="flex justify-center text-lg mt-10">
          Loading favorite recipes... please wait :)
        </p>
      )}
    </div>
  );
}

export default withAuth(SelectFavRecipes);
