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
  return <div>Unfinished</div>;
}
