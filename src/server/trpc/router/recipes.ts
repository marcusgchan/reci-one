import {
  addRecipeWithMainImagesSchema,
  getRecipeSchema,
  getRecipesSchema,
} from "@/schemas/recipe";
import { createRecipe, getRecipe, getRecipes } from "@/services/recipesService";
import { getImageSignedUrl, getUploadSignedUrl } from "@/services/s3Services";
import { protectedProcedure, router } from "../trpc";

export const recipesRouter = router({
  getRecipes: protectedProcedure
    .input(getRecipesSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      const recipes = await getRecipes(ctx, userId, input);
      const signedUrls = await Promise.all(
        recipes.map((recipe) =>
          getImageSignedUrl(recipe.authorId, recipe.id, recipe.mainImage).catch(
            () => ""
          )
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
    .input(addRecipeWithMainImagesSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const roundedSignedDate = getFormattedUtcDate();
      const recipe = await createRecipe(ctx, userId, input, roundedSignedDate);
      const signedUrl = await getUploadSignedUrl(
        userId,
        recipe.id,
        input.imageMetadata,
        roundedSignedDate
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
  date.setDate(Math.floor(date.getDate() / 7));
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date.toISOString();
}
