"use client";

import { v4 as uuidv4 } from "uuid";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useFormContext, useFieldArray } from "react-hook-form";
import { MdCompareArrows } from "react-icons/md";
import { useListDnd } from "~/app/_lib/common/dnd/useListDnd";
import { Button } from "~/components/ui/Button";
import { type FormAddRecipe } from "~/schemas/recipe";
import { SortableItem } from "../common/dnd/SortableItem";
import { DraggableListItem } from "../common/dnd/DraggableListItem";
import { ListInput } from "./ListInputField";
import { ErrorMessage } from "@hookform/error-message";
import { ErrorBox } from "~/components/ui/FieldValidation";

export function DraggableStepList() {
  const { canDrag, toggleCanDrag, sensors } = useListDnd();
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<FormAddRecipe>();
  const { fields, append, remove, move } = useFieldArray({
    name: "steps",
    control,
  });
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = fields.map(({ id }) => id).indexOf(active.id as string);
      const newIndex = fields.map(({ id }) => id).indexOf(over.id as string);
      move(oldIndex, newIndex);
    }
  };
  return (
    <>
      <h2 className="text-xl">Add Steps</h2>
      <p>
        Enter steps below. One step per line and it should include the
        measurements. Add optional headers to group steps.
      </p>
      <Button
        intent="noBoarder"
        className="self-start"
        type="button"
        aria-label="Toggle rearrange"
        onClick={toggleCanDrag}
      >
        <MdCompareArrows className="rotate-90" size={20} />
      </Button>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={fields} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <SortableItem key={field.id} id={field.id} canDrag={canDrag}>
              <DraggableListItem canDrag={canDrag}>
                <ListInput
                  index={index}
                  type="steps"
                  placeholder={
                    field.isHeader
                      ? "Step Header placeholder"
                      : "e.g. 2 cups of sugar"
                  }
                  canDrag={canDrag}
                  remove={remove}
                  register={register}
                  isHeader={field.isHeader}
                />
              </DraggableListItem>
            </SortableItem>
          ))}
        </SortableContext>
        <ErrorMessage
          errors={errors}
          name="steps"
          render={() => {
            return (
              <ErrorBox>
                {
                  errors?.steps?.find?.((steps) => steps?.name?.message)?.name
                    ?.message
                }
              </ErrorBox>
            );
          }}
        />
      </DndContext>
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() =>
            append({
              id: uuidv4(),
              name: "",
              isHeader: false,
            })
          }
        >
          Add Step
        </Button>
        <Button
          type="button"
          onClick={() =>
            append({
              id: uuidv4(),
              name: "",
              isHeader: true,
            })
          }
        >
          Add Header
        </Button>
      </div>
    </>
  );
}
