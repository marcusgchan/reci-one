import { AddRecipeMutation } from "@/schemas/recipe";
import { CookingMethod, MealType, Nationality } from "@prisma/client";

export type StringInputNames = "name" | "description";
export type NumberInputNames = "prepTime" | "cookTime";
export type DropdownListNames =
  | "mealTypes"
  | "nationalities"
  | "cookingMethods";
export type DropdownListValues = MealType | CookingMethod | Nationality;
export type ListInputFields = keyof Pick<
  AddRecipeMutationWithId,
  "ingredients" | "steps"
>;
export interface AddRecipeMutationWithId extends AddRecipeMutation {
  ingredients: { id: string; name: string; order: number; isHeader: boolean }[];
  steps: { id: string; name: string; order: number; isHeader: boolean }[];
  nationalities: { id: string; name: string }[];
  mealTypes: { id: string; name: string }[];
  cookingMethods: { id: string; name: string }[];
}
