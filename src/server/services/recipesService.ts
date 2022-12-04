import { Recipe } from "@prisma/client";
import { GetRecipesQuery, addRecipeWithMainImage } from "@/schemas/recipe";
import { Context } from "src/server/trpc/router/context";

export async function createRecipe(
  ctx: Context,
  userId: string,
  input: addRecipeWithMainImage,
  formattedSignedDate: string
) {
  // Unable to connect multiple on create b/c it requires recipeId
  const recipe = await ctx.prisma.recipe.create({
    data: {
      name: input.name,
      mainImage: `${input.imageMetadata.name}-${formattedSignedDate}`,
      description: input.description,
      prepTime: input.prepTime || undefined,
      cookTime: input.cookTime || undefined,
      authorId: userId,
      ingredients: {
        createMany: { data: input.ingredients.map(({ id, ...rest }) => rest) },
      },
      steps: {
        createMany: { data: input.steps.map(({ id, ...rest }) => rest) },
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
  userId: string | undefined,
  input: GetRecipesQuery
) {
  const myRecipes = [] as Recipe[];
  if (input.viewScope !== "PUBLIC" && userId) {
    const recipes = await ctx.prisma.recipe.findMany({
      where: {
        authorId: userId, // Replace with "id of test user" if want seeded recipes
        name: {
          contains: input.search,
        },
        ingredients: {
          none: {
            OR: input.filters.ingredientsExclude.map((ingredient) => ({
              name: { contains: ingredient },
            })),
          },
        },
        nationalities: {
          none: {
            nationalityId: { notIn: input.filters.nationalitiesExclude },
          },
        },
        AND: input.filters.ingredientsInclude
          .map((ingredient) => ({
            ingredients: { some: { name: { contains: ingredient } } },
          }))
          .concat(
            input.filters.nationalitiesInclude.map((nationality) => ({
              ingredients: { some: { name: { contains: nationality } } },
            }))
          ),
        // prepTime: {
        //   gt: input.filters.prepTimeMin,
        //   lt: input.filters.prepTimeMax,
        // },
        // cookTime: {
        //   gt: input.filters.cookTimeMin,
        //   lt: input.filters.cookTimeMax,
        // },
      },
    });
    myRecipes.push(...recipes);
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

export async function getRecipe(ctx: Context, recipeId: string) {
  return await ctx.prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      ingredients: true,
      cookingMethods: true,
      nationalities: true,
      mealTypes: true,
      steps: true,
    },
  });
}

export const saveMainImageNameToDatabase = async (
  ctx: Context,
  userId: string,
  recipeId: string,
  imageName: string
) => {
  await ctx.prisma.recipe.update({
    data: { mainImage: imageName },
    where: { id: recipeId, authorId: userId },
  });
};
