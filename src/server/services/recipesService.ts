import {
  GetRecipe,
  addRecipe,
  addParsedRecipe,
  EditRecipe,
} from "@/schemas/recipe";
import { Context } from "src/server/trpc/router/context";
import type { Prisma, PrismaClient } from "@prisma/client";

type PrismaTx = Omit<
  PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
>;

export async function createRecipe(
  ctx: Context,
  userId: string,
  input: addRecipe,
  uuid: string
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
                key: `${input.imageMetadata.name}-${uuid}`,
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
        mainImage: {
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

export async function getRecipeFormFields(ctx: Context, recipeId: string) {
  const recipe = await ctx.prisma.recipe.findUnique({
    select: {
      id: true,
      name: true,
      description: true,
      prepTime: true,
      cookTime: true,
      mainImage: { include: { urlImage: true, metadataImage: true } },
      ingredients: true,
      cookingMethods: { include: { cookingMethod: true } },
      mealTypes: { include: { mealType: true } },
      nationalities: { include: { nationality: true } },
    },
    where: { id: recipeId },
  });
  return recipe;
}

export async function getMainImage(ctx: Context, recipeId: string) {
  const recipe = await ctx.prisma.recipe.findUnique({
    select: {
      mainImage: { include: { urlImage: true, metadataImage: true } },
    },
    where: { id: recipeId },
  });
  return recipe;
}

export async function updateRecipeSignedToSigned(
  ctx: Context,
  input: EditRecipe,
  uuid: string
) {
  await ctx.prisma.$transaction(async (prisma) => {
    await prisma.recipe.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
        prepTime: input.prepTime,
        cookTime: input.cookTime,
        mainImage: {
          update: {
            metadataImage: {
              update: {
                type: input.imageMetadata.type,
                key: `${input.imageMetadata.name}-${uuid}`,
                size: input.imageMetadata.size,
              },
            },
          },
        },
      },
    });
    await updateManyToMany(prisma, input);
  });
}

export async function updateRecipeUrlToSigned(
  ctx: Context,
  input: EditRecipe,
  oldImageId: string,
  uuid: string
) {
  await ctx.prisma.$transaction(async (prisma) => {
    await prisma.recipe.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
        prepTime: input.prepTime,
        cookTime: input.cookTime,
        mainImage: {
          update: {
            urlImage: {
              delete: {
                imageId: oldImageId,
              },
            },
            metadataImage: {
              create: {
                type: input.imageMetadata.type,
                key: `${input.imageMetadata.name}-${uuid}`,
                size: input.imageMetadata.size,
              },
            },
          },
        },
      },
    });
    await updateManyToMany(prisma, input);
  });
}

export async function updateRecipeSignedToUrl(
  ctx: Context,
  recipeId: string,
  input: EditRecipe
) {
  const updatedRecipe = await ctx.prisma.recipe.update({
    where: { id: recipeId },
    data: {
      name: input.name,
      description: input.description,
      prepTime: input.prepTime,
      cookTime: input.cookTime,
      mainImage: {
        update: {
          urlImage: {
            create: {
              url: "1234",
            },
          },
          metadataImage: {
            delete: {
              imageId: "1234",
            },
          },
        },
      },
    },
  });
  return updatedRecipe;
}

export async function updateRecipeNoneToSigned(
  ctx: Context,
  input: EditRecipe,
  uuid: string
) {
  await ctx.prisma.$transaction(async (prisma) => {
    await prisma.recipe.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
        prepTime: input.prepTime,
        cookTime: input.cookTime,
        mainImage: {
          create: {
            type: "presignedUrl",
            metadataImage: {
              create: {
                key: `${input.imageMetadata.name}-${uuid}`,
                type: input.imageMetadata.type,
                size: input.imageMetadata.size,
              },
            },
          },
        },
      },
    });
    await updateManyToMany(prisma, input);
  });
}

async function updateManyToMany(prismaTx: PrismaTx, input: EditRecipe) {
  const deleteNationalitiesPromise = prismaTx.nationalitiesOnRecipes.deleteMany(
    {
      where: { recipeId: input.id },
    }
  );
  const deleteCookingMethodsPromise =
    prismaTx.cookingMethodsOnRecipies.deleteMany({
      where: { recipeId: input.id },
    });
  const deleteMealTypesPormise = prismaTx.mealTypesOnRecipies.deleteMany({
    where: { recipeId: input.id },
  });
  await Promise.all([
    deleteNationalitiesPromise,
    deleteCookingMethodsPromise,
    deleteMealTypesPormise,
  ]);
  const createNationalitiesPromise = prismaTx.nationalitiesOnRecipes.createMany(
    {
      data: input.nationalities.map(({ id }) => ({
        nationalityId: id,
        recipeId: input.id,
      })),
    }
  );
  const createCookingMethodsPromise =
    prismaTx.cookingMethodsOnRecipies.createMany({
      data: input.cookingMethods.map(({ id }) => ({
        cookingMethodId: id,
        recipeId: input.id,
      })),
    });
  const createMealTypesPromise = prismaTx.mealTypesOnRecipies.createMany({
    data: input.mealTypes.map(({ id }) => ({
      mealTypeId: id,
      recipeId: input.id,
    })),
  });
  await Promise.all([
    createNationalitiesPromise,
    createCookingMethodsPromise,
    createMealTypesPromise,
  ]);
}
