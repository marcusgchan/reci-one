import { addRecipe } from "@/schemas/recipe";
import { CookingMethod, MealType, Nationality } from "@prisma/client";

export type StringInputNames = "name" | "description";
export type NumberInputNames = "prepTime" | "cookTime";
export type DropdownListNames =
  | "mealTypes"
  | "nationalities"
  | "cookingMethods";
export type DropdownListValues = MealType | CookingMethod | Nationality;
export type ListInputFields = keyof Pick<addRecipe, "ingredients" | "steps">;
