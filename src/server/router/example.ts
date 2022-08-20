import { createRouter } from "./context";
import { z } from "zod";
import { listBuckets } from "../../utils/googleStorage";

export const exampleRouter = createRouter()
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
      listBuckets();
      console.log({ testing: "in here" });
      return await ctx.prisma.recipe.findMany();
    },
  });
