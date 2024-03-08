"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Combobox } from "~/components/ui/Combobox";
import { api } from "~/trpc/react";
import { type DropdownListValues } from "./types";
import { ChipContainer } from "./ChipContainer";
import { Chip } from "~/components/ui/Chip";
import { type FormAddRecipe } from "~/schemas/recipe";

export function MealTypesSection() {
  const { data } = api.mealTypes.getMealTypes.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { control, getValues } = useFormContext<FormAddRecipe>();
  const { append, remove } = useFieldArray({
    name: "mealTypes",
    control,
  });
  const fields = getValues("mealTypes");
  return (
    <>
      <h2 className="text-xl">Add Meal Types</h2>
      <p>
        Add optional meal types to make filter by meals easier in the future.
      </p>
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
