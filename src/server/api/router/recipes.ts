import {
  addRecipeSchema,
  getRecipeSchema,
  getRecipesSchema,
  addUrlImageRecipeSchema,
  editRecipeSchema,
  editUrlImageRecipeSchema,
} from "@/schemas/recipe";
import {
  addFavourite,
  createParsedRecipe,
  createRecipe,
  deleteRecipe,
  getFavouriteRecipes,
  getMainImage,
  getRecipe,
  getRecipeFormFields,
  getRecipes,
  recipeExists,
  updateRecipe,
  updateRecipeNoneToSigned,
  updateRecipeNoneToUrl,
  updateRecipeSignedToSigned,
  updateRecipeSignedToUrl,
  updateRecipeUrlToSigned,
  updateRecipeUrlToUrl,
} from "@/services/recipesService";
import {
  getImageSignedUrl,
  getUploadSignedUrl,
  remove,
} from "@/services/s3Services";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import { revalidatePath } from "next/cache";

type ParsedRecipe = {
  author: string;
  canonical_url: string;
  category: string;
  cook_time: number;
  cuisine: string;
  description: string;
  host: string;
  image: string;
  ingredients: string[];
  instructions_list: string[];
  language: string;
  prep_time: number;
  ratings: number;
  site_name: string;
  title: string;
  total_time: number;
  yields: string;
};

