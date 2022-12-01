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

export const getRecipeSchema = z.object({
  recipeId: z.string(),
});

export const addRecipeWithMainImagesSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  imageMetadata: z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
  }),
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
  prepTime: z.string().length(0).or(z.number()),
  cookTime: z.string().length(0).or(z.number()),
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
export type addRecipeWithMainImage = z.infer<
  typeof addRecipeWithMainImagesSchema
>;

const addRecipeWithoutMainImageSchema = addRecipeWithMainImagesSchema.omit({
  imageMetadata: true,
});
export type addRecipeWithoutMainImage = z.infer<
  typeof addRecipeWithoutMainImageSchema
>;
