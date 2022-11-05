import { Recipe } from "@prisma/client";
import { GetRecipesQuery, AddRecipeMutation } from "../../../schemas/recipe";
import { Context } from "../../router/context";

export async function createRecipe(
  ctx: Context,
  userId: string,
  input: AddRecipeMutation
) {
  // Unable to connect multiple on create b/c it requires recipeId
  const recipe = await ctx.prisma.recipe.create({
    data: {
      name: input.name,
      description: input.description,
      prepTime: input.prepTime,
      cookTime: input.cookTime,
      authorId: userId,
      ingredients: {
        createMany: { data: input.ingredients.map((ingredient) => ingredient) },
      },
      steps: {
        createMany: { data: input.steps.map((step) => step) },
      },
    },
  });
  return await ctx.prisma.recipe.update({
    where: { id: recipe.id },
    data: {
      cookingMethods: {
        connect: input.cookingMethods.map((cookingMethod) => ({
          cookingMethodId_recipeId: {
            cookingMethodId: cookingMethod.id,
            recipeId: recipe.id,
          },
        })),
      },
      nationalities: {
        connect: input.nationalities.map((nationality) => ({
          nationalityId_recipeId: {
            nationalityId: nationality.id,
            recipeId: recipe.id,
          },
        })),
      },
      mealTypes: {
        connect: input.mealTypes.map((mealType) => ({
          mealTypeId_recipeId: {
            mealTypeId: mealType.id,
            recipeId: recipe.id,
          },
        })),
      },
    },
  });
}

export async function getRecipes(
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
