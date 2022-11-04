import { createRouter } from "./context";
import { z } from "zod";
import { addRecipeSchema, getRecipesSchema } from "@/schemas/recipe";
import { TRPCError } from "@trpc/server";
import {
  createRecipe,
  getRecipes,
} from "src/server/features/recipes/recipesService";
import { uploadSignedUrl } from "../features/recipes/s3Services";

export const recipesRouter = createRouter()
  .query("hello", {
    input: z
      .object({
        text: z.string().nullish(),
      })
      .nullish(),
    resolve({ input }) {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    },
  })
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
      const signedUrl = uploadSignedUrl(userId, recipe.id, "randomnamefornow");
      return signedUrl;
    },
  });
