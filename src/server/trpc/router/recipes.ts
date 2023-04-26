import {
  addRecipeSchema,
  getRecipeSchema,
  getRecipesSchema,
  addParsedRecipeSchema,
} from "@/schemas/recipe";
import {
  createParsedRecipe,
  createRecipe,
  getRecipe,
  getRecipes,
} from "@/services/recipesService";
import { getImageSignedUrl, getUploadSignedUrl } from "@/services/s3Services";
import { ParsedRecipe } from "@/shared/types";
import { TRPCError } from "@trpc/server";
import { env } from "src/server/env.mjs";
import { protectedProcedure, router } from "../trpc";
import { v4 as uuidv4 } from "uuid";
import z from "zod";

export const recipesRouter = router({
  getRecipes: protectedProcedure
    .input(getRecipesSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      const recipes = await getRecipes(ctx, userId, input);
      const roundedDate = getFormattedUtcDate();
      const formattedRecipes = recipes.map(async (recipe) => {
        const urlPromises = recipe.images.map((image) => {
          if (image.parsedImage) {
            return Promise.resolve(image.parsedImage.url);
          } else if (image.uploadedImage) {
            return getImageSignedUrl(
              userId,
              recipe.id,
              image.uploadedImage.key,
              roundedDate
            ).catch(() => "");
          }
          // No image for some reason (shouldn't happen)
          return Promise.resolve("");
        });
        return { ...recipe, images: await Promise.all(urlPromises) };
      });
      return formattedRecipes;
    }),
  getRecipe: protectedProcedure
    .input(getRecipeSchema)
    .query(async ({ ctx, input }) => {
      return await getRecipe(ctx, input.recipeId);
    }),
  addRecipe: protectedProcedure
    .input(addRecipeSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const roundedDate = getFormattedUtcDate();
      const recipe = await createRecipe(ctx, userId, input, roundedDate);
      if (!recipe) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to create Recipe",
        });
      }
      const signedUrl = await getUploadSignedUrl(
        userId,
        recipe.id,
        input.imageMetadata,
        roundedDate
      );
      return signedUrl;
    }),
  addParsedRecipe: protectedProcedure
    .input(addParsedRecipeSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const recipe = await createParsedRecipe(ctx, userId, input);
      return recipe;
    }),
  parseRecipe: protectedProcedure
    .input(z.object({ url: z.string() }))
    .query(async ({ input }) => {
      try {
        const res = await fetch(
          `http://localhost:8000/parse?url=${encodeURIComponent(input.url)}`,
          {
            headers: {
              Authorization: env.PARSER_SECRET,
            },
          }
        );
        if (!res.ok) throw new Error("Unable to parse recipe");
        const recipe = (await res.json()) as ParsedRecipe;
        return {
          siteInfo: {
            url: recipe.host,
            author: recipe.author,
          },
          initialData: {
            name: recipe.title,
            description: recipe.description,
            urlSourceImage: recipe.image,
            imageMetadata: undefined,
            ingredients: recipe.ingredients.map((ingredient) => ({
              id: uuidv4(),
              name: ingredient,
              isHeader: false,
            })),
            steps: recipe.instructions_list.map((step) => ({
              id: uuidv4(),
              name: step,
              isHeader: false,
            })),
            prepTime: recipe.prep_time,
            cookTime: recipe.cook_time,
            isPublic: false,
            cookingMethods: [],
            mealTypes: [],
            nationalities: [],
          },
        };
      } catch (e) {
        console.log(e);
        throw new TRPCError({
          message: "Unable to parse recipe",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
});

// Create a date that will be appended to the end
// of the imageName to deal with caching
// The same url needs to be created for the browser to cache
// therefore round date to the start of each week
function getFormattedUtcDate() {
  const date = new Date();
  // Don't add 1 on Sunday
  if (!date.getDay()) {
    date.setDate(date.getDate() - date.getDay());
  } else {
    date.setDate(date.getDate() - date.getDay() + 1);
  }
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date.toISOString();
}
