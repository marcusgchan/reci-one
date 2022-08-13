import { createRouter } from "./context";
import { z } from "zod";

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
  .query("getAll", {
    async resolve({ ctx }) {
      const recipes = await ctx.prisma.recipe.findMany({
        select: {
          id: true,
          name: true,
          images: {
            select: {
              id: true,
              link: true,
            },
          },
        },
      });
      console.log(recipes);
      return recipes;
    },
  });
