import {
  type UseFieldArrayRemove,
  type UseFormRegister,
  useFormContext,
} from "react-hook-form";
import { BiMinus } from "react-icons/bi";
import { type ListInputFields } from "~/app/_lib/recipe/types";
import { Button } from "~/components/ui/Button";
import {
  FieldValidation,
  getErrorMsg,
  hasError,
} from "~/components/ui/FieldValidation";
import { Input } from "~/components/ui/Input";
import { type FormAddRecipe } from "~/schemas/recipe";

export function ListInput({
  isHeader,
  canDrag,
  placeholder,
  type,
  index,
  register,
  remove,
}: {
  isHeader: boolean;
  canDrag: boolean;
  placeholder: string;
  type: ListInputFields;
  index: number;
  register: UseFormRegister<FormAddRecipe>;
  remove: UseFieldArrayRemove;
}) {
  const {
    formState: { errors },
  } = useFormContext<FormAddRecipe>();
  return (
    <>
      <FieldValidation highlightOnly error={errors?.[type]?.[index]?.name}>
        <Input
          aria-invalid={hasError(errors?.[type]?.[index]?.name)}
          aria-errormessage={getErrorMsg(errors?.[type]?.[index]?.name)}
          placeholder={placeholder}
          disabled={canDrag}
          {...register(`${type}.${index}.name`)}
          className={`${
            isHeader ? "font-extrabold" : ""
          } flex-1 border-2 border-gray-500 p-1 tracking-wide`}
        />
      </FieldValidation>
      {!canDrag && (
        <Button
          intent="noBoarder"
          type="button"
          onClick={() => {
            console.log("remove", index);
            remove(index);
          }}
        >
          <BiMinus size={25} />
        </Button>
      )}
    </>
  );
}
