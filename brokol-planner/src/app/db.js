import { db } from "../config/firebase";
import { addDoc, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { generateShoppingList } from "./mealplan/actions";

const saveMealPlanMetadata = async (uid) => {
  if (!uid) {
    throw new Error("User is not authenticated!");
  }

  const userDocRef = doc(db, `users/${uid}`);
  await setDoc(userDocRef, {}, { merge: true });

  const mealPlanRef = collection(db, `users/${uid}/mealPlans`);
  const dateAdded = new Date().toISOString();

  const mealPlanDoc = await addDoc(mealPlanRef, { dateAdded });
  return mealPlanDoc.id;
};

const saveRecipesAndShoppingList = async (uid, mealPlanId, recipeList) => {
  if (!uid) {
    throw new Error("User is not authenticated!");
  }

  // Add servings to the recipeList to be saved
  const recipesWithServings = recipeList.map((recipe) => ({
    ...recipe,
    servings: recipe.servings || 1, // Ensure that servings are saved with each recipe
  }));

  // Adjust the ingredients based on the servings
  const ingredients = recipesWithServings
    .map((recipe) => {
      const servings = recipe.servings || 1; // Use the servings value from each recipe
      return recipe.recipe.ingredients.map((ingredient) => {
        const amount = parseFloat(ingredient.amount) * servings; // Adjust the ingredient amount based on servings
        return { ...ingredient, amount: amount }; // Ensure amounts are saved correctly
      });
    })
    .flat();

  // Check if there are any ingredients
  if (ingredients.length === 0) {
    await updateDoc(doc(db, `users/${uid}/mealPlans/${mealPlanId}`), {
      recipes: recipesWithServings, // Save the recipes with servings
      shoppingList: [], // Set shopping list to an empty array if no ingredients
    });
    return;
  }

  const ingredientList = ingredients
    .map((ingredient) => `${ingredient.name} (${ingredient.amount})`)
    .join(", ");
  
  // Ensure that the prompt generates a shopping list in the required format
  const prompt = `Generate a shopping list with the added up quantity in metric only for the following ingredients: ${ingredientList}. Return it as a JSON object in the format below:
      [ 
        { 
          "name": "string",
          "amount": "string",
          "category": "string"
        },
      ]
      The category should be one of these 6 options: "Produce (Fruit & Vegetables)", "Meat & Seafood", "Dairy & Eggs", "Bakery & Bread", "Dry Goods & Canned Foods", "Other".
      `;

  const output = await generateShoppingList(prompt);
  const cleanedOutput = output.replace(/```json|```/g, "").trim();
  const shoppingList = JSON.parse(cleanedOutput);

  // Save the updated meal plan, including recipes and the generated shopping list
  await updateDoc(doc(db, `users/${uid}/mealPlans/${mealPlanId}`), {
    recipes: recipesWithServings, // Save the recipes with servings included
    shoppingList,
  });
};


const addFavoriteRecipe = async (uid, recipe) => {
  if (!uid) {
    throw new Error("User is not authenticated!");
  }

  const recipeWithFavorite = { ...recipe, favorited: true };

  const favoritesRef = collection(db, `users/${uid}/favorites`);
  await addDoc(favoritesRef, recipeWithFavorite);
};

export { saveMealPlanMetadata, saveRecipesAndShoppingList, addFavoriteRecipe };
