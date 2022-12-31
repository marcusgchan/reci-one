import { CustomReactFC } from "@/shared/types";
import React, { useId, useMemo } from "react";
import { BiMinus } from "react-icons/bi";
import { GrDrag } from "react-icons/gr";
import { useDropdownQuery } from "@/components/recipes/useDropdownQuery";
import {
  addRecipeWithMainImage,
  addRecipeWithMainImagesSchema,
} from "@/schemas/recipe";
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
import { LoaderSection } from "@/components/LoaderSection";
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
} from "react-hook-form";

// function handleImageErrors(errors: FormErrors["imageMetadata"]) {
//   if (!errors) return;
//   // File doesn't exist
//   // Name must exist if the file is uploaded to browser
//   if (errors.name?._errors?.length) {
//     return errors.name;
//   }
//   // File too big
//   if (errors.size?._errors.length) {
//     return errors.size;
//   }
//   // Invalid file type
//   if (errors.type?._errors.length) {
//     return errors.type;
//   }
// }

const Create: CustomReactFC = () => {
  const methods = useForm<addRecipeWithMainImage>({
    resolver: zodResolver(addRecipeWithMainImagesSchema),
    defaultValues: {
      name: "",
      description: "",
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
  const {
    mealTypesData,
    cookingMethodsData,
    nationalitiesData,
    isError,
    isLoading,
  } = useDropdownQuery();
  const router = useRouter();
  const setFileMetadata = (file: File | undefined) => {
    if (file) {
      methods.setValue("imageMetadata", {
        name: file.name,
        size: file.size,
        type: file.type,
      });
    } else {
      methods.resetField("imageMetadata");
    }
  };
  const {
    handleFileSelect,
    handleFileDrop,
    formData,
    imgObjUrlRef,
    handleFileLoad,
    removeFile,
  } = useImageUpload(setFileMetadata);
  const mutation = trpc.recipes.addRecipe.useMutation({
    async onSuccess(presignedPost) {
      const file = formData.get("file");
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
        await fetch(presignedPost.url, {
          method: "POST",
          body: newFormData,
        });
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
  const createRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addRecipeWithMainImagesSchema.safeParse(methods.getValues());
    if (result.success) {
      mutation.mutate(result.data);
    } else {
      console.log(result.error.flatten());
      // setFormErrors(result.error.format());
    }
  };
  const navigateToRecipes = () => router.push("/recipes");
  if (isLoading || isError) {
    return <LoaderSection centerFixed />;
  }
  return (
    <section className="p-5 pb-10">
      <FormProvider {...methods}>
        <form
          className="m-auto grid w-full max-w-xl grid-cols-1 gap-5 pb-2 text-gray-500"
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
            <MealTypeSection mealTypes={mealTypesData || []} />
          </SectionWrapper>
          <SectionWrapper>
            <NationalitySection nationalities={nationalitiesData || []} />
          </SectionWrapper>
          <SectionWrapper>
            <CookingMethodsSection cookingMethods={cookingMethodsData || []} />
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
  const { register } = useFormContext<addRecipeWithMainImage>();

  return (
    <div className="grid grid-cols-1 gap-2 sm:h-56 sm:grid-cols-2">
      <div className="flex min-w-[50%] flex-1 shrink-0 flex-col gap-4">
        <div>
          <label className="block" htmlFor={id + "-name"}>
            Name
          </label>
          {/* <FieldValidation error={formContext?.formErrors?.name}> */}
          <Input
            id={id + "-name"}
            type="text"
            {...register("name")}
            className="inline-block w-full border-2 border-gray-500 p-1"
          />
          {/* </FieldValidation> */}
        </div>
        <div className="flex h-full flex-col">
          <label className="block" htmlFor={id + "-description"}>
            Description
          </label>
          <Textarea
            id={id + "-description"}
            className="h-full resize-none border-2 border-gray-500 p-1"
            {...register("description")}
          />
        </div>
      </div>
      {/* Wrapped outside to prevent image upload from shrinking if there's an error */}
      <div className="h-60 sm:h-full">
        {/* <FieldValidation
          error={handleImageErrors(formContext?.formErrors?.imageMetadata)}
        > */}
        <ImageUpload
          handleFileLoad={handleFileLoad}
          removeFile={removeFile}
          handleFilesSelect={handleFileSelect}
          handleFileDrop={handleFileDrop}
          imgObjUrl={imgObjUrl}
        />
        {/* </FieldValidation> */}
      </div>
    </div>
  );
};

const TimeSection = () => {
  const id = useId();
  const { register } = useFormContext<addRecipeWithMainImage>();
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <label htmlFor={id + "-prepTime"}>Prep Time</label>
        <input
          id={id + "-prepTime"}
          type="text"
          {...register("prepTime")}
          className="inline-block w-full border-2 border-gray-500 p-1"
        />
      </div>
      <div className="flex-1">
        <label htmlFor={id + "-cookTime"}>Cook Time</label>
        <input
          id={id + "-cookTime"}
          type="text"
          {...register("cookTime")}
          className="inline-block w-full border-2 border-gray-500 p-1"
        />
      </div>
    </div>
  );
};

const IngredientsSection = ({}: {}) => {
  const { canDrag, toggleCanDrag, sensors } = useListDnd();
  const { register, control } = useFormContext<addRecipeWithMainImage>();
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
      <h2>Add Ingredients</h2>
      <p>
        Enter ingredients below. One ingredient per line and it should include
        the measurements. Add optional headers to group ingredients
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
      </DndContext>
      {/* {!result.success && formContext?.formErrors && (
        <ErrorBox>
          {result.error.flatten().fieldErrors.ingredients?.[0]}
        </ErrorBox>
      )} */}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={(e) =>
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
          onClick={(e) =>
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

const CookingMethodsSection = ({
  cookingMethods,
}: {
  cookingMethods: addRecipeWithMainImage["cookingMethods"];
}) => {
  const { control, getValues } = useFormContext<addRecipeWithMainImage>();
  const { append, remove } = useFieldArray({
    name: "cookingMethods",
    control,
  });
  const fields = getValues("cookingMethods");
  return (
    <>
      <h2>Add Cooking methods</h2>
      <p>Add optional cooking methods to filter meals easier in the future</p>
      <div className="flex items-stretch gap-2">
        <Combobox
          data={cookingMethods}
          handleAdd={(objToAdd: DropdownListValues) => append(objToAdd)}
          selectedData={fields}
        />
      </div>
      <ChipContainer>
        {fields.map(({ id, name }, index) => (
          <Chip
            key={id}
            id={id}
            data={name}
            deleteChip={(id: string) => remove(index)}
          />
        ))}
      </ChipContainer>
    </>
  );
};

const MealTypeSection = ({
  mealTypes,
}: {
  mealTypes: addRecipeWithMainImage["mealTypes"];
}) => {
  const { control, getValues } = useFormContext<addRecipeWithMainImage>();
  const { append, remove } = useFieldArray({
    name: "mealTypes",
    control,
  });
  const fields = getValues("mealTypes");
  return (
    <>
      <h2>Add Meal Types</h2>
      <p>
        Add optional meal types to make filter by meals easier in the future
      </p>
      <div className="flex items-stretch gap-2">
        <Combobox
          data={mealTypes}
          handleAdd={(objToAdd: DropdownListValues) => append(objToAdd)}
          selectedData={fields}
        />
      </div>
      <ChipContainer>
        {fields.map(({ id, name }, index) => (
          <Chip
            key={id}
            id={id}
            data={name}
            deleteChip={(id: string) => remove(index)}
          />
        ))}
      </ChipContainer>
    </>
  );
};

const NationalitySection = ({
  nationalities,
}: {
  nationalities: addRecipeWithMainImage["nationalities"];
}) => {
  const { control, getValues } = useFormContext<addRecipeWithMainImage>();
  const { append, remove } = useFieldArray({
    name: "nationalities",
    control,
  });
  const fields = getValues("nationalities");
  return (
    <>
      <h2>Add Nationalities</h2>
      <p>Add optional nationalities to filter by meals easier in the future</p>
      <div className="flex items-stretch gap-2">
        <Combobox
          data={nationalities}
          handleAdd={(objToAdd: DropdownListValues) => append(objToAdd)}
          selectedData={fields}
        />
      </div>
      <ChipContainer>
        {fields.map(({ id, name }, index) => (
          <Chip
            key={id}
            id={id}
            data={name}
            deleteChip={(id: string) => remove(index)}
          />
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
  const { register, control } = useFormContext<addRecipeWithMainImage>();
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
      <h2>Add Steps</h2>
      <p>
        Enter Steps below. One Step per line. Add optional headers to group
        steps
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
      {/* {!result.success && formContext?.formErrors && (
        <ErrorBox>{result.error.flatten().fieldErrors.steps?.[0]}</ErrorBox>
      )} */}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={(e) =>
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
          onClick={(e) =>
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
  register: UseFormRegister<addRecipeWithMainImage>;
  remove: UseFieldArrayRemove;
}) => {
  const { attributes, listeners, ref } = useSortableItemContext();
  return (
    <div className="flex h-10 items-stretch">
      {canDrag && (
        <button
          className="mr-2 touch-manipulation"
          {...attributes}
          {...listeners}
          ref={ref}
        >
          <GrDrag size={25} className="cursor-grab" />
        </button>
      )}
      {/* <FieldValidation
        highlightOnly
        error={formContext?.formErrors?.[type]?.[index]?.name}
      > */}
      <Input
        placeholder={placeholder}
        disabled={canDrag}
        {...register(`${type}.${index}.name`)}
        className={`${
          isHeader ? "font-extrabold" : ""
        } flex-1 border-2 border-gray-500 p-1 tracking-wide`}
      />
      {/* </FieldValidation> */}
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
