import { protectedProcedure, router } from "../trpc";

export const nationalitiesRouter = router({
  getNationalities: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.nationality.findMany();
  }),
});
