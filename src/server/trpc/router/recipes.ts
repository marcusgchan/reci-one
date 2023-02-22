import {
  addRecipeSchema,
  getRecipeSchema,
  getRecipesSchema,
} from "@/schemas/recipe";
import { createRecipe, getRecipe, getRecipes } from "@/services/recipesService";
import { getImageSignedUrl, getUploadSignedUrl } from "@/services/s3Services";
import { TRPCClient } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";

export const recipesRouter = router({
  getRecipes: protectedProcedure
    .input(getRecipesSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      const recipes = await getRecipes(ctx, userId, input);
      const roundedDate = getFormattedUtcDate();
      const signedUrls = await Promise.all(
        recipes.map((recipe) =>
          getImageSignedUrl(
            recipe.authorId,
            recipe.id,
            recipe.mainImage,
            roundedDate
          ).catch(() => "")
        )
      );
      recipes.forEach(
        (recipe, i) => (recipe.mainImage = signedUrls[i] as string)
      );
      return recipes;
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
