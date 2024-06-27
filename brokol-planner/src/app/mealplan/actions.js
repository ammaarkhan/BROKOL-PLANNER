"use server";

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function generateShoppingList(input) {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    prompt: input,
  });

  console.log("Generated text:", text);
  return text;
}
