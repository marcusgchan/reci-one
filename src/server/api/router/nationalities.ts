import { protectedProcedure, createTRPCRouter } from "../trpc";

export const nationalitiesRouter = createTRPCRouter({
  getNationalities: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.nationality.findMany();
  }),
});
