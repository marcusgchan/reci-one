import { createRouter } from "./context";
import {
  addRecipeWithImagesSchema,
  getRecipeSchema,
  getRecipesSchema,
} from "@/schemas/recipe";
import { TRPCError } from "@trpc/server";
import { createRecipe, getRecipe, getRecipes } from "@/services/recipesService";
import { getImageSignedUrl, getUploadSignedUrl } from "@/services/s3Services";

export const recipesRouter = createRouter()
  .query("getRecipes", {
    input: getRecipesSchema,
    async resolve({ ctx, input }) {
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
    },
  })
  .query("getRecipe", {
    input: getRecipeSchema,
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
      return await getRecipe(ctx, input.recipeId);
    },
  })
  .mutation("addRecipe", {
    input: addRecipeWithImagesSchema,
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const recipe = await createRecipe(ctx, userId, input);
      const signedUrl = await getUploadSignedUrl(
        userId,
        recipe.id,
        input.mainImage
      );
      return signedUrl;
    },
  });
