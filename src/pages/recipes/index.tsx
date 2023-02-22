import React, { useState } from "react";
import { RouterOutputs, trpc } from "../../utils/trpc";
import Image from "next/image";
import { AiOutlineArrowUp, AiOutlineFilter } from "react-icons/ai";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useRouter } from "next/router";
import { LoaderSection } from "@/components/LoaderSection";
import { CustomReactFC } from "@/shared/types";
import { GetRecipe } from "@/schemas/recipe";
import { Input } from "@/ui/Input";

type Recipes = RouterOutputs["recipes"]["getRecipes"];
const scopes = ["PRIVATE", "PUBLIC", "ALL"] as const;

const Index: CustomReactFC = () => {
  const [sharingScopeIndex, setSharingScopeIndex] = useState(0);
  const toggleSharingScope = (e: React.MouseEvent) => {
    e.preventDefault();
    refetch();
    if (sharingScopeIndex === scopes.length - 1) {
      setSharingScopeIndex(0);
    } else {
      setSharingScopeIndex(sharingScopeIndex + 1);
    }
  };
  const [searchFilters, setSearchFilters] = useState<GetRecipe>({
    search: "",
    filters: {
      ingredientsInclude: [],
      ingredientsExclude: [],
      nationalitiesInclude: [],
      nationalitiesExclude: [],
      prepTimeMin: Number.MIN_VALUE,
      prepTimeMax: Number.MAX_VALUE,
      cookTimeMin: Number.MIN_VALUE,
      cookTimeMax: Number.MAX_VALUE,
      rating: 5,
    },
  });
  const updateName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilters((sf) => {
      return { ...sf, search: e.target.value };
    });
  };
  const {
    data: recipes,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = trpc.recipes.getRecipes.useQuery(searchFilters, {
    refetchOnWindowFocus: false,
  });
  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  if (isError) {
    return <h2>something went wrong</h2>;
  }

  return (
    <>
      {/* Mobile */}
      <section className="mx-auto grid h-full w-full grid-cols-1 gap-8 md:hidden">
        <form className="flex flex-col gap-3">
          <div className="flex justify-between gap-2">
            <Input
              type="text"
              value={searchFilters.search}
              onChange={updateName}
              className="flex-1 border-3 border-primary p-1 tracking-wide"
            />
            <button
              onClick={toggleSharingScope}
              className="self-end border-3 border-primary p-2"
            >
              {scopes[sharingScopeIndex]}
            </button>
          </div>
        </form>
        <RecipesLoader
          recipes={recipes}
          isLoading={isLoading}
          isFetching={isFetching}
        />
        <button className="fixed bottom-3 left-1 rounded-full bg-accent-300 p-2">
          <AiOutlineArrowUp size={30} color="white" />
        </button>
        <button className="fixed bottom-3 right-1 rounded-full bg-accent-300 p-2">
          <AiOutlineFilter size={30} color="white" />
        </button>
      </section>
      {/* Desktop */}
      <section className="hidden h-full w-full flex-col gap-3 md:flex">
        <form
          className="mx-auto flex w-full max-w-7xl justify-between"
          onSubmit={onSearch}
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={searchFilters.search}
              onChange={updateName}
              className="w-72 border-3 border-primary p-1 tracking-wide"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleSharingScope}
              className="border-3 border-primary p-2"
            >
              {scopes[sharingScopeIndex]}
            </button>
            <button className="border-3 border-primary p-2">FILTER</button>
          </div>
        </form>
        <RecipesLoader
          recipes={recipes}
          isLoading={isLoading}
          isFetching={isFetching}
        />
      </section>
    </>
  );
};

const RecipesLoader = ({
  recipes,
  isLoading,
  isFetching,
}: {
  recipes: Recipes | undefined;
  isLoading: boolean;
  isFetching: boolean;
}) => {
  if (!recipes || isLoading || isFetching) {
    return <LoaderSection />;
  }
  return <Recipes recipes={recipes} />;
};

const Recipes = ({ recipes }: { recipes: Recipes }) => {
  const [parent] = useAutoAnimate<HTMLElement>(/* optional config */);
  return (
    <section
      ref={parent}
      className="mx-auto grid h-full w-full max-w-7xl auto-rows-min grid-cols-1 gap-10 overflow-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {recipes.map(({ id, name, mainImage }) => (
        <RecipeCard key={id} id={id} name={name} src={mainImage} />
      ))}
    </section>
  );
};

const RecipeCard = ({
  id,
  name,
  src,
}: {
  id: string;
  name: string;
  src: string;
}) => {
  const router = useRouter();
  return (
    <button
      className="mx-auto flex aspect-[1/1.3] h-full w-full animate-fade-in-down flex-col items-stretch gap-4"
      onClick={() => router.push(`/recipes/${id}`)}
    >
      <div className="relative flex w-full basis-3/5">
        <Image
          className="object-cover"
          fill={true}
          unoptimized
          loading="lazy"
          alt={name}
          src={src}
        />
      </div>
      <div className="flex flex-1 items-center justify-center bg-accent-400">
        <h2 className="font-medium tracking-wide text-secondary">{name}</h2>
      </div>
    </button>
  );
};

Index.auth = true;

export default Index;
