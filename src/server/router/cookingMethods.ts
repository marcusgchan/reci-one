import { protectedProcedure, router } from "./trpc";

export const cookingMethodsRouter = router({
  getCookingMethods: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.cookingMethod.findMany();
  }),
});
