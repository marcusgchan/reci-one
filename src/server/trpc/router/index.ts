import { router } from "../trpc";
import { authRouter } from "./auth";
import { recipesRouter } from "./recipes";
import { mealTypesRouter } from "./mealTypes";
import { nationalitiesRouter } from "./nationalities";
import { cookingMethodsRouter } from "./cookingMethods";

export const appRouter = router({
  auth: authRouter,
  recipes: recipesRouter,
  mealTypes: mealTypesRouter,
  nationalities: nationalitiesRouter,
  cookingMethods: cookingMethodsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
