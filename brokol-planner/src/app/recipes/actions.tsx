'use server';

import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { createStreamableValue } from 'ai/rsc';
import { PartialRecipe, recipeSchema } from './schema'

export async function generateRecipes(context: string) {
    const recipesStream = createStreamableValue<PartialRecipe>();

    streamObject({
        model: openai('gpt-4-turbo'),
        system: 'You generate complete recipes for a meal planning app.',
        prompt: `Generate 4 recipes with this information: ${context}. You need to generate 4 recipes please!`,
        // prompt: 'give me 20 dish names that are easy to make and healthy',
        // prompt: 'generate recipes for greek yogurt parfait, roasted beet and quinoa salad and asian cucumber salad. reply in JSON format',
        schema: recipeSchema,
    })
        .then(async ({ partialObjectStream }) => {
            for await (const partialObject of partialObjectStream) {
                recipesStream.update(partialObject);
            }
        })
        .finally(() => {
            console.log('done');
            recipesStream.done();
        });

    return recipesStream.value;
}