import { createRouter } from "./context";
import { z } from "zod";
import { getRecipesSchema, GetRecipesQuery } from "../../shared/schemas/recipe";
import { TRPCError } from "@trpc/server";

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
      const recipes = await ctx.prisma.recipe.findMany({
        where: {
          authorId: "cl7b4r5n20216kb6vj9fucbt1",
          name: {
            contains: input.search,
          },
          ingredients: getIncludeExcludeItems(
            "name",
            "ingredientsInclude",
            "ingredientsExclude",
            input
          ),
          nationalities: getIncludeExcludeItems(
            "name",
            "nationalitiesInclude",
            "nationalitiesExclude",
            input
          ),
          prepTime: {
            gt: input.filters.prepTimeMin,
            lt: input.filters.prepTimeMax,
          },
          cookTime: {
            gt: input.filters.cookTimeMin,
            lt: input.filters.cookTimeMax,
          },
        },
      });

      console.log(recipes);
      return recipes;
    },
  });

type FilterFields =
  | "ingredientsInclude"
  | "ingredientsExclude"
  | "nationalitiesInclude"
  | "nationalitiesExclude";

function getIncludeExcludeItems(
  columnName: string,
  includeFilterField: FilterFields,
  excludeFilterField: FilterFields,
  input: GetRecipesQuery
) {
  const {
    [includeFilterField]: includeList,
    [excludeFilterField]: excludeList,
  } = input.filters;
  return {
    some:
      includeList.length > 0
        ? {
            OR: includeList.map((ingredient) => ({
              [columnName]: { contains: ingredient },
            })),
          }
        : {},
    none: {
      OR: excludeList.map((ingredient) => ({
        [columnName]: { contains: ingredient },
      })),
    },
  };
}
