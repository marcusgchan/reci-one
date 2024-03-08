"use client";

import { useId } from "react";
import { useFormContext } from "react-hook-form";
import {
  FieldValidation,
  FormItem,
  getErrorMsg,
  hasError,
} from "~/components/ui/FieldValidation";
import { Input } from "~/components/ui/Input";
import { type FormAddRecipe } from "~/schemas/recipe";

export function TimeSection() {
  const id = useId();
  const {
    register,
    formState: { errors },
  } = useFormContext<FormAddRecipe>();
  return (
    <div className="flex gap-4">
      <FormItem className="flex-1">
        <label htmlFor={id + "-prepTime"}>Prep Time (Minutes)</label>
        <FieldValidation error={errors.prepTime}>
          <Input
            aria-errormessage={getErrorMsg(errors.prepTime)}
            aria-invalid={hasError(errors.prepTime)}
            id={id + "-prepTime"}
            min={0}
            type="number"
            {...register("prepTime", { valueAsNumber: true })}
            className="inline-block w-full border-2 border-gray-500 p-1"
          />
        </FieldValidation>
      </FormItem>
      <FormItem className="flex-1">
        <label htmlFor={id + "-cookTime"}>Cook Time (Minutes)</label>
        <FieldValidation error={errors.cookTime}>
          <Input
            aria-errormessage={getErrorMsg(errors.cookTime)}
            aria-invalid={hasError(errors.cookTime)}
            min={0}
            id={id + "-cookTime"}
            type="number"
            {...register("cookTime", { valueAsNumber: true })}
            className="inline-block w-full border-2 border-gray-500 p-1"
          />
        </FieldValidation>
      </FormItem>
    </div>
  );
}
