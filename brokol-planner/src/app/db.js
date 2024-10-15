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

  const ingredients = recipeList
    .map((recipe) => {
      const servings = recipe.servings || 1; // Default to 1 serving if not provided
      return recipe.recipe.ingredients.map((ingredient) => {
        const amount = parseFloat(ingredient.amount) * servings; // Adjust the amount based on servings
        return { ...ingredient, amount: amount }; // Don't fix the decimal places
      });
    })
    .flat();


  // Check if there are any ingredients
  if (ingredients.length === 0) {
    await updateDoc(doc(db, `users/${uid}/mealPlans/${mealPlanId}`), {
      recipes: recipeList,
      shoppingList: [], // Set shopping list to an empty array if no ingredients
    });
    return;
  }

  const ingredientList = ingredients
    .map((ingredient) => `${ingredient.name} (${ingredient.amount})`)
    .join(", ");
    const prompt = `Generate a shopping list with the added up quantity in imperial only for the following ingredients: ${ingredientList}. Return it as a JSON object in the format below:
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

  await updateDoc(doc(db, `users/${uid}/mealPlans/${mealPlanId}`), {
    recipes: recipeList,
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
