import React, { useMemo, useState } from "react";
import { trpc } from "../../utils/trpc";
import Image from "next/image";
import { inferQueryOutput } from "../../utils/trpc";
import { AiOutlineArrowUp, AiOutlineFilter } from "react-icons/ai";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Loader } from "../../shared/components/Loader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GetRecipesQuery, getRecipesSchema } from "@/schemas/recipe";
import { useRouter } from "next/router";

type Recipes = inferQueryOutput<"recipes.getRecipes">;
const scopes = ["PRIVATE", "PUBLIC", "ALL"] as const;

const Index = () => {
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
  const { data, isLoading, isError, refetch } = trpc.useQuery(
    [
      "recipes.getRecipes",
      {
        search: "",
        viewScope: scopes[sharingScopeIndex] || "PRIVATE",
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
      },
    ],
    { cacheTime: 60 * 60 }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GetRecipesQuery>({ resolver: zodResolver(getRecipesSchema) });

  const [parent] = useAutoAnimate<HTMLElement>(/* optional config */);

  const onSubmit = (GetAllRecipesQuery: GetRecipesQuery) => {};

  if (isError) {
    return <h2>something went wrong</h2>;
  }
  return (
    <>
      {/* Mobile */}
      <section className="mx-auto grid h-full w-full grid-cols-1 gap-8 p-2 md:hidden">
        <form
          className="top-1 flex flex-col gap-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            type="text"
            {...register("search")}
            className="border-3 border-primary p-1 tracking-wide"
          />
          <button className="border-3 border-primary p-2">SEARCH</button>
          <button
            onClick={toggleSharingScope}
            className="self-end border-3 border-primary p-2"
          >
            {scopes[sharingScopeIndex]}
          </button>
        </form>
        <section className="grid grid-cols-1 gap-10">
          {isLoading ? <Loader /> : <Recipes data={data} />}
        </section>
        <button className="fixed bottom-3 left-1 rounded-full bg-accent-300 p-2">
          <AiOutlineArrowUp size={30} color="white" />
        </button>
        <button className="fixed bottom-3 right-1 rounded-full bg-accent-300 p-2">
          <AiOutlineFilter size={30} color="white" />
        </button>
      </section>
      {/* Desktop */}
      <section className="hidden h-full w-full flex-col p-2 md:flex">
        <form
          className="mx-auto flex w-full max-w-7xl justify-between"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex gap-3">
            <input
              type="text"
              {...register("search")}
              className="w-72 border-3 border-primary p-1 tracking-wide"
            />
            <button className="border-3 border-primary p-2">SEARCH</button>
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
        <section
          ref={parent}
          className="mx-auto grid h-full w-full max-w-7xl auto-rows-min grid-cols-1 gap-10 overflow-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {isLoading ? <Loader /> : <Recipes data={data} />}
        </section>
      </section>
    </>
  );
};

const Recipes = ({ data }: { data: Recipes | undefined }) => {
  return (
    <>
      {data
        ? data.map(({ id, name, mainImage }) => (
            <RecipeCard key={id} id={id} name={name} src={mainImage} />
          ))
        : []}
    </>
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
    <article
      tabIndex={0}
      role="button"
      className="mx-auto flex aspect-[1/1.3] h-full w-full animate-fade-in-down flex-col gap-4"
      onClick={() => router.push(`/recipes/${id}`)}
    >
      <div className="relative flex w-full basis-3/5">
        <Image
          priority={true}
          layout="fill"
          loading="eager"
          objectFit="cover"
          alt={name}
          src={src + "#123"}
        />
      </div>
      <div className="flex flex-1 items-center justify-center bg-accent-400">
        <h2 className="font-medium tracking-wide text-secondary">{name}</h2>
      </div>
    </article>
  );
};

export default Index;
