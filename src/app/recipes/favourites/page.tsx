import { unstable_noStore as noStore } from "next/cache";
import { api } from "~/trpc/server";
import { RecipeList } from "../RecipeList";

export default async function FavouriteRecipes() {
  noStore();
  const recipes = await api.recipes.getFavourites.query();
  if (recipes.length === 0) {
    return <h1 className="text-xl text-gray-500">No Favourites</h1>;
  }
  return (
    <>
      <section className="mx-auto grid h-full w-full grid-cols-1 gap-8 md:hidden">
        <RecipeList recipes={recipes} />
      </section>
      <section className="hidden h-full w-full flex-col gap-3 md:flex">
        <RecipeList recipes={recipes} />
      </section>
    </>
  );
}
