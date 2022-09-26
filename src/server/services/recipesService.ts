import { Recipe } from "@prisma/client";
import { GetRecipesQuery } from "../../schemas/recipe";
import { Context } from "../router/context";

export const recipeService = {
  getRecipes: getRecipes,
};

async function getRecipes(
  ctx: Context,
  userId: string,
  input: GetRecipesQuery
) {
  const myRecipes = [] as Recipe[];
  if (input.viewScope !== "PUBLIC") {
    myRecipes.push(
      ...(await ctx.prisma.recipe.findMany({
        where: {
          authorId: userId, // Replace with "id of test user" if want seeded recipes
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
      }))
    );
  }
  const publicRecipes = [] as Recipe[];
  if (input.viewScope === "PUBLIC") {
    publicRecipes.push(
      ...(await ctx.prisma.recipe.findMany({
        where: {
          id: {
            not: {
              equals: userId,
            },
          },
          isPublic: true,
        },
      }))
    );
  }
  return [...myRecipes, ...publicRecipes];
}

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

type FilterFields =
  | "ingredientsInclude"
  | "ingredientsExclude"
  | "nationalitiesInclude"
  | "nationalitiesExclude";
