import { DeepPartial } from 'ai';
import { z } from 'zod';

// define a schema for the recipes
export const recipeSchema = z.object({
    recipes: z.array(
        z.object({
            recipe: z.object({
                name: z.string(),
                prepTime: z.string(),
                effort: z.string(),
                ingredients: z.array(
                    z.object({
                        name: z.string(),
                        amount: z.string(),
                    }),
                ),
                steps: z.array(z.string()),
            }),
        }),
    ),
});

// define a type for the partial recipes during generation
export type PartialRecipe = DeepPartial<
    z.infer<typeof recipeSchema>
>;