import {
  addRecipeWithImagesSchema,
  getRecipeSchema,
  getRecipesSchema,
} from "@/schemas/recipe";
import { createRecipe, getRecipe, getRecipes } from "@/services/recipesService";
import { getImageSignedUrl, getUploadSignedUrl } from "@/services/s3Services";
import { protectedProcedure, router } from "./trpc";

export const recipesRouter = router({
  getRecipes: protectedProcedure
    .input(getRecipesSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      const recipes = await getRecipes(ctx, userId, input);
      const signedUrls = await Promise.all(
        recipes.map((recipe) =>
          getImageSignedUrl(recipe.authorId, recipe.id, recipe.mainImage).catch(
            () => "sad;kfj"
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
    .input(addRecipeWithImagesSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const recipe = await createRecipe(ctx, userId, input);
      const signedUrl = await getUploadSignedUrl(
        userId,
        recipe.id,
        input.mainImage
      );
      return signedUrl;
    }),
});
