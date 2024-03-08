import { config } from "src/server/config";
import { z } from "zod";

export const getRecipesSchema = z.object({
  search: z.string(),
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
      id: z.string().optional(),
      name: z.string().trim().min(1, { message: "Can't be empty string" }),
      isHeader: z.boolean(),
    })
    .array(),
  steps: z
    .object({
      id: z.string().optional(),
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
export type AddRecipe = z.infer<typeof addRecipeSchema>;

export const addUrlImageRecipeSchema = baseAddRecipeSchema.extend({
  urlSourceImage: z.string().url(),
});
export type AddParsedRecipe = z.infer<typeof addUrlImageRecipeSchema>;

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

export const editRecipeSchema = z.object({
  id: z.string(),
  updateImage: z.boolean(),
  fields: addRecipeSchema.extend({}),
});
export type EditRecipe = z.infer<typeof editRecipeSchema>;

export const editUrlImageRecipeSchema = z.object({
  id: z.string(),
  fields: addUrlImageRecipeSchema.extend({}),
});
export type EditUrlImageRecipe = z.infer<typeof editUrlImageRecipeSchema>;
