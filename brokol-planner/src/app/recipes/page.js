"use client";

import { useState, useEffect } from "react";
import { generate } from "./actions";
import { readStreamableValue } from "ai/rsc";
import { saveMealPlanMetadata, saveRecipesAndShoppingList } from "../db";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import withAuth from "../firebase/withAuth";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function Recipes({ searchParams }) {
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
  const [recipeNames, setRecipeNames] = useState([]);
  const [uid, setUid] = useState(null);
  const [moreRecipesLoading, setMoreRecipesLoading] = useState(false);
  const [mealPlanLoading, setMealPlanLoading] = useState(false);

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
    Output 3 more recipes for my week, I currently have ${recipeNames}. Assume I have have no precooked items. Give realistic preparation times please and don't output the same recipe twice. Consider the following preferences:
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
          //   console.log("Parsed recipe:", parsedRecipe);

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

  const moreRecipes = async () => {
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
    setRecipeList((prevRecipeList) =>
      prevRecipeList.filter((_, i) => i !== index)
    );
  };

  return (
    <div>
      <h1 className="text-4xl mb-4 font-bold text-center mt-10">Recipes</h1>
      {recipeList.length > 0 ? (
        <>
          <RecipesView recipeStream={recipeList} removeRecipe={removeRecipe} />
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
                onClick={moreRecipes}
              >
                + More Recipes!
              </button>
              <button
                className="bg-black text-white py-2 px-4 rounded-lg"
                onClick={saveMeals}
              >
                &rarr; Save Meal Plan
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="flex justify-center text-lg mt-10">
          Recipes loading... I promise I do not take too long :)
        </p>
      )}
    </div>
  );
}

function RecipesView({ recipeStream, removeRecipe }) {
  return (
    <div className="flex flex-col gap-4 mt-4 max-w-4xl mx-auto">
      {recipeStream.map((recipeData, index) => (
        <div
          className="flex flex-col gap-4 p-4 bg-white border-2 border-black rounded-xl shadow-sm"
          key={index}
        >
          <div className="flex items-center justify-between">
            <p className="font-bold text-xl">{recipeData.recipe?.name}</p>
            <button
              onClick={() => removeRecipe(index)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
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
