"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import withAuth from "../firebase/withAuth";
import { auth, db } from "../../config/firebase";
import { signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import useLogPage from "../hooks/useLogPage";

function Input() {
  const router = useRouter();

  useLogPage();

  const [formData, setFormData] = useState({
    breakfastMealsPerWeek: "",
    lunchDinnerMealsPerWeek: "",
    servingsPerMeal: "",
    prepTime: "",
    skillLevel: "",
    dietaryPreferences: [],
    weeklyFeeling: "",
    selectFavRecipes: "",
  });

  const [uid, setUid] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUid(user.uid);
        fetchUserData(user.uid);
      } else {
        setUid(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const docRef = doc(db, `users/${uid}/input/formData`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(docSnap.data());
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };

  const dietaryPreferenceOptions = [
    "Vegan",
    "Vegetarian",
    "Halal",
    "Gluten-free",
    "Dairy-free",
    "Low-carb",
    "Paleo",
    "Keto",
    "Pescatarian",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => {
      if (checked) {
        return {
          ...prevData,
          dietaryPreferences: [...prevData.dietaryPreferences, value],
        };
      } else {
        return {
          ...prevData,
          dietaryPreferences: prevData.dietaryPreferences.filter(
            (v) => v !== value
          ),
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uid) {
      try {
        const docRef = doc(db, `users/${uid}/input/formData`);
        await setDoc(docRef, formData);

        // Convert formData to query string
        const params = new URLSearchParams({
          ...formData,
          dietaryPreferences: formData.dietaryPreferences.join(", "), // To convert from array to string
        }).toString();
        if (formData.selectFavRecipes === "Yes") {
          router.push(`/selectfavrecipe?${params}`);
        } else {
          router.push(`/recipes?${params}`);
        }
      } catch (error) {
        console.error("Error saving data: ", error);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <form onSubmit={handleSubmit} className="bg-white p-8 w-full max-w-3xl">
        {/* <button onClick={() => signOut(auth)}>Log out</button> */}
        <h1 className="text-2xl font-bold mb-6 text-center">Meal Planner</h1>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block mb-4">
              <span className="font-bold">1. How many meals per week?</span>
              <div className="mt-2">
                <div className="flex items-center mb-2">
                  <span className="ml-4 mr-11 font-bold">Breakfast</span>
                  <input
                    type="number"
                    name="breakfastMealsPerWeek"
                    value={formData.breakfastMealsPerWeek}
                    onChange={handleChange}
                    className="h-8 pl-3 border border-gray-300 block w-40 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="Input a number"
                  />
                </div>
                <div className="flex items-center">
                  <span className="ml-4 mr-4 font-bold">Lunch/dinner</span>
                  <input
                    type="number"
                    name="lunchDinnerMealsPerWeek"
                    value={formData.lunchDinnerMealsPerWeek}
                    onChange={handleChange}
                    className="h-8 pl-3 border border-gray-300 block w-40 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="Input a number"
                  />
                </div>
              </div>
            </label>

            <label className="block mb-4">
              <span className="font-bold">2. How many servings per meal?</span>
              <input
                type="number"
                name="servingsPerMeal"
                value={formData.servingsPerMeal}
                onChange={handleChange}
                className="ml-4 h-8 pl-3 border mt-2 block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Input a number"
              />
            </label>

            <div className="mb-4 grid-rows-4">
              <span className="font-bold">
                3. How much time can you spend on meal &emsp;&nbsp;preparation?
              </span>
              <div className="mt-2 ml-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="prepTime"
                    value="Less than 15 minutes"
                    checked={formData.prepTime === "Less than 15 minutes"}
                    onChange={handleChange}
                    className="form-radio"
                  />
                  <span className="ml-2">Less than 15 minutes</span>
                </label>
              </div>
              <div className="mt-2 ml-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="prepTime"
                    value="15 to 30 minutes"
                    checked={formData.prepTime === "15 to 30 minutes"}
                    onChange={handleChange}
                    className="form-radio"
                  />
                  <span className="ml-2">15 to 30 minutes</span>
                </label>
              </div>
              <div className="mt-2 ml-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="prepTime"
                    value="30 to 60 minutes"
                    checked={formData.prepTime === "30 to 60 minutes"}
                    onChange={handleChange}
                    className="form-radio"
                  />
                  <span className="ml-2">30 to 60 minutes</span>
                </label>
              </div>
              <div className="mt-2 ml-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="prepTime"
                    value="More than 60 minutes"
                    checked={formData.prepTime === "More than 60 minutes"}
                    onChange={handleChange}
                    className="form-radio"
                  />
                  <span className="ml-2">More than 60 minutes</span>
                </label>
              </div>
            </div>

            <span className="font-bold">
              4. What is your cooking skill level?
            </span>
            <div className="mt-2 ml-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="skillLevel"
                  value="Beginner"
                  checked={formData.skillLevel === "Beginner"}
                  onChange={handleChange}
                  className="form-radio"
                />
                <span className="ml-2">Beginner</span>
              </label>
            </div>
            <div className="mt-2 ml-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="skillLevel"
                  value="Intermediate"
                  checked={formData.skillLevel === "Intermediate"}
                  onChange={handleChange}
                  className="form-radio"
                />
                <span className="ml-2">Intermediate</span>
              </label>
            </div>
            <div className="mt-2 ml-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="skillLevel"
                  value="Advanced"
                  checked={formData.skillLevel === "Advanced"}
                  onChange={handleChange}
                  className="form-radio"
                />
                <span className="ml-2">Advanced</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block mb-4">
              <span className="font-bold">
                5. What are your dietary preferences?
              </span>
              <div className="mt-2 grid grid-cols-3 gap-1">
                {dietaryPreferenceOptions.map((preference) => (
                  <label key={preference} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="dietaryPreferences"
                      value={preference}
                      checked={formData.dietaryPreferences.includes(preference)}
                      onChange={handleCheckboxChange}
                      className="form-checkbox"
                    />
                    <span className="ml-2">{preference}</span>
                  </label>
                ))}
              </div>
            </label>
            <label className="block mb-4">
              <span className="font-bold">
                6. What&apos;s your food mood this week?
              </span>
              <p className="ml-5">
                Include any ingredients you might have, cravings, dietary
                preferences, allergens, preferred cuisines, cooking techniques,
                shopping volume, or anything else!
              </p>
              <textarea
                name="weeklyFeeling"
                value={formData.weeklyFeeling}
                onChange={handleChange}
                className="ml-3 pl-3 pt-1 border mt-2 block w-80 h-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="e.g. I want to eat healthy this week. I have some pasta and mushrooms at home. I’m craving spicy and vegetarian food, looking for kid-friendly options, and planning a special dinner on Friday."
              />
            </label>
            <div className="block mb-4 mt-6">
              <span className="font-bold">
                7. Would you like to include your favorite
                &nbsp;&nbsp;&nbsp;&nbsp;recipes? (Select on the next page)
              </span>
              <div className="ml-4 mt-2 flex space-x-8">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="selectFavRecipes"
                    value="Yes"
                    checked={formData.selectFavRecipes === "Yes"}
                    onChange={handleChange}
                    className="form-radio"
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="selectFavRecipes"
                    value="No"
                    checked={formData.selectFavRecipes === "No"}
                    onChange={handleChange}
                    className="form-radio"
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="py-2 px-4 bg-black text-white font-semibold rounded-md shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default withAuth(Input);
