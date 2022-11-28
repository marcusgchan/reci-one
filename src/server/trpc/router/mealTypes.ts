import { protectedProcedure, router } from "../trpc";

export const mealTypesRouter = router({
  getMealTypes: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.mealType.findMany();
  }),
});
