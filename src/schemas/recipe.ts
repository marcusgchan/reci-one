import { z } from "zod";

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
      id: z.string(),
      order: z.number().int(),
      name: z.string(),
      isHeader: z.boolean(),
    })
    .array(),
  steps: z
    .object({
      id: z.string(),
      order: z.number().int(),
      name: z.string(),
      isHeader: z.boolean(),
    })
    .array(),
  prepTime: z.number().nullable(),
  cookTime: z.number().nullable(),
  isPublic: z.boolean(),
});
export type AddRecipeMutation = z.infer<typeof addRecipeSchema>;