export const recipesRouter = createTRPCRouter({
  getRecipes: protectedProcedure
    .input(getRecipesSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      const recipes = await getRecipes(ctx, userId, input);
      const formattedRecipes = recipes.map(async (recipe) => {
        const url = recipe.mainImage?.urlImage?.url;
        const key = recipe.mainImage?.metadataImage?.key;
        if (url) {
          return { ...recipe, mainImage: { type: "url" as const, url } };
        } else if (key) {
          const url = await getImageSignedUrl(
            userId,
            recipe.id,
            key,
            getFormattedUtcDate(),
          );
          return {
            ...recipe,
            mainImage: { type: "presignedUrl" as const, url },
          };
        }
        // Shouldn't reach this point since image is required unless
        // a recipe is missing a mainImage
        // This can happen if an image upload fails
        // TODO: add proper dummy image
        return { ...recipe, mainImage: { type: "noImage" as const, url: "" } };
      });
      return await Promise.all(formattedRecipes);
    }),
  getRecipe: protectedProcedure
    .input(getRecipeSchema)
    .query(async ({ ctx, input }) => {
      const recipe = await getRecipe(ctx, input.recipeId, ctx.session.user.id);
      if (!recipe) {
        return null;
      }
      let count = 1;
      type FormattedStep = (typeof recipe.steps)[number] & {
        count: number;
      };
      const formattedSteps: FormattedStep[] = recipe.steps.reduce(
        (acc, step) => {
          if (step.isHeader) {
            acc.push({ ...step, count: -1 });
            return acc;
          }
          acc.push({ ...step, count: count++ });
          return acc;
        },
        [] as FormattedStep[],
      );
      if (recipe.mainImage?.urlImage?.url) {
        return {
          ...recipe,
          steps: formattedSteps,
          mainImage: {
            type: "url" as const,
            url: recipe.mainImage.urlImage.url,
          },
        };
      } else if (recipe.mainImage?.metadataImage) {
        try {
          const url = await getImageSignedUrl(
            ctx.session.user.id,
            recipe.id,
            recipe.mainImage.metadataImage.key,
            getFormattedUtcDate(),
          );
          return {
            ...recipe,
            steps: formattedSteps,
            mainImage: { type: "presignedUrl" as const, url },
          };
        } catch (e) {}
      }
      // Should only reach here if there isn't an image
      return {
        ...recipe,
        steps: formattedSteps,
        mainImage: { type: "noImage" as const, url: "" },
      };
    }),
  addRecipe: protectedProcedure
    .input(addRecipeSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const uuid = uuidv4();
      const recipe = await createRecipe(ctx, userId, input, uuid);
      if (!recipe) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to create Recipe",
        });
      }
      const signedUrl = await getUploadSignedUrl(
        userId,
        recipe.id,
        input.imageMetadata,
        uuid,
      );
      return signedUrl;
    }),
  getRecipeFormFields: protectedProcedure
    .input(getRecipeSchema)
    .query(async ({ ctx, input }) => {
      const recipe = await getRecipeFormFields(
        ctx,
        input.recipeId,
        ctx.session.user.id,
      );
      if (!recipe) {
        return null;
      }
      const url = recipe.mainImage?.urlImage?.url;
      const key = recipe.mainImage?.metadataImage?.key;
      const type = url ? "url" : key ? "presignedUrl" : "noImage";
      return {
        updatedAt: recipe.updatedAt,
        mainImage: {
          type: type,
          src: url
            ? url
            : key
              ? await getImageSignedUrl(
                  ctx.session.user.id,
                  recipe.id,
                  key,
                  getFormattedUtcDate(),
                )
              : "",
        },
        form: {
          name: recipe.name,
          description: recipe.description,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          prepTime: recipe.prepTime ? recipe.prepTime.toNumber() : "",
          cookTime: recipe.cookTime ? recipe.cookTime.toNumber() : "",
          image: {
            imageMetadata:
              type === "presignedUrl"
                ? {
                    name: recipe.mainImage?.metadataImage?.key,
                    type: recipe.mainImage?.metadataImage?.type,
                    size: recipe.mainImage?.metadataImage?.size,
                  }
                : undefined,
            urlSourceImage: recipe.mainImage?.urlImage?.url ?? "",
          },
          nationalities: recipe.nationalities.map(
            ({ nationality: { id, name } }) => ({
              id,
              name,
            }),
          ),
          cookingMethods: recipe.cookingMethods.map(
            ({ cookingMethod: { id, name } }) => ({
              id,
              name,
            }),
          ),
          mealTypes: recipe.mealTypes.map(({ mealType: { id, name } }) => ({
            id,
            name,
          })),
        },
      };
    }),
  addParsedRecipe: protectedProcedure
    .input(addUrlImageRecipeSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const recipe = await createParsedRecipe(ctx, userId, input);
      return recipe;
    }),
  parseRecipe: protectedProcedure
    .input(z.object({ url: z.string() }))
    .query(async ({ input }) => {
      try {
        const res = await fetch(
          `${env.PARSER_URL}/parse?url=${encodeURIComponent(input.url)}`,
          {
            headers: {
              Authorization: env.PARSER_SECRET,
            },
          },
        );
        if (!res.ok) throw new Error("Unable to parse recipe");
        const recipe = (await res.json()) as ParsedRecipe;
        return {
          siteInfo: {
            url: input.url,
            author: recipe.author,
          },
          initialData: {
            name: recipe.title,
            description: recipe.description,
            image: {
              urlSourceImage: recipe.image,
              imageMetadata: undefined,
            },
            ingredients: recipe.ingredients.map((ingredient) => ({
              id: uuidv4(),
              name: ingredient,
              isHeader: false,
            })),
            steps: recipe.instructions_list.map((step) => ({
              id: uuidv4(),
              name: step,
              isHeader: false,
            })),
            prepTime: recipe.prep_time,
            cookTime: recipe.cook_time,
            isPublic: false,
            cookingMethods: [],
            mealTypes: [],
            nationalities: [],
          },
        };
      } catch (e) {
        throw new TRPCError({
          message: "Unable to parse recipe",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
  editRecipe: protectedProcedure
    .input(editRecipeSchema)
    .mutation(async ({ ctx, input: { id, fields, updateImage } }) => {
      if (!updateImage) {
        await updateRecipe({ ctx, id, fields, userId: ctx.session.user.id });
        return null;
      } else {
        const oldRecipe = await getMainImage(ctx, id, ctx.session.user.id);
        if (!oldRecipe) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Recipe does not exist",
          });
        }
        if (oldRecipe.mainImage?.metadataImage?.key) {
          const uuid = uuidv4();
          await updateRecipeSignedToSigned({ ctx, id, fields, uuid });
          await remove(
            ctx.session.user.id,
            id,
            oldRecipe.mainImage.metadataImage.key,
          ).catch((e) => {
            console.log("Error: Unable to remove old image", e);
          });
          const signedUrl = await getUploadSignedUrl(
            ctx.session.user.id,
            id,
            fields.imageMetadata,
            uuid,
          );
          return signedUrl;
        } else if (oldRecipe.mainImage?.urlImage?.url) {
          const uuid = uuidv4();
          await updateRecipeUrlToSigned({
            ctx,
            id,
            fields,
            oldUrlImageId: oldRecipe.mainImage.id,
            uuid,
          });
          const signedUrl = await getUploadSignedUrl(
            ctx.session.user.id,
            id,
            fields.imageMetadata,
            uuid,
          );
          return signedUrl;
        } else {
          const uuid = uuidv4();
          await updateRecipeNoneToSigned({ ctx, id, fields, uuid });
          const signedUrl = await getUploadSignedUrl(
            ctx.session.user.id,
            id,
            fields.imageMetadata,
            uuid,
          );
          return signedUrl;
        }
      }
    }),
  editUrlImageRecipe: protectedProcedure
    .input(editUrlImageRecipeSchema)
    .mutation(async ({ ctx, input: { id, fields } }) => {
      const oldRecipe = await getMainImage(ctx, id, ctx.session.user.id);
      if (!oldRecipe) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Recipe does not exist",
        });
      }
      if (oldRecipe.mainImage?.metadataImage?.key) {
        const oldImageId = oldRecipe.mainImage.id;
        await updateRecipeSignedToUrl({ ctx, id, oldImageId, fields });
        await remove(
          ctx.session.user.id,
          id,
          oldRecipe.mainImage.metadataImage.key,
        ).catch((e) => {
          console.log("Error: Unable to remove old image", e);
        });
      } else if (oldRecipe.mainImage?.urlImage?.url) {
        await updateRecipeUrlToUrl({ ctx, id, fields });
      } else {
        await updateRecipeNoneToUrl({ ctx, id, fields });
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input: { id } }) => {
      const recipe = await recipeExists(ctx, id, ctx.session.user.id);
      if (!recipe) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Recipe does not exist",
        });
      }
      if (recipe?.mainImage?.metadataImage?.key) {
        await remove(
          ctx.session.user.id,
          id,
          recipe.mainImage.metadataImage.key,
        ).catch((e) => {
          console.log("Error: Unable to remove old image", e);
        });
      }
      await deleteRecipe({ ctx, id });
      revalidatePath("/recipes");
    }),
  getFavourites: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const recipes = await getFavouriteRecipes({ ctx, userId });
    const formattedRecipes = recipes.map(async (recipe) => {
      const url = recipe.mainImage?.urlImage?.url;
      const key = recipe.mainImage?.metadataImage?.key;
      if (url) {
        return { ...recipe, mainImage: { type: "url" as const, url } };
      } else if (key) {
        const url = await getImageSignedUrl(
          userId,
          recipe.id,
          key,
          getFormattedUtcDate(),
        );
        return {
          ...recipe,
          mainImage: { type: "presignedUrl" as const, url },
        };
      }
      // Shouldn't reach this point since image is required unless
      // a recipe is missing a mainImage
      // This can happen if an image upload fails
      // TODO: add proper dummy image
      return { ...recipe, mainImage: { type: "noImage" as const, url: "" } };
    });
    return Promise.all(formattedRecipes);
  }),
  toggleFavourite: protectedProcedure
    .input(z.object({ recipeId: z.string(), favourite: z.boolean() }))
    .mutation(async ({ ctx, input: { recipeId, favourite } }) => {
      await addFavourite({
        ctx,
        favourite,
        userId: ctx.session.user.id,
        recipeId,
      });
    }),
});

// Create a date that will be appended to the end
// of the imageName to deal with caching
// The same url needs to be created for the browser to cache
// therefore round date to the start of each week
function getFormattedUtcDate() {
  const date = new Date();
  // Don't add 1 on Sunday
  if (!date.getDay()) {
    date.setDate(date.getDate() - date.getDay());
  } else {
    date.setDate(date.getDate() - date.getDay() + 1);
  }
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date.toISOString();
}
