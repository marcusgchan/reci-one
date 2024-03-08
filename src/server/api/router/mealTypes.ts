import { protectedProcedure, createTRPCRouter } from "../trpc";

export const mealTypesRouter = createTRPCRouter({
  getMealTypes: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.mealType.findMany();
  }),
});
