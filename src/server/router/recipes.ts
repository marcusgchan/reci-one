import { createRouter } from "./context";
import { z } from "zod";
import { getRecipesSchema } from "../../shared/schemas/recipe";
import { TRPCError } from "@trpc/server";
import { recipeService } from "../services/recipesService";

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
  .query("getMyRecipes", {
    input: getRecipesSchema,
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
      return await recipeService.getMyRecipes(ctx, userId, input);
    },
  });
