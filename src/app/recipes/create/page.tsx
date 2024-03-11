import { api } from "~/trpc/server";
import { Auth } from "~/app/_lib/auth/Auth";
import { z } from "zod";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Stage2Form } from "~/app/_lib/recipe/CreateForm2";
import { getServerAuthSession } from "~/server/auth";
import { RecipeForm } from "~/app/_lib/recipe/Form";
import { unstable_noStore as noStore } from "next/cache";

const searchParamsSchema = z
  .object({
    formStage: z.enum(["1"]).optional().default("1"),
  })
  .or(
    z.object({
      formStage: z.enum(["2"]),
    }),
  )
  .or(
    z.object({
      formStage: z.enum(["3"]),
      url: z.string().url().optional(),
    }),
  );

export default async function Create({
  searchParams,
}: {
  searchParams: Record<string, string | string[]> | undefined;
}) {
  noStore();

  const session = await getServerAuthSession();
  if (!session) {
    redirect("/api/auth/signin");
  }

  const params = searchParamsSchema.safeParse(searchParams);
  if (!params.success) {
    if (params.error.formErrors.fieldErrors.url) {
      redirect(`/recipes/create?formStage=2`);
    }

    redirect(`/recipes/create?formStage=1`);
  }

  if (params.data.formStage === "1") {
    return <FormStage1 />;
  }

  if (params.data.formStage === "2") {
    return (
      <div className="mt-10 flex justify-center text-gray-500">
        <div className="flex w-full max-w-md flex-col gap-4 rounded border-4 border-gray-400 p-8">
          <h1>Enter a recipe website URL to parse</h1>
          <Stage2Form />
        </div>
      </div>
    );
  }

  if (params.data.url) {
    const data = await api.recipes.parseRecipe.query({ url: params.data.url });
    return <RecipeForm initialData={data} />;
  }

  return <RecipeForm initialData={undefined} />;
}

function FormStage1() {
  return (
    <div className="mt-10 flex justify-center text-gray-500">
      <div className="flex w-full max-w-md flex-col gap-4 rounded border-4 border-gray-400 p-8">
        <h1>Do you want to parse a recipe from another site?</h1>
        <ul className="flex justify-center gap-4">
          <li>
            <Link
              href="/recipes/create?formStage=2"
              className="flex w-[50px] justify-center border-2 border-primary p-1"
            >
              Yes
            </Link>
          </li>
          <li>
            <Link
              href="/recipes/create?formStage=3"
              className="flex w-[50px] justify-center border-2 border-primary p-1"
            >
              No
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
