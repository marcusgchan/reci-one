"use client";

import { Combobox } from "~/components/ui/Combobox";
import { type DropdownListValues } from "./types";
import { api } from "~/trpc/react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { type FormAddRecipe } from "~/schemas/recipe";
import { ChipContainer } from "./ChipContainer";
import { Chip } from "~/components/ui/Chip";

export function CookingMethodsSection() {
  const { data } = api.cookingMethods.getCookingMethods.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { control, getValues } = useFormContext<FormAddRecipe>();
  const { append, remove } = useFieldArray({
    name: "cookingMethods",
    control,
  });
  const fields = getValues("cookingMethods");
  return (
    <>
      <h2 className="text-xl">Add Cooking methods</h2>
      <p>Add optional cooking methods to filter meals easier in the future.</p>
      <div className="flex items-stretch gap-2">
        <Combobox
          data={data ?? []}
          handleAdd={(objToAdd: DropdownListValues) => {
            if (!fields.map(({ id }) => id).includes(objToAdd.id)) {
              append(objToAdd);
            }
          }}
          selectedData={fields}
        />
      </div>
      <ChipContainer>
        {fields.map(({ id, name }, index) => (
          <Chip key={id} id={id} data={name} deleteChip={() => remove(index)} />
        ))}
      </ChipContainer>
    </>
  );
}
