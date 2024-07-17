"use client";

import { useState, useEffect } from "react";
import { generate } from "./actions";
import { readStreamableValue } from "ai/rsc";
import {
  saveMealPlanMetadata,
  saveRecipesAndShoppingList,
  addFavoriteRecipe,
} from "../db";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import withAuth from "../firebase/withAuth";
import useLogPage from "../hooks/useLogPage";
import { analytics } from "../../config/firebase";
import { logEvent } from "firebase/analytics";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function Recipes({ searchParams }) {
  useLogPage();

  const {
    mealsPerDay,
    daysPerWeek,
    prepTime,
    servingsPerMeal,
    dietaryPreferences,
    weeklyFeeling,
    skillLevel,
  } = searchParams;

  const router = useRouter();

  const mealsPerWeek = mealsPerDay * daysPerWeek;

  const [outputText, setOutputText] = useState("");
  const [recipeList, setRecipeList] = useState([]);
  const [deletedRecipes, setDeletedRecipes] = useState([]);
  const [recipeNames, setRecipeNames] = useState([]);
  const [uid, setUid] = useState(null);
  const [moreRecipesLoading, setMoreRecipesLoading] = useState(false);
  const [mealPlanLoading, setMealPlanLoading] = useState(false);
  const [preferences, setPreferences] = useState("");

  const prompt = `
  Output ${mealsPerWeek} recipes. Assume I have have no precooked items. Give realistic preparation times please and don't output the same recipe twice. Consider the following preferences:
    - Prep time: ${prepTime} minutes
    - Portions needed per meal: ${servingsPerMeal}
    - Dietary preferences: ${dietaryPreferences}
    - Weekly feeling: ${weeklyFeeling}
    - Skill level: ${skillLevel}
    Return each recipe as a separate JSON object on a new line in the format below. Output the prepTime in minutes. Do not wrap the json codes in JSON markers.
    {
        "recipe": {
        "name": "string",
        "prepTime": "string",
        "effort": "string",
        "ingredients": [
            {
            "name": "string",
            "amount": "string"
            }
        ],
        "steps": [
            "string"
        ]
        }
    }`;

  const promptTwo = `
    Output 3 more recipes for my week, I currently have ${recipeNames}. These are recipes I removed: ${deletedRecipes}. Assume I have have no precooked items. Give realistic preparation times please and don't output the same recipe twice. Consider the following preferences:
    - Prep time: ${prepTime} minutes
    - Portions needed per meal: ${servingsPerMeal}
    - Dietary preferences: ${dietaryPreferences}
    - Weekly feeling: ${weeklyFeeling}
    - Skill level: ${skillLevel}
    Tailor the 3 new recipes to include: ${
      preferences || "no specific preferences provided"
    }
    Return each recipe as a separate JSON object on a new line in the format below. Output the prepTime in minutes. Do not wrap the json codes in JSON markers.
    {
        "recipe": {
        "name": "string",
        "prepTime": "string",
        "effort": "string",
        "ingredients": [
            {
            "name": "string",
            "amount": "string"
            }
        ],
        "steps": [
            "string"
        ]
        }
    }`;

  const handlePreferencesChange = (e) => {
    setPreferences(e.target.value);
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      const { output } = await generate(prompt);

      let accumulatedOutput = "";
      let partialOutput = "";

      for await (const chunk of readStreamableValue(output)) {
        accumulatedOutput += chunk;
        partialOutput += chunk;

        try {
          const parsedRecipe = JSON.parse(partialOutput);
          setRecipeList((prevRecipeList) => [...prevRecipeList, parsedRecipe]);
          partialOutput = "";
        } catch (error) {
          // Ignore parsing errors until the data is fully accumulated
        }

        setOutputText(accumulatedOutput);
      }
    };

    fetchRecipes();
  }, []);

  const handleGenerateRecipes = async () => {
    logEvent(analytics, "more_recipes");
    setMoreRecipesLoading(true);
    try {
      const { output } = await generate(promptTwo);

      let accumulatedOutput = "";
      let partialOutput = "";

      for await (const chunk of readStreamableValue(output)) {
        accumulatedOutput += chunk;
        partialOutput += chunk;

        try {
          const parsedRecipe = JSON.parse(partialOutput);
          setRecipeList((prevRecipeList) => [...prevRecipeList, parsedRecipe]);
          partialOutput = "";
        } catch (error) {
          // Ignore parsing errors until the data is fully accumulated
        }

        setOutputText(accumulatedOutput);
      }
    } catch (error) {
      console.error("Error generating more recipes:", error);
    } finally {
      setMoreRecipesLoading(false);
    }
  };

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
    console.log("Updated recipe list:", recipeList);

    const names = recipeList.map((recipe) => recipe.recipe.name);
    setRecipeNames(names);
    // console.log("Recipe names:", names);
  }, [recipeList]);

  const saveMeals = async () => {
    logEvent(analytics, "save_mealplan");
    setMealPlanLoading(true);
    try {
      const mealPlanId = await saveMealPlanMetadata(uid);
      router.push("/mealplan");

      // Save the recipes and shopping list asynchronously
      await saveRecipesAndShoppingList(uid, mealPlanId, recipeList);
    } catch (error) {
      console.error("Error saving meal plan:", error);
      alert("Failed to save meal plan.");
    } finally {
      setMealPlanLoading(false);
    }
  };

  const removeRecipe = (index) => {
    logEvent(analytics, "recipe_removed");
    setDeletedRecipes((prevDeletedRecipes) => [
      ...prevDeletedRecipes,
      recipeList[index].recipe.name,
    ]);
    setRecipeList((prevRecipeList) =>
      prevRecipeList.filter((_, i) => i !== index)
    );
  };

  const addFavorite = async (recipeData, index) => {
    logEvent(analytics, "recipe_favorited");
    try {
      await addFavoriteRecipe(uid, recipeData);

      setRecipeList((prevRecipeList) =>
        prevRecipeList.map((recipe, i) =>
          i === index ? { ...recipe, favorited: true } : recipe
        )
      );

      alert("Recipe added to favorites! You can access it from the home page.");
    } catch (error) {
      console.error("Error adding favorite recipe:", error);
      alert("Failed to add favorite recipe.");
    }
  };

  return (
    <div className="flex flex-col items-center my-4">
      <h1 className="text-4xl mb-4 font-bold text-center mt-10">
        Edit Your Meal Plan
      </h1>
      {recipeList.length > 0 ? (
        <div className="flex w-full max-w-6xl">
          <div className="w-4/6 pr-4">
            <RecipesView
              recipeStream={recipeList}
              removeRecipe={removeRecipe}
              addFavorite={addFavorite}
            />
            {moreRecipesLoading && (
              <p className="flex justify-center text-md mt-3">
                More recipes loading... lemme see what i can find for you :)
              </p>
            )}
            {mealPlanLoading ? (
              <div className="text-center my-4">
                Generating meal plan... give me a sec - its my first day on the
                job!
              </div>
            ) : (
              <div className="flex justify-center gap-4 my-4">
                <button
                  className="bg-black text-white py-2 px-4 rounded-lg"
                  onClick={saveMeals}
                >
                  &rarr; Save Meal Plan
                </button>
              </div>
            )}
          </div>
          <div className="w-2/6 pl-4">
            <div className="mt-4 bg-white p-4 border-2 border-black rounded-xl shadow-sm w-full text-center">
              <p className="font-bold mb-2">
                Missing something? Enter your preferences. (Leave blank for
                recipe suggestions based on initial input)
              </p>
              <textarea
                value={preferences}
                onChange={handlePreferencesChange}
                className="pl-3 pt-1 border mt-2 block w-full h-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="e.g. Give me more recipes that share ingredients with the recipes I currently have. I want a snack I can make quickly."
              />
              <button
                onClick={handleGenerateRecipes}
                className="mt-2 py-2 px-4 bg-black w-full  text-white font-semibold rounded-md shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Generate 3 Recipes
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="flex justify-center text-lg mt-10">
          Recipes loading... I promise I do not take too long :)
        </p>
      )}
    </div>
  );
}

function RecipesView({ recipeStream, removeRecipe, addFavorite }) {
  return (
    <div className="flex flex-col gap-4 mt-4 max-w-4xl mx-auto">
      {recipeStream.map((recipeData, index) => (
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
              <button
                onClick={() => removeRecipe(index)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
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
        </div>
      ))}
    </div>
  );
}

export default withAuth(Recipes);
