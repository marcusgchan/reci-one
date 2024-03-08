import { createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "./router/auth";
import { recipesRouter } from "./router/recipes";
import { mealTypesRouter } from "./router/mealTypes";
import { nationalitiesRouter } from "./router/nationalities";
import { cookingMethodsRouter } from "./router/cookingMethods";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  recipes: recipesRouter,
  mealTypes: mealTypesRouter,
  nationalities: nationalitiesRouter,
  cookingMethods: cookingMethodsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
