// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { authRouter } from "./auth";
import { recipesRouter } from "./recipes";
import { mealTypesRouter } from "./mealTypes";
import { nationalitiesRouter } from "./nationalities";
import { cookingMethodsRouter } from "./cookingMethods";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("auth.", authRouter)
  .merge("recipes.", recipesRouter)
  .merge("mealTypes.", mealTypesRouter)
  .merge("nationalities.", nationalitiesRouter)
  .merge("cookingMethods.", cookingMethodsRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
