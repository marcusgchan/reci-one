import { GetRecipe, addRecipe, addParsedRecipe } from "@/schemas/recipe";
import { Context } from "src/server/trpc/router/context";

export async function createRecipe(
  ctx: Context,
  userId: string,
  input: addRecipe,
  formattedSignedDate: string
) {
  const recipe = await ctx.prisma.$transaction(async (tx) => {
    // Unable to connect multiple on create b/c it requires recipeId
    const recipe = await tx.recipe.create({
      data: {
        name: input.name,
        mainImage: {
          create: {
            type: "presignedUrl",
            metadataImage: {
              create: {
                key: `${input.imageMetadata.name}-${formattedSignedDate}`,
                type: input.imageMetadata.type,
                size: input.imageMetadata.size,
              },
            },
          },
        },
        description: input.description,
        prepTime: input.prepTime || undefined,
        cookTime: input.cookTime || undefined,
        authorId: userId,
        ingredients: {
          createMany: {
            data: input.ingredients.map(({ id, ...rest }, i) => ({
              ...rest,
              order: i,
            })),
          },
        },
        steps: {
          createMany: {
            data: input.steps.map(({ id, ...rest }, i) => ({
              ...rest,
              order: i,
            })),
          },
        },
      },
    });
    if (input.urlSource && input.originalAuthor) {
      await tx.recipe.update({
        where: { id: recipe.id },
        data: {
          parsedSiteInfo: {
            create: {
              url: input.urlSource,
              author: input.originalAuthor,
            },
          },
        },
      });
    }
    await tx.nationalitiesOnRecipes.createMany({
      data: input.nationalities.map((nationality) => ({
        nationalityId: nationality.id,
        recipeId: recipe.id,
      })),
    });
    await tx.cookingMethodsOnRecipies.createMany({
      data: input.cookingMethods.map((cookingMethods) => ({
        cookingMethodId: cookingMethods.id,
        recipeId: recipe.id,
      })),
    });
    await tx.mealTypesOnRecipies.createMany({
      data: input.mealTypes.map((mealTypes) => ({
        mealTypeId: mealTypes.id,
        recipeId: recipe.id,
      })),
    });
    return recipe;
  });
  return recipe;
}

export async function createParsedRecipe(
  ctx: Context,
  userId: string,
  input: addParsedRecipe
) {
  const recipe = await ctx.prisma.$transaction(async (tx) => {
    // Unable to connect multiple on create b/c it requires recipeId
    const recipe = await tx.recipe.create({
      data: {
        name: input.name,
        images: {
          create: {
            type: "url",
            urlImage: { create: { url: input.urlSourceImage } },
          },
        },
        description: input.description,
        prepTime: input.prepTime || undefined,
        cookTime: input.cookTime || undefined,
        authorId: userId,
        ingredients: {
          createMany: {
            data: input.ingredients.map(({ id, ...rest }, i) => ({
              ...rest,
              order: i,
            })),
          },
        },
        steps: {
          createMany: {
            data: input.steps.map(({ id, ...rest }, i) => ({
              ...rest,
              order: i,
            })),
          },
        },
      },
    });
    if (input.urlSource && input.urlSourceImage && input.originalAuthor) {
      await tx.recipe.update({
        where: { id: recipe.id },
        data: {
          parsedSiteInfo: {
            create: {
              url: input.urlSource,
              author: input.originalAuthor,
            },
          },
        },
      });
    }
    await tx.nationalitiesOnRecipes.createMany({
      data: input.nationalities.map((nationality) => ({
        nationalityId: nationality.id,
        recipeId: recipe.id,
      })),
    });
    await tx.cookingMethodsOnRecipies.createMany({
      data: input.cookingMethods.map((cookingMethods) => ({
        cookingMethodId: cookingMethods.id,
        recipeId: recipe.id,
      })),
    });
    await tx.mealTypesOnRecipies.createMany({
      data: input.mealTypes.map((mealTypes) => ({
        mealTypeId: mealTypes.id,
        recipeId: recipe.id,
      })),
    });
    return recipe;
  });
  return recipe;
}

export async function getRecipes(
  ctx: Context,
  userId: string | undefined,
  input: GetRecipe
) {
  const recipes = await ctx.prisma.recipe.findMany({
    select: {
      mainImage: { include: { urlImage: true, metadataImage: true } },
      id: true,
      name: true,
    },
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
      /*nationalities: {
        none: {
          nationalityId: { in: input.filters.nationalitiesExclude },
        },
      },*/
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
  return recipes;
}

export async function getRecipe(ctx: Context, recipeId: string) {
  const recipe = await ctx.prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      mainImage: { include: { urlImage: true, metadataImage: true } },
      ingredients: true,
      cookingMethods: { include: { cookingMethod: true } },
      nationalities: { include: { nationality: true } },
      mealTypes: { include: { mealType: true } },
      steps: true,
      author: true,
      parsedSiteInfo: true,
    },
  });

  if (!recipe) {
    return null;
  }

  return recipe;
}
