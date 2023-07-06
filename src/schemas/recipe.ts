import { config } from "src/server/config";
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

const baseAddRecipeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  ingredients: z
    .object({
      id: z.string(),
      name: z.string().trim().min(1, { message: "Can't be empty string" }),
      isHeader: z.boolean(),
    })
    .array(),
  steps: z
    .object({
      id: z.string(),
      name: z.string().trim().min(1, { message: "Can't be empty string" }),
      isHeader: z.boolean(),
    })
    .array(),
  prepTime: z.string().length(0).or(z.number().min(0)).or(z.nan()),
  cookTime: z.string().length(0).or(z.number().min(0)).or(z.nan()),
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
  urlSource: z.string().url().optional(),
  originalAuthor: z.string().optional(),
});

export const addRecipeSchema = baseAddRecipeSchema.extend({
  imageMetadata: z.object({
    name: z.string({ required_error: "Image is required" }),
    type: z.string({ invalid_type_error: "Image format not supported" }),
    size: z.number({ invalid_type_error: "Image too big" }),
  }),
});
export type addRecipe = z.infer<typeof addRecipeSchema>;

export const addUrlImageRecipeSchema = baseAddRecipeSchema.extend({
  urlSourceImage: z.string().url(),
});
export type addParsedRecipe = z.infer<typeof addUrlImageRecipeSchema>;

export const addRecipeFormSchema = baseAddRecipeSchema.extend({
  image: z.object({
    urlSourceImage: z.literal("").or(z.string().url()),
    imageMetadata: z
      .object({
        name: z.string(),
        type: z
          .string()
          .regex(/^image\//, { message: "Image format not supported" }),
        size: z.number().max(config.s3.maxFileSize, {
          message: "Image must be less than 10mb",
        }),
      })
      .optional(),
  }),
});
export type FormAddRecipe = z.infer<typeof addRecipeFormSchema>;

export const editRecipeSchema = addRecipeSchema.extend({
  id: z.string(),
});
export type EditRecipe = z.infer<typeof editRecipeSchema>;
