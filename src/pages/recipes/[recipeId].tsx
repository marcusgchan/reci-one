import { Loader } from "@/shared/components/Loader";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";

export default function Recipe() {
  const router = useRouter();
  const { data, isError, isLoading } = trpc.recipes.getRecipe.useQuery({
    recipeId: String(router.query.recipeId),
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      {data?.name}
      {data?.description}
      {data?.ingredients.map((id, key) => (
        <div key={key}> {id.name}</div>
      ))}
      {data?.steps.map((id, key) => (
        <div key={key}> {id.name}</div>
      ))}
      {data?.mealTypes.map((id, key) => (
        <div key={key}> {id.mealTypeId}</div>
      ))}
      {data?.cookingMethods.map((id, key) => (
        <div key={key}> {id.cookingMethodId}</div>
      ))}
      {data?.nationalities.map((id, key) => (
        <div key={key}> {id.nationalityId}</div>
      ))}
    </div>
  );
}
