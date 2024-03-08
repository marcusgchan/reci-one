import { type RouterOutputs } from "~/trpc/shared";
import { AiOutlineArrowUp, AiOutlineFilter } from "react-icons/ai";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useRouter } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { Auth } from "~/app/_lib/auth/Auth";
import { api } from "~/trpc/server";
import { RecipeList } from "./RecipeList";

export default async function RecipesPage() {
  const recipes = await api.recipes.getRecipes.query({ search: "" });
  return (
    <Auth>
      {/* Mobile */}
      <section className="mx-auto grid h-full w-full grid-cols-1 gap-8 md:hidden">
        {/* <form className="flex flex-col gap-3"> */}
        {/*   <div className="flex justify-between gap-2"> */}
        {/*     <Input */}
        {/*       type="text" */}
        {/*       value={searchFilters.search} */}
        {/*       onChange={updateName} */}
        {/*       className="flex-1 border-3 border-primary p-1 tracking-wide" */}
        {/*     /> */}
        {/*   </div> */}
        {/* </form> */}
        <RecipeList recipes={recipes} />
        {/* <button className="fixed bottom-3 left-1 rounded-full bg-accent-300 p-2"> */}
        {/*   <AiOutlineArrowUp size={30} color="white" /> */}
        {/* </button> */}
        {/* <button className="fixed bottom-3 right-1 rounded-full bg-accent-300 p-2"> */}
        {/*   <AiOutlineFilter size={30} color="white" /> */}
        {/* </button> */}
      </section>
      {/* Desktop */}
      <section className="hidden h-full w-full flex-col gap-3 md:flex">
        <RecipeList recipes={recipes} />
      </section>
    </Auth>
  );
}
