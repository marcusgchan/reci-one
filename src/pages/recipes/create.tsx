import { CustomReactFC } from "@/shared/types";
import React, { useId, useMemo } from "react";
import { BiMinus } from "react-icons/bi";
import { GrDrag } from "react-icons/gr";
import { addRecipe, addRecipeSchema } from "@/schemas/recipe";
import { v4 as uuidv4 } from "uuid";
import { trpc } from "@/utils/trpc";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useListDnd } from "@/components/recipes/useListDnd";
import { MdCompareArrows } from "react-icons/md";
import {
  ListInputFields,
  DropdownListValues,
} from "@/components/recipes/types";
import { useRouter } from "next/router";
import {
  SortableItemContext,
  useSortableItemContext,
} from "@/components/recipes/useSortableItemContext";
import { useSnackbarDispatch } from "@/components/Snackbar";
import { Combobox } from "@/ui/Combobox";
import { Chip } from "@/components/ui/Chip";
import { ImageUpload, useImageUpload } from "@/ui/ImageUpload";
import { Input } from "@/ui/Input";
import { Textarea } from "@/ui/Textarea";
import { Button } from "@/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  UseFieldArrayRemove,
  UseFormRegister,
  useFieldArray,
  useForm,
  useFormContext,
  FieldError,
  FieldErrorsImpl,
  Merge,
} from "react-hook-form";
import {
  ErrorBox,
  FieldValidation,
  FormItem,
  getErrorMsg,
  hasError,
} from "@/ui/FieldValidation";
import { ErrorMessage } from "@hookform/error-message";

const Create: CustomReactFC = () => {
  const methods = useForm<addRecipe>({
    resolver: zodResolver(addRecipeSchema),
    defaultValues: {
      name: "",
      description: "",
      imageMetadata: {
        name: undefined,
        size: undefined,
        type: undefined,
      },
      ingredients: [
        { id: uuidv4(), order: 0, name: "", isHeader: false },
        { id: uuidv4(), order: 1, name: "", isHeader: false },
        { id: uuidv4(), order: 2, name: "", isHeader: false },
      ],
      steps: [
        { id: uuidv4(), order: 0, name: "", isHeader: false },
        { id: uuidv4(), order: 1, name: "", isHeader: false },
        { id: uuidv4(), order: 2, name: "", isHeader: false },
      ],
      prepTime: "",
      cookTime: "",
      isPublic: false,
      cookingMethods: [],
      mealTypes: [],
      nationalities: [],
    },
  });
  const router = useRouter();
  const setFileMetadata = (file: File | undefined) => {
    if (file) {
      methods.setValue(
        "imageMetadata",
        { name: file.name, type: file.type, size: file.size },
        { shouldValidate: true, shouldDirty: true, shouldTouch: true }
      );
    } else {
      // Workaround b/c resetField('imageMetadeta) resets the field visually but isn't
      // in the control state (control > formValues > imageMetadata)
      // This results in incorrect validation (adding image and removing then submitting wouldn't show error)
      methods.setValue(
        "imageMetadata",
        {
          name: undefined,
          type: undefined,
          size: undefined,
        } as unknown as addRecipe["imageMetadata"],
        {
          shouldValidate: methods.formState.isSubmitted ? true : false,
          shouldDirty: true,
          shouldTouch: true,
        }
      );
    }
  };
  const {
    file,
    handleFileSelect,
    handleFileDrop,
    imgObjUrlRef,
    handleFileLoad,
    removeFile,
  } = useImageUpload(setFileMetadata);
  const mutation = trpc.recipes.addRecipe.useMutation({
    async onSuccess(presignedPost) {
      if (!file) {
        // error unable to upload file or user somehow removed img after upload
        snackbarDispatch({
          type: "ERROR",
          message: "There was a problem with uploading your image",
        });
        return;
      }
      // Add fields that are required for presigned post
      const newFormData = new FormData();
      Object.entries(presignedPost.fields).forEach(([field, value]) => {
        newFormData.append(field, value);
      });
      // File must be last item that is appended to form
      newFormData.append("file", file);
      try {
        const res = await fetch(presignedPost.url, {
          method: "POST",
          body: newFormData,
        });
        if (!res.ok) throw new Error("Unable to upload file");
        snackbarDispatch({
          type: "SUCCESS",
          message: "Successfully create recipe",
        });
        navigateToRecipes();
      } catch (e) {
        snackbarDispatch({
          type: "ERROR",
          message: "There was a problem with uploading your image",
        });
      }
    },
  });
  const snackbarDispatch = useSnackbarDispatch();
  const createRecipe = methods.handleSubmit((data) => {
    mutation.mutate(data);
    mutation.reset();
  });
  const navigateToRecipes = () => router.push("/recipes");
  return (
    <section className="p-5 pb-10">
      <FormProvider {...methods}>
        <form
          className="m-auto grid w-full max-w-xl grid-cols-1 gap-5 pb-2 text-gray-500"
          noValidate
          onSubmit={createRecipe}
        >
          <div>
            <Button
              intent="noBoarder"
              type="button"
              onClick={navigateToRecipes}
              className="p-1"
            >
              Back
            </Button>
            <h2 className="text-2xl">Add Recipe</h2>
          </div>
          <SectionWrapper>
            <NameDesImgSection
              handleFileSelect={handleFileSelect}
              handleFileDrop={handleFileDrop}
              handleFileLoad={handleFileLoad}
              removeFile={removeFile}
              imgObjUrl={imgObjUrlRef.current}
            />
          </SectionWrapper>
          <SectionWrapper>
            <IngredientsSection />
          </SectionWrapper>
          <SectionWrapper>
            <StepsSection />
          </SectionWrapper>
          <SectionWrapper>
            <TimeSection />
          </SectionWrapper>
          <SectionWrapper>
            <MealTypeSection />
          </SectionWrapper>
          <SectionWrapper>
            <NationalitySection />
          </SectionWrapper>
          <SectionWrapper>
            <CookingMethodsSection />
          </SectionWrapper>
          <Button>Create</Button>
        </form>
      </FormProvider>
    </section>
  );
};

