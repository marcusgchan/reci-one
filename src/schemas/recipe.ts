import { z } from "zod";
import {
  DEFAULT_MEAL_TYPES,
  DEFAULT_NATIONALITIES,
  DEFAULT_COOKING_METHODS,
} from "@/prisma/data";

export const getRecipesSchema = z.object({
  search: z.string(),
  viewScope: z.enum(["PUBLIC", "PRIVATE", "ALL"] as const),
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
export type GetRecipesQuery = z.infer<typeof getRecipesSchema>;

export const addRecipeSchema = z.object({
  name: z.string(),
  description: z.string(),
  ingredients: z
    .object({
      order: z.number().int(),
      name: z.string(),
      isHeader: z.boolean(),
    })
    .array(),
  steps: z
    .object({
      order: z.number().int(),
      name: z.string(),
      isHeader: z.boolean(),
    })
    .array(),
  prepTime: z.string(),
  cookTime: z.string(),
  isPublic: z.boolean(),
  mealTypes: z
    .object({
      id: z.string(),
    })
    .array()
    .refine((mealTypes) => {
      const set = new Set();
      for (const { id } of mealTypes) {
        if (set.has(id) || !DEFAULT_MEAL_TYPES.includes(id)) return false;
        set.add(id);
      }
      return true;
    }),
  nationalities: z
    .object({
      id: z.string(),
    })
    .array()
    .refine((nationalities) => {
      const set = new Set();
      for (const { id } of nationalities) {
        if (set.has(id) || !DEFAULT_NATIONALITIES.includes(id)) return false;
        set.add(id);
      }
      return true;
    }),
  cookingMethods: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .array()
    .refine((cookingMethods) => {
      const set = new Set();
      for (const { id, name } of cookingMethods) {
        if (set.has(id) || !DEFAULT_COOKING_METHODS.includes(name))
          return false;
        set.add(id);
      }
      return true;
    }),
});
export type AddRecipeMutation = z.infer<typeof addRecipeSchema>;
