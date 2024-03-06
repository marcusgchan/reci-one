import { useFormContext, useFieldArray } from "react-hook-form";
import { Combobox } from "~/components/ui/Combobox";
import { FormAddRecipe } from "~/schemas/recipe";
import { api } from "~/trpc/react";
import { DropdownListValues } from "./types";
import { ChipContainer } from "./ChipContainer";
import { Chip } from "~/components/ui/Chip";

export function NationalitiesSection() {
  const { data } = api.nationalities.getNationalities.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { control, getValues } = useFormContext<FormAddRecipe>();
  const { append, remove } = useFieldArray({
    name: "nationalities",
    control,
  });
  const fields = getValues("nationalities");
  return (
    <>
      <h2 className="text-xl">Add Nationalities</h2>
      <p>Add optional nationalities to filter by meals easier in the future.</p>
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
