import { CookingMethod, MealType, Nationality } from "@prisma/client";

export type StringInputNames = "name" | "description";
export type NumberInputNames = "prepTime" | "cookTime";
export type DropdownListNames =
  | "mealTypes"
  | "nationalities"
  | "cookingMethods";
export type DropdownListValues = MealType | CookingMethod | Nationality;
