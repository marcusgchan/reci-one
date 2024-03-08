import { protectedProcedure, createTRPCRouter } from "../trpc";

export const cookingMethodsRouter = createTRPCRouter({
  getCookingMethods: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.cookingMethod.findMany();
  }),
});
