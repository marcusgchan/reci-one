import { trpc } from "@/utils/trpc";

export const useDropdownQuery = () => {
  let isError = false;
  let isLoading = true;
  const {
    data: mealTypesData,
    isError: mealTypeIsError,
    isLoading: mealTypeIsLoading,
  } = trpc.useQuery(["mealTypes.getMealTypes"]);
  const {
    data: nationalitiesData,
    isError: nationalitiesIsError,
    isLoading: nationalitiesIsLoading,
  } = trpc.useQuery(["nationalities.getNationalities"]);
  const {
    data: cookingMethodsData,
    isError: cookingMethodsIsError,
    isLoading: cookingMethodsIsLoading,
  } = trpc.useQuery(["cookingMethods.getCookingMethods"]);
  if (mealTypeIsError || nationalitiesIsError || cookingMethodsIsError) {
    isError = true;
  } else if (
    !mealTypeIsLoading &&
    !nationalitiesIsLoading &&
    !cookingMethodsIsLoading
  ) {
    isLoading = false;
  }
  return {
    mealTypesData,
    nationalitiesData,
    cookingMethodsData,
    isError,
    isLoading,
  };
};
