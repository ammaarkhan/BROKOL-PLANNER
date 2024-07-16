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
    .map((recipe) => recipe.recipe.ingredients)
    .flat();
  const ingredientList = ingredients
    .map((ingredient) => `${ingredient.name} (${ingredient.amount})`)
    .join(", ");
  const prompt = `Generate a shopping list with the added up quantity in imperial only for the following ingredients: ${ingredientList}. Return it as a JSON object in the format below:
    [ 
      { 
        "name": "string",
        "amount": "string"
      },
    ]`;

  const output = await generateShoppingList(prompt);
  const cleanedOutput = output.replace(/```json|```/g, "").trim();
  console.log("Cleaned output:", cleanedOutput);
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

  const favoritesRef = collection(db, `users/${uid}/favorites`);
  await addDoc(favoritesRef, recipe);
};

export { saveMealPlanMetadata, saveRecipesAndShoppingList, addFavoriteRecipe };
