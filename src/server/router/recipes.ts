import { createRouter } from "./context";
import { addRecipeSchema, getRecipesSchema } from "@/schemas/recipe";
import { TRPCError } from "@trpc/server";
import { createRecipe, getRecipes } from "@/services/recipesService";
import { getUploadSignedUrl } from "@/services/s3Services";

export const recipesRouter = createRouter()
  .query("getRecipes", {
    input: getRecipesSchema,
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
      return await getRecipes(ctx, userId, input);
    },
  })
  .mutation("addRecipe", {
    input: addRecipeSchema,
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const recipe = await createRecipe(ctx, userId, input);
      if (input.imageNames) {
        const signedUrl = await getUploadSignedUrl(
          userId,
          recipe.id,
          input.imageNames
        );
        return signedUrl;
      }
      return "";
    },
  });
