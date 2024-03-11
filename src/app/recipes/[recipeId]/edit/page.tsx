import { redirect } from "next/navigation";
import { EditForm } from "~/app/_lib/recipe/EditForm";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Page({
  params,
}: {
  params: { recipeId: string };
}) {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/api/auth/signin");
  }

  const recipe = await api.recipes.getRecipeFormFields.query({
    recipeId: params.recipeId,
  });

  if (!recipe) {
    return <p>Recipe not found</p>;
  }
  return <EditForm initialData={recipe} />;
}
