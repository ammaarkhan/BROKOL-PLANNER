"use client";

import { useState, useEffect } from "react";
import { generate } from "./actions";
import { readStreamableValue } from "ai/rsc";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default function Recipes({ searchParams }) {
  const {
    mealsPerDay,
    daysPerWeek,
    prepTime,
    servingsPerMeal,
    dietaryPreferences,
    skillLevel,
  } = searchParams;

  const mealsPerWeek = mealsPerDay * daysPerWeek;

  const [outputText, setOutputText] = useState("");
  const [recipeList, setRecipeList] = useState([]);

  const prompt = `
  Output ${mealsPerWeek} recipes. Assume I have have no precooked items. Give realistic preparation times please and don't output the same recipe twice. Consider the following preferences:
    - Prep time: ${prepTime} minutes
    - Portions needed per meal: ${servingsPerMeal}
    - Dietary preferences: ${dietaryPreferences}
    - Skill level: ${skillLevel}
    Return each recipe as a separate JSON object on a new line in the format below. Output the prepTime in minutes.
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

  //   console.log("Meals per week:", mealsPerWeek);
  //   console.log("Meals per day:", mealsPerDay);
  //   console.log("Days per week:", daysPerWeek);
  //   console.log("Prep time:", prepTime);
  //   console.log("Servings per meal:", servingsPerMeal);
  //   console.log("Dietary preferences:", dietaryPreferences);
  //   console.log("Skill level:", skillLevel);

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
          console.log("Parsed recipe:", parsedRecipe);

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

  useEffect(() => {
    console.log("Updated recipe list:", recipeList);
  }, [recipeList]);

  return (
    <div>
      {recipeList.length > 0 && <RecipesView recipeStream={recipeList} />}
      {/* <div>{outputText}</div> */}
    </div>
  );
}

function RecipesView({ recipeStream }) {
  return (
    <div className="flex flex-col gap-4 mt-4 max-w-4xl mx-auto">
      {recipeStream.map((recipeData, index) => (
        <div
          className="flex flex-col gap-4 p-4 bg-white border rounded-md shadow-sm"
          key={index}
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-lg">{recipeData.recipe?.name}</p>
              <p className="font-medium text-md flex items-center">
                Preparation Time: {recipeData.recipe?.prepTime} | Effort:{" "}
                {recipeData.recipe?.effort}
              </p>
            </div>
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
        </div>
      ))}
    </div>
  );
}
