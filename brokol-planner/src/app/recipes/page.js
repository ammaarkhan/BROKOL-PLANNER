"use client";

import { useState, useEffect } from "react";
import { generate } from "./actions";
import { readStreamableValue } from "ai/rsc";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default function Home() {
  const [outputText, setOutputText] = useState("");
  const [recipeList, setRecipeList] = useState([]);

  useEffect(() => {
    console.log("Updated recipe list:", recipeList);
  }, [recipeList]);

  return (
    <div>
      <button
        onClick={async () => {
          const { output } = await generate(
            `Output 3 recipes that are quick and easy to make. Return each recipe as a separate JSON object on a new line in the following format:
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
            }`
          );

          let accumulatedOutput = "";
          let partialOutput = "";

          for await (const chunk of readStreamableValue(output)) {
            accumulatedOutput += chunk;
            partialOutput += chunk;

            try {
              const parsedRecipe = JSON.parse(partialOutput);
              console.log("Parsed recipe:", parsedRecipe);

              setRecipeList((prevRecipeList) => [
                ...prevRecipeList,
                parsedRecipe,
              ]);

              partialOutput = "";
            } catch (error) {
              // Ignore parsing errors until the data is fully accumulated
            }

            setOutputText(accumulatedOutput);
          }
        }}
      >
        Ask
      </button>
      {recipeList.length > 0 && <RecipesView recipeStream={recipeList} />}
      {/* <div>{outputText}</div> */}
    </div>
  );
}

function RecipesView({ recipeStream }) {
  return (
    <div className="flex flex-col gap-4 mt-4">
      {recipeStream.map((recipeData, index) => (
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
