import { z } from "zod";

export const getRecipesSchema = z.object({
  search: z.string(),
  filters: z.object({
    ingredientsInclude: z.string().array(),
    ingredientsExclude: z.string().array(),
    nationalitiesInclude: z.string().array(),
    nationalitiesExclude: z.string().array(),
    prepTimeMin: z.number(),
    prepTimeMax: z.number(),
    cookTimeMin: z.number(),
    cookTimeMax: z.number(),
    rating: z.number().min(0).max(5),
  }),
});
export type GetRecipe = z.infer<typeof getRecipesSchema>;

export const getRecipeSchema = z.object({
  recipeId: z.string(),
});

export const addRecipeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  imageMetadata: z.object({
    name: z.string({ required_error: "Image is required" }),
    type: z.string({ invalid_type_error: "Image format not supported" }),
    size: z.number({ invalid_type_error: "Image too big" }),
  }),
  ingredients: z
    .object({
      id: z.string(),
      order: z.number().int(),
      name: z.string().trim().min(1, { message: "Can't be empty string" }),
      isHeader: z.boolean(),
    })
    .array(),
  steps: z
    .object({
      id: z.string(),
      order: z.number().int(),
      name: z.string().trim().min(1, { message: "Can't be empty string" }),
      isHeader: z.boolean(),
    })
    .array(),
  prepTime: z.string().length(0).or(z.number().min(0)).or(z.nan()),
  cookTime: z.string().length(0).or(z.number().min(0)).or(z.nan()),
  isPublic: z.boolean(),
  mealTypes: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .array(),
  nationalities: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .array(),
  cookingMethods: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .array(),
});
export type addRecipe = z.infer<typeof addRecipeSchema>;
