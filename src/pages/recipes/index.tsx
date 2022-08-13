import React from "react";
import { trpc } from "../../utils/trpc";

const Index = () => {
  const { data, isLoading, isError } = trpc.useQuery(["recipes.getAll"]);

  console.log(data);
  if (isLoading || isError) {
    return <div>IS LOADING</div>;
  }

  return (
    <section
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 mx-auto"
      style={{ width: "fit-content" }}
    >
      <form className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-between">
        <div className="flex gap-3">
          <input type="text" className="border border-sky-500" />
          <button className="border border-sky-500">SEARCH</button>
        </div>
        <button>FILTER</button>
      </form>
      {data
        ? data.map((recipe) => (
            <article key={recipe.id} className="bg-slate-400 p-8 w-60 h-80">
              <h2>{recipe.name} </h2>
            </article>
          ))
        : []}
    </section>
  );
};

export default Index;
