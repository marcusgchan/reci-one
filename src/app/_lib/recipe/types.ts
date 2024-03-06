import { addRecipe } from "@/schemas/recipe";
import {
  type CookingMethod,
  type MealType,
  type Nationality,
} from "@prisma/client";

export type DropdownListValues = MealType | CookingMethod | Nationality;
export type ListInputFields = keyof Pick<addRecipe, "ingredients" | "steps">;
