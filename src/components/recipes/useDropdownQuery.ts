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
  } = trpc.useQuery(["mealTypes.getMealTypes"], QUERY_OPTIONS);
  const {
    data: nationalitiesData,
    isError: nationalitiesIsError,
    isLoading: nationalitiesIsLoading,
  } = trpc.useQuery(["nationalities.getNationalities"], QUERY_OPTIONS);
  const {
    data: cookingMethodsData,
    isError: cookingMethodsIsError,
    isLoading: cookingMethodsIsLoading,
  } = trpc.useQuery(["cookingMethods.getCookingMethods"], QUERY_OPTIONS);
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
