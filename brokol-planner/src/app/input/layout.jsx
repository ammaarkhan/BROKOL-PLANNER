"use client";

import React, { useState } from "react";
import Link from "next/link";
import withAuth from "../firebase/withAuth";
import { auth } from "../../config/firebase";
import { signOut } from "firebase/auth";

const Layout = () => {
  const [formData, setFormData] = useState({
    mealsPerDay: "",
    daysPerWeek: "",
    prepTime: "",
    servingsPerMeal: "",
    dietaryPreferences: "",
    skillLevel: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      {/* <button onClick={() => signOut(auth)}>Log out</button> */}
      <form onSubmit={handleSubmit} className="bg-white p-8 w-full max-w-3xl">
        {/*to show the border shadow, use shadow-md*/}
        <h1 className="text-2xl font-bold mb-6 text-center">Meal Planner</h1>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block mb-4">
              <span className="font-bold">1. How many meals per day?</span>
              <input
                type="number"
                name="mealsPerDay"
                value={formData.mealsPerDay}
                onChange={handleChange}
                className="h-8 pl-3 border border-gray-300 mt-2 block w-full rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Input a number"
              />
            </label>

            <label className="block mb-4">
              <span className="font-bold">
                2. How many days a week do you cook?
              </span>
              <input
                type="number"
                name="daysPerWeek"
                value={formData.daysPerWeek}
                onChange={handleChange}
                className="h-8 pl-3 border mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Input a number"
              />
            </label>

            <label className="block mb-4">
              <span className="font-bold">
                3. How much time can you spend on meal preparation? (in minutes)
              </span>
              <input
                type="number"
                name="prepTime"
                value={formData.prepTime}
                onChange={handleChange}
                className="h-8 pl-3 border mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Input a number"
              />
            </label>

            <label className="block mb-4">
              <span className="font-bold">4. How many servings per meal?</span>
              <input
                type="number"
                name="servingsPerMeal"
                value={formData.servingsPerMeal}
                onChange={handleChange}
                className="h-8 pl-3 border mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Input a number"
              />
            </label>
          </div>

          <div>
            <label className="block mb-4">
              <span className="font-bold">
                5. What are your dietary preferences?
              </span>
              <textarea
                type="text"
                name="dietaryPreferences"
                value={formData.dietaryPreferences}
                onChange={handleChange}
                className="pl-3 pt-1 border mt-2 block w-full h-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 "
                placeholder="e.g. Halal food, vegetarian, etc"
              />
            </label>

            <div className="block mb-4">
              <span className="font-bold">
                6. What is your cooking skill level?
              </span>
              <div className="mt-2 flex flex-col">
                <label className="inline-flex items-center ml-5 mb-2">
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
                <label className="inline-flex items-center ml-5 mb-2">
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
                <label className="inline-flex items-center ml-5">
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
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="mt-6 py-2 px-4 bg-black text-white font-semibold rounded-md shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Link
              href={{
                pathname: "/recipes",
                query: formData,
              }}
            >
              Submit
            </Link>
          </button>
        </div>
      </form>
    </div>
  );
};

export default withAuth(Layout);
