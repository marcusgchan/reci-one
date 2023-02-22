import { trpc } from "@/utils/trpc";

const QUERY_OPTIONS = {
  refetchOnWindowFocus: false,
};

export const useDropdownQuery = () => {
  let isError = false;
  let isLoading = true;
  const {
    data: mealTypesData,
    isError: mealTypeIsError,
    isLoading: mealTypeIsLoading,
  } = trpc.mealTypes.getMealTypes.useQuery(undefined, {});
  const {
    data: nationalitiesData,
    isError: nationalitiesIsError,
    isLoading: nationalitiesIsLoading,
  } = trpc.nationalities.getNationalities.useQuery(undefined, QUERY_OPTIONS);
  const {
    data: cookingMethodsData,
    isError: cookingMethodsIsError,
    isLoading: cookingMethodsIsLoading,
  } = trpc.cookingMethods.getCookingMethods.useQuery(undefined, QUERY_OPTIONS);
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
