import React from "react";
import { trpc } from "../../utils/trpc";
import useIsMobile from "../../shared/hooks/useIsMobile";
import Image from "next/image";
import { inferQueryOutput } from "../../utils/trpc";

const Index = () => {
  const { data, isLoading, isError } = trpc.useQuery(["recipes.getAll"]);

  const isMobile = useIsMobile();

  console.log(data);
  if (isLoading || isError) {
    return <div>IS LOADING</div>;
  }

  if (isMobile) {
    return (
      <section
        className="grid grid-cols-1 gap-20 mx-auto"
        style={{ width: "fit-content" }}
      >
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
    <section
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:col-span-4 gap-20 mx-auto"
      style={{ width: "fit-content" }}
    >
      <form className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex justify-between">
        <div className="flex gap-3">
          <input type="text" className="border border-primary" />
          <button className="border border-primary">SEARCH</button>
        </div>
        <button>FILTER</button>
      </form>
      <Recipes data={data} />
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
            <RecipeCard id={id} name={name} />
          ))
        : []}
    </>
  );
};

const RecipeCard = ({ id, name }: { id: string; name: string }) => {
  return (
    <article
      key={id}
      className="flex flex-col bg-accent border border-primary w-60 h-80 mx-auto"
    >
      <div className="w-full flex basis-3/5 relative">
        <Image
          layout="fill"
          objectFit="cover"
          src="https://storage.googleapis.com/recipe-website-bucket/test-images/apple-550x396.jpeg"
        />
      </div>
      <div className="flex flex-1 justify-center items-center border-t border-primary">
        <h2>{name} </h2>
      </div>
    </article>
  );
};

export default Index;
