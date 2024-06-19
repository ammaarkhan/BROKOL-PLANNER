"use client";

import { StreamableValue, useStreamableValue } from "ai/rsc";
import { useState } from "react";
import { generateRecipes } from "./actions";
import { PartialRecipe } from "./schema";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export default function Page() {
  const [recipeStream, setRecipeStream] = useState();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 m-4">
      <button
        className="px-4 py-2 mt-4 text-white bg-blue-500 rounded-md"
        onClick={async () => {
          const generatedRecipes = await generateRecipes(
            "Easy, simple recipes for beginners"
          );
          console.log("Generated Recipes:", generatedRecipes);
          setRecipeStream(generatedRecipes);
        }}
      >
        Generate Recipes
      </button>

      {recipeStream && <RecipesView recipeStream={recipeStream} />}
    </div>
  );
}

// separate component to display recipes that received the streamable value:
function RecipesView({ recipeStream }) {
  const [data, pending, error] = useStreamableValue(recipeStream);
  console.log("Number of recipes:", data?.recipes?.length);
  return (
    <div className="flex flex-col gap-4 mt-4">
      {data?.recipes?.map((recipeData, index) => (
        <div
          className="flex flex-col gap-4 p-4 bg-gray-100 rounded-md dark:bg-gray-800"
          key={index}
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-lg">{recipeData.recipe?.name}</p>
              <p className="font-medium text-md">
                {recipeData.recipe?.prepTime}
              </p>
              <p className="font-medium text-md">{recipeData.recipe?.effort}</p>
            </div>
            <div>
              <p className="font-medium">Ingredients:</p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                {recipeData.recipe?.ingredients?.map((ingredient, idx) => (
                  <li key={idx}>
                    {ingredient?.amount} {ingredient?.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">Steps:</p>
              <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300">
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