const NameDesImgSection = ({
  handleFileSelect,
  handleFileDrop,
  imgObjUrl,
  handleFileLoad,
  removeFile,
}: {
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileDrop: (e: React.DragEvent) => void;
  imgObjUrl: undefined | string;
  handleFileLoad: (src: string) => void;
  removeFile: (src: string) => void;
}) => {
  const id = useId();
  const {
    register,
    formState: { errors },
  } = useFormContext<addRecipe>();
  type imgMetadata = addRecipe["imageMetadata"];
  function handleImageErrors(
    errors: Merge<FieldError, FieldErrorsImpl<imgMetadata>> | undefined
  ) {
    if (!errors) return;
    // File doesn't exist
    // Name must exist if the file is uploaded to browser
    if (errors.name) {
      return errors.name;
    }
    // File too big
    if (errors.size) {
      return errors.size;
    }
    // Invalid file type
    return errors.types;
  }
  return (
    <div className="grid grid-cols-1 gap-2 sm:h-56 sm:grid-cols-2">
      <div className="flex min-w-[50%] flex-1 shrink-0 flex-col gap-4">
        <FormItem>
          <label className="block" htmlFor={id + "-name"}>
            Name
          </label>
          <FieldValidation error={errors.name}>
            <Input
              aria-invalid={hasError(errors.name)}
              aria-errormessage={getErrorMsg(errors.name)}
              id={id + "-name"}
              type="text"
              {...register("name")}
              className="inline-block w-full border-2 border-gray-500 p-1"
            />
          </FieldValidation>
        </FormItem>
        <div className="flex h-full flex-col">
          <FormItem className="flex-1">
            <label className="block" htmlFor={id + "-description"}>
              Description
            </label>
            <Textarea
              id={id + "-description"}
              className="h-full resize-none border-2 border-gray-500 p-1"
              {...register("description")}
            />
          </FormItem>
        </div>
      </div>
      {/* Wrapped outside to prevent image upload from shrinking if there's an error */}
      <div className="h-60 sm:h-full">
        <FieldValidation error={handleImageErrors(errors.imageMetadata)}>
          <ImageUpload
            handleFileLoad={handleFileLoad}
            removeFile={removeFile}
            handleFilesSelect={handleFileSelect}
            handleFileDrop={handleFileDrop}
            imgObjUrl={imgObjUrl}
          />
        </FieldValidation>
      </div>
    </div>
  );
};

const TimeSection = () => {
  const id = useId();
  const {
    register,
    formState: { errors },
  } = useFormContext<addRecipe>();
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
};

