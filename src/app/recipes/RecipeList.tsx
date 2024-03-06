"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { RecipeCard } from "./RecipeCard";
import { RouterOutputs } from "~/trpc/shared";

type Recipes = RouterOutputs["recipes"]["getRecipes"];

export function RecipeList({ recipes }: { recipes: Recipes }) {
  const [parent] = useAutoAnimate<HTMLElement>(/* optional config */);
  return (
    <section
      ref={parent}
      className="mx-auto grid h-full w-full max-w-7xl auto-rows-min grid-cols-1 gap-10 overflow-visible sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {recipes.map(({ id, name, mainImage: image }) => (
        <RecipeCard key={id} id={id} name={name} src={image.url} />
      ))}
    </section>
  );
};

