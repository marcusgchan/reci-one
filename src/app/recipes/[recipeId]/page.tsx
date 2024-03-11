import { type RouterOutputs } from "~/trpc/shared";
import Image from "next/image";
import { api } from "~/trpc/server";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import { FavouriteCheckbox } from "~/app/_lib/recipe/FavRecipeCheckbox";

export default async function RecipePage({
  params,
}: {
  params: { recipeId: string };
}) {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/api/auth/signin");
  }

  const recipe = await api.recipes.getRecipe.query({
    recipeId: params.recipeId,
  });

  if (!recipe) {
    return <div>Recipe not found</div>;
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-start gap-4 pb-10">
      <div className="flex w-full justify-between">
        <Link href="/recipes">Back</Link>
        <FavouriteCheckbox
          isChecked={
            recipe.favourites.length === 0
              ? false
              : recipe.favourites.some((el) => el.favourite)
          }
          recipeId={params.recipeId}
        />
      </div>
      <div className="flex w-full items-start justify-between gap-2">
        <h1 className="text-4xl font-bold">{recipe.name}</h1>
        <Link href={`/recipes/${recipe.id}/edit`}>Edit</Link>
      </div>
      {!!recipe.description.length && <div>{recipe.description}</div>}
      {recipe.parsedSiteInfo && (
        <p className="text-sm">
          Original recipe by <b>{recipe.parsedSiteInfo?.author}</b>
        </p>
      )}
      <div className="relative aspect-square w-full">
        <DisplayImage {...recipe.mainImage} name={recipe.name} />
      </div>
      <section>
        <h2 className="mb-3 text-2xl font-bold">Ingredients</h2>
        {!!recipe.ingredients.length ? (
          <ul className="flex flex-col gap-2">
            {recipe.ingredients.map(({ name, isHeader, order }) => (
              <li
                key={order}
                className={
                  isHeader ? "text-xl font-bold" : "flex items-center gap-2"
                }
              >
                {name}
              </li>
            ))}
          </ul>
        ) : (
          <p>This recipe doesn&apos;t have ingredients</p>
        )}
      </section>
      <section>
        <h2 className="mb-3 text-2xl font-bold">Steps</h2>
        {!!recipe.steps.length ? (
          <ul className="flex flex-col gap-2">
            {recipe.steps.map((step) => {
              return (
                <li
                  key={step.order}
                  className={
                    step.isHeader
                      ? "text-xl font-bold"
                      : "flex items-start gap-2"
                  }
                >
                  {step.count !== -1 && <span>{step.count}.</span>}
                  {step.name}
                </li>
              );
            })}
          </ul>
        ) : (
          <p>This recipe doesn&apos;t have steps</p>
        )}
      </section>
      {!!recipe.nationalities.length && (
        <section>
          <h2 className="mb-3 text-2xl font-bold">Nationalities</h2>
          <ul className="flex gap-2">
            {recipe.nationalities.map(({ nationality }) => (
              <li
                className="rounded-full bg-accent-600 px-3 py-2"
                key={nationality.id}
              >
                {nationality.name}
              </li>
            ))}
          </ul>
        </section>
      )}
      {!!recipe.mealTypes.length && (
        <section>
          <h2 className="mb-3 text-2xl font-bold">Meal Types</h2>
          <ul className="flex gap-2">
            {recipe.mealTypes.map(({ mealType }) => (
              <li
                className="rounded-full bg-accent-600 px-3 py-2"
                key={mealType.id}
              >
                {mealType.name}
              </li>
            ))}
          </ul>
        </section>
      )}
      {!!recipe.cookingMethods.length && (
        <section>
          <h2 className="mb-3 text-2xl font-bold">Nationalities</h2>
          <ul className="flex gap-2">
            {recipe.cookingMethods.map(({ cookingMethod }) => (
              <li
                className="rounded-full bg-accent-600 px-3 py-2"
                key={cookingMethod.id}
              >
                {cookingMethod.name}
              </li>
            ))}
          </ul>
        </section>
      )}
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
        className="object-cover"
        priority
        unoptimized
        fill={true}
        loading="eager"
        alt={props.name}
        src={props.url}
      />
    );
  }
  return <div>No Image</div>;
}
