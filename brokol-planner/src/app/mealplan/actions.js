"use server";

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function generateShoppingList(input) {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    prompt: input,
  });
  return text;
}
