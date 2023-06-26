import { Loader } from "@/shared/components/Loader";
import { RouterOutputs, trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import Image from "next/image";
import { RiShareForwardFill } from "react-icons/ri";
import { SnackbarProvider } from "@/components/Snackbar";

export default function Recipe() {
  const router = useRouter();
  const { data, isError, isLoading } = trpc.recipes.getRecipe.useQuery({
    recipeId: String(router.query.recipeId),
  });

  if (isLoading) {
    return <Loader />;
  }

  if (!data) {
    return <div>Recipe not found</div>;
  }

  return (
    <div className="flex flex-col items-center pb-10">
      <div className="w-2/3 space-y-6">
        <div className="text-center text-4xl font-bold">{data!.name}</div>
        <div>
          {data.description}
          <br />
          <br />
          <div className="text-sm">
            Recipe by <b>{data!.author.name}</b>
          </div>
        </div>
        <div>
          <DisplayImage {...data.mainImage} name={data.name} />
        </div>
        <div className="flex">
          <div className="flex flex-col gap-6 bg-amber-100 p-5">
            <div className="flex flex-row gap-6">
              <div>
                Preperation time: <br /> {+data!.prepTime!} minutes
              </div>
              <div>
                Cooking time: <br /> {+data!.cookTime!} minutes
              </div>
              <div>
                Total time: <br /> {+data!.prepTime! + +data!.cookTime!} minutes
              </div>
            </div>
            <div className="flex flex-row gap-6">
              <div>
                Nationalities:
                <div className="container w-40 overflow-scroll">
                  {data!.nationalities.length == 0 ? (
                    <div>No nationalities</div>
                  ) : (
                    <div className="h-14">
                      {data!.nationalities.map((id, key) => (
                        <div key={key}> {id.nationalityId} </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                Cooking methods:
                <div className="container w-40 overflow-scroll">
                  {data!.nationalities.length == 0 ? (
                    <div>No cooking methods</div>
                  ) : (
                    <div className="h-14">
                      {data!.cookingMethods.map((id, key) => (
                        <div key={key}> {id.cookingMethodId} </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                Meal types:
                <div className="container w-40 overflow-scroll">
                  {data!.mealTypes.length == 0 ? (
                    <div>No meal types</div>
                  ) : (
                    <div className="h-14">
                      {data!.mealTypes.map((id, key) => (
                        <div key={key}> {id.mealTypeId} </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-2xl font-bold">
          Ingredients required to make {data!.name}
        </div>
        <div>
          Make sure you have all of these ingredients to successfully make{" "}
          {data!.name}!
        </div>
        <div className="flex">
          <ul className="list-disc bg-amber-100 p-5 pl-5">
            {data!.ingredients.map((id, key) => (
              <li key={key}>{id.name}</li>
            ))}
          </ul>
        </div>
        <div className="text-2xl font-bold">How to make {data!.name}</div>
        <div>
          Below you can find the full step-by-step instructions to make{" "}
          {data!.name}! We suggest following the steps to a tee!
        </div>
        <div className="flex">
          <ul className="list-decimal bg-amber-100 p-5 pl-6">
            {data!.steps.map((id, key) => (
              <li key={key}>{id.name}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-xl">
            Finished? We hope you enjoy this recipe for {data!.name}!
          </div>
        </div>
      </div>
    </div>
  );
}

type DisplayImageProps = NonNullable<
  RouterOutputs["recipes"]["getRecipe"]
>["mainImage"] & { name: string };

function DisplayImage(props: DisplayImageProps) {
  if (props.type === "url" || props.type === "presignedUrl") {
    return (
      <Image
        unoptimized
        width={600}
        height={600}
        loading="lazy"
        alt={props.name}
        src={props.url}
      />
    );
  }
  return <div>No Image</div>;
}
