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
        isParsed: false,
        images: {
          create: {
            uploadedImage: {
              create: {
                key: `${input.imageMetadata.name}-${formattedSignedDate}`,
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
          create: { parsedImage: { create: { url: input.urlSourceImage } } },
        },
        isParsed: true,
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
      images: { include: { parsedImage: true, uploadedImage: true } },
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

/*
          if (image.parsedImage) {
            return Promise.resolve(image.parsedImage.url);
          } else if (image.uploadedImage) {
            return getImageSignedUrl(
              userId,
              recipe.id,
              image.uploadedImage.key,
              roundedDate
            ).catch(() => "");
          }
          // No image for some reason (shouldn't happen)
          return Promise.resolve("");
        });
        return { ...recipe, images: await Promise.all(urlPromises) };*/
export async function getRecipe(ctx: Context, recipeId: string) {
  const recipe = await ctx.prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      images: { include: { parsedImage: true, uploadedImage: true } },
      ingredients: true,
      cookingMethods: true,
      nationalities: true,
      mealTypes: true,
      steps: true,
      author: true,
    },
  });

  if (!recipe) {
    return null;
  }

  return { ...recipe };
}

export const saveUploadedImageToDatabase = async (
  ctx: Context,
  userId: string,
  recipeId: string,
  key: string
) => {
  await ctx.prisma.recipe.update({
    data: { images: { create: { uploadedImage: { create: { key } } } } },
    where: { id: recipeId, authorId: userId },
  });
};
