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
  const [loading, setLoading] = useState(true);
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
        } finally {
          setLoading(false);
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
    <div className="flex flex-col items-center my-4 min-h-screen">
      <h1 className="text-2xl mb-4 font-bold text-center mt-10">
        Select Your Favorite Recipes
      </h1>
      <p className="flex justify-center text-lg text-center px-4">
        Select your favorite recipes that you would like to include in this
        week&apos;s meal plan.
      </p>
      {loading ? (
        <p className="flex justify-center text-lg mt-10">
          Loading favorite recipes... please wait :)
        </p>
      ) : favorites.length > 0 ? (
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
              className="bg-black text-white py-2 px-4 rounded-lg mt-3"
              onClick={handleNextClick}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-2xl mt-20 flex-grow">
          <p className="flex justify-center text-lg text-center px-4 mb-4 font-semibold">
            Oh no, you have no favorite recipes yet!
          </p>
          <p className="flex justify-center text-md text-center px-4">
            You can favorite recipes on the next page, or in the saved meal plan
            page, those recipes will show up here next time!
          </p>
          <div className="flex justify-center gap-4 my-4 mt-20">
            <button
              className="bg-black text-white py-2 px-4 rounded-lg"
              onClick={handleNextClick}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(SelectFavRecipes);
