import React from "react";
import { trpc } from "../../utils/trpc";
import useIsMobile from "../../shared/hooks/useIsMobile";
import Image from "next/image";
import { inferQueryOutput } from "../../utils/trpc";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const Index = () => {
  const { data, isLoading, isError } = trpc.useQuery(["recipes.getAll"]);
  // const [parent] = useAutoAnimate(/* optional config */);
  const isMobile = useIsMobile();

  if (isLoading || isError) {
    return <div>IS LOADING</div>;
  }

  if (isMobile) {
    return (
      <section className="grid grid-cols-1 gap-20 mx-auto w-full max-w-7xl">
        <form className="flex gap-3 sticky top-1 z-10">
          <input type="text" className="border border-primary" />
          <button className="border border-primary bg-white">SEARCH</button>
        </form>
        <Recipes data={data} />
        <button className="fixed bottom-0 left-0">UP</button>
        <button className="fixed bottom-0 right-0">FILTER</button>
      </section>
    );
  }
  return (
    <section className="flex flex-col h-full gap-4">
      <form className="flex justify-between">
        <div className="flex gap-3">
          <input type="text" className="border-[3px] border-primary p-1 w-72" />
          <button className="border-primary border-[3px] p-2">SEARCH</button>
        </div>
        <button className="border-primary border-[3px] p-2">FILTER</button>
      </form>
      <section className="h-full overflow-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 mx-auto w-full">
        <Recipes data={data} />
      </section>
    </section>
  );
};

const Recipes = ({
  data,
}: {
  data: inferQueryOutput<"recipes.getAll"> | undefined;
}) => {
  return (
    <>
      {data
        ? data.map(({ id, name }: { id: string; name: string }) => (
            <RecipeCard key={id} id={id} name={name} />
          ))
        : []}
    </>
  );
};

const RecipeCard = ({ id, name }: { id: string; name: string }) => {
  return (
    <article className="flex flex-col gap-4 w-full h-full mx-auto animate-fade-in-down aspect-[1/1.3]">
      <div className="w-full flex basis-3/5 relative">
        <Image
          layout="fill"
          objectFit="cover"
          alt={name}
          src="https://storage.googleapis.com/recipe-website-bucket/test-images/apple-550x396.jpeg"
        />
      </div>
      <div className="flex flex-1 justify-center items-center bg-accent-400">
        <h2 className="text-secondary font-medium tracking-wide">{name}</h2>
      </div>
    </article>
  );
};

export default Index;