const IngredientsSection = () => {
  const { canDrag, toggleCanDrag, sensors } = useListDnd();
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<addRecipe>();
  const { fields, append, remove, swap } = useFieldArray({
    name: "ingredients",
    control,
  });
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over!.id) {
      const oldIndex = fields.map(({ id }) => id).indexOf(active.id as string);
      const newIndex = fields.map(({ id }) => id).indexOf(over.id as string);
      swap(oldIndex, newIndex);
    }
  };
  return (
    <>
      <h2 className="text-xl">Add Ingredients</h2>
      <p>
        Enter ingredients below. One ingredient per line and it should include
        the measurements. Add optional headers to group ingredients.
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
              <DraggableInput
                index={index}
                type="ingredients"
                placeholder={
                  field.isHeader
                    ? "Ingredient Header placeholder"
                    : "e.g. 2 cups of sugar"
                }
                canDrag={canDrag}
                remove={remove}
                register={register}
                isHeader={field.isHeader}
              />
            </SortableItem>
          ))}
        </SortableContext>
        <ErrorMessage
          errors={errors}
          name="ingredients"
          render={() => {
            return (
              <ErrorBox>
                {
                  errors?.ingredients?.find?.(
                    (ingredient) => ingredient?.name?.message
                  )?.name?.message
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
              order: fields.length,
              isHeader: false,
            })
          }
        >
          Add Ingredient
        </Button>
        <Button
          type="button"
          onClick={() =>
            append({
              id: uuidv4(),
              name: "",
              order: fields.length,
              isHeader: true,
            })
          }
        >
          Add Header
        </Button>
      </div>
    </>
  );
};

const SortableItem = ({
  id,
  children,
  canDrag,
}: {
  id: string;
  children: React.ReactNode;
  canDrag: boolean;
}) => {
  const {
    attributes,
    listeners,

    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: id, disabled: !canDrag });

  const context = useMemo(
    () => ({
      attributes,
      listeners,
      ref: setActivatorNodeRef,
    }),
    [attributes, listeners, setActivatorNodeRef]
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <SortableItemContext.Provider value={context}>
      <div ref={setNodeRef} style={style}>
        {children}
      </div>
    </SortableItemContext.Provider>
  );
};

const CookingMethodsSection = () => {
  const { data } = trpc.cookingMethods.getCookingMethods.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { control, getValues } = useFormContext<addRecipe>();
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
};

const MealTypeSection = () => {
  const { data } = trpc.mealTypes.getMealTypes.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { control, getValues } = useFormContext<addRecipe>();
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
};

const NationalitySection = () => {
  const { data } = trpc.nationalities.getNationalities.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { control, getValues } = useFormContext<addRecipe>();
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
};

const ChipContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-wrap gap-2">{children}</div>;
};

const SectionWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col gap-4">{children}</div>;
};

const StepsSection = () => {
  const { canDrag, toggleCanDrag, sensors } = useListDnd();
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<addRecipe>();
  const { fields, append, remove, swap } = useFieldArray({
    name: "steps",
    control,
  });
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over!.id) {
      const oldIndex = fields.map(({ id }) => id).indexOf(active.id as string);
      const newIndex = fields.map(({ id }) => id).indexOf(over.id as string);
      swap(oldIndex, newIndex);
    }
  };
  return (
    <>
      <h2 className="text-xl">Add Steps</h2>
      <p>
        Enter Steps below. One Step per line. Add optional headers to group
        steps.
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
          {fields.map(({ id, isHeader }, index) => {
            return (
              <SortableItem key={id} id={id} canDrag={canDrag}>
                <DraggableInput
                  index={index}
                  type="steps"
                  placeholder={
                    isHeader ? "Steps Header placeholder" : "e.g. Soup"
                  }
                  canDrag={canDrag}
                  isHeader={isHeader}
                  remove={remove}
                  register={register}
                />
              </SortableItem>
            );
          })}
        </SortableContext>
      </DndContext>
      <ErrorMessage
        errors={errors}
        name="steps"
        render={() => {
          return (
            <ErrorBox>
              {
                errors?.steps?.find?.((step) => step?.name?.message)?.name
                  ?.message
              }
            </ErrorBox>
          );
        }}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() =>
            append({
              id: uuidv4(),
              name: "",
              order: fields.length,
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
              order: fields.length,
              isHeader: true,
            })
          }
        >
          Add Header
        </Button>
      </div>
    </>
  );
};

const DraggableInput = ({
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
  register: UseFormRegister<addRecipe>;
  remove: UseFieldArrayRemove;
}) => {
  const { attributes, listeners, ref } = useSortableItemContext();
  const {
    formState: { errors },
  } = useFormContext<addRecipe>();
  return (
    <div className="flex h-10 items-stretch">
      {canDrag && (
        <button
          type="button"
          className="mr-2 touch-manipulation"
          {...attributes}
          {...listeners}
          ref={ref}
        >
          <GrDrag size={25} className="cursor-grab" />
        </button>
      )}
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
        <Button intent="noBoarder" type="button" onClick={() => remove(index)}>
          <BiMinus size={25} />
        </Button>
      )}
    </div>
  );
};

Create.auth = true;
Create.hideNav = true;

export default Create;
