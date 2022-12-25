import { CustomReactFC } from "@/shared/types";
import React, {
  useId,
  useState,
  useMemo,
  useContext,
  createContext,
} from "react";
import { BiMinus } from "react-icons/bi";
import { GrDrag } from "react-icons/gr";
import { useDropdownQuery } from "@/components/recipes/useDropdownQuery";
import {
  addRecipeWithMainImage,
  addRecipeWithMainImagesSchema,
  addRecipeWithoutMainImage,
} from "@/schemas/recipe";
import { v4 as uuidv4 } from "uuid";
import type { MealType, Nationality, CookingMethod } from "@prisma/client";
import { trpc } from "@/utils/trpc";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useListDnd } from "@/components/recipes/useListDnd";
import { MdCompareArrows } from "react-icons/md";
import { useFormMutations } from "@/components/recipes/useFormMutations";
import {
  StringInputNames,
  NumberInputNames,
  DropdownListNames,
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
import { ZodFormattedError } from "zod";
import { ErrorBox, FieldValidation } from "@/ui/FieldValidation";

type FormErrors = ZodFormattedError<addRecipeWithMainImage, string>;

const FormErrorContext = createContext<{
  formErrors: FormErrors | null;
  resetForm: () => void;
} | null>(null);

function handleImageErrors(errors: FormErrors["imageMetadata"]) {
  if (!errors) return;
  // File doesn't exist
  // Name must exist if the file is uploaded to browser
  if (errors.name?._errors?.length) {
    return errors.name;
  }
  // File too big
  if (errors.size?._errors.length) {
    return errors.size;
  }
  // Invalid file type
  if (errors.type?._errors.length) {
    return errors.type;
  }
}

const Create: CustomReactFC = () => {
  const router = useRouter();
  const {
    file,
    handleFileSelect,
    handleFileDrop,
    formData,
    imgObjUrlRef,
    handleFileLoad,
    removeFile,
  } = useImageUpload();
  const [formErrors, setFormErrors] = useState<FormErrors | null>(null);
  const resetForm = () => setFormErrors(null);
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

  const {
    mealTypesData,
    cookingMethodsData,
    nationalitiesData,
    isError,
    isLoading,
  } = useDropdownQuery();

  const [recipeData, setRecipeData] = useState<addRecipeWithoutMainImage>({
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
  });

  const {
    updateListInput,
    removeListInput,
    addItemToList,
    handleBasicInput,
    addToList,
    deleteFromList,
  } = useFormMutations(setRecipeData);

  const handleDragEnd = (event: DragEndEvent, type: ListInputFields) => {
    const { active, over } = event;
    if (active && over && active.id !== over!.id) {
      const oldIndex = recipeData[type]
        .map(({ id }) => id)
        .indexOf(active.id as string);
      const newIndex = recipeData[type]
        .map(({ id }) => id)
        .indexOf(over.id as string);
      setRecipeData((fd) => {
        const updatedArray = arrayMove(fd[type], oldIndex, newIndex);
        const updatedRecipeData = {
          ...fd,
          [type]: updatedArray.map((item, i) => ({ ...item, order: i })),
        };
        const data = {
          ...updatedRecipeData,
          imageMetadata: {
            name: file?.name,
            type: file?.type,
            size: file?.size,
          },
        };
        const result = addRecipeWithMainImagesSchema.safeParse(data);
        if (!result.success) {
          setFormErrors(result.error.format());
        }
        return updatedRecipeData;
      });
    }
  };

  const snackbarDispatch = useSnackbarDispatch();

  const createRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...recipeData,
      imageMetadata: { name: file?.name, type: file?.type, size: file?.size },
    };
    const result = addRecipeWithMainImagesSchema.safeParse(data);
    if (result.success) {
      mutation.mutate(result.data);
    } else {
      console.log(result.error.flatten());
      setFormErrors(result.error.format());
    }
  };

  const navigateToRecipes = () => router.push("/recipes");

  if (isLoading || isError) {
    return <LoaderSection centerFixed />;
  }

  return (
    <section className="p-5 pb-10">
      <FormErrorContext.Provider value={{ formErrors, resetForm }}>
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
              name={recipeData.name}
              handleStringInput={handleBasicInput}
              handleFileSelect={handleFileSelect}
              handleFileDrop={handleFileDrop}
              handleFileLoad={handleFileLoad}
              removeFile={removeFile}
              imgObjUrl={imgObjUrlRef.current}
            />
          </SectionWrapper>
          <SectionWrapper>
            <IngredientsSection
              updateListInput={updateListInput}
              removeListInput={removeListInput}
              ingredients={recipeData.ingredients}
              addItemToList={addItemToList}
              handleDragEnd={handleDragEnd}
            />
          </SectionWrapper>
          <SectionWrapper>
            <StepsSection
              updateListInput={updateListInput}
              removeListInput={removeListInput}
              steps={recipeData.steps}
              addItemToList={addItemToList}
              handleDragEnd={handleDragEnd}
            />
          </SectionWrapper>
          <SectionWrapper>
            <TimeSection
              cookTime={recipeData.cookTime}
              prepTime={recipeData.prepTime}
              handleBasicInput={handleBasicInput}
            />
          </SectionWrapper>
          <SectionWrapper>
            <MealTypeSection
              mealTypesFormData={recipeData.mealTypes}
              mealTypes={mealTypesData || []}
              addToList={addToList}
              deleteFromList={deleteFromList}
            />
          </SectionWrapper>
          <SectionWrapper>
            <NationalitySection
              nationalitiesFormData={recipeData.nationalities}
              nationalities={nationalitiesData || []}
              addToList={addToList}
              deleteFromList={deleteFromList}
            />
          </SectionWrapper>
          <SectionWrapper>
            <CookingMethodsSection
              cookingMethodsFormData={recipeData.cookingMethods}
              cookingMethods={cookingMethodsData || []}
              addToList={addToList}
              deleteFromList={deleteFromList}
            />
          </SectionWrapper>
          <Button>Create</Button>
        </form>
      </FormErrorContext.Provider>
    </section>
  );
};

const NameDesImgSection = ({
  name,
  handleStringInput,
  handleFileSelect,
  handleFileDrop,
  imgObjUrl,
  handleFileLoad,
  removeFile,
}: {
  name: addRecipeWithoutMainImage["name"];
  handleStringInput: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    type: "string" | "number",
    name: StringInputNames
  ) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileDrop: (e: React.DragEvent) => void;
  imgObjUrl: undefined | string;
  handleFileLoad: (src: string) => void;
  removeFile: (src: string) => void;
}) => {
  const id = useId();
  const formContext = useContext(FormErrorContext);
  return (
    <div className="grid grid-cols-1 gap-2 sm:h-56 sm:grid-cols-2">
      <div className="flex min-w-[50%] flex-1 shrink-0 flex-col gap-4">
        <div>
          <label className="block" htmlFor={id + "-name"}>
            Name
          </label>
          <FieldValidation error={formContext?.formErrors?.name}>
            <Input
              id={id + "-name"}
              type="text"
              value={name}
              onChange={(e) => handleStringInput(e, "string", "name")}
              className="inline-block w-full border-2 border-gray-500 p-1"
            />
          </FieldValidation>
        </div>
        <div className="flex h-full flex-col">
          <label className="block" htmlFor={id + "-description"}>
            Description
          </label>
          <Textarea
            id={id + "-description"}
            className="h-full resize-none border-2 border-gray-500 p-1"
            onChange={(e) => handleStringInput(e, "string", "description")}
          />
        </div>
      </div>
      {/* Wrapped outside to prevent image upload from shrinking if there's an error */}
      <div className="h-60 sm:h-full">
        <FieldValidation
          error={handleImageErrors(formContext?.formErrors?.imageMetadata)}
        >
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

const TimeSection = ({
  cookTime,
  prepTime,
  handleBasicInput,
}: {
  cookTime: addRecipeWithoutMainImage["cookTime"];
  prepTime: addRecipeWithoutMainImage["prepTime"];
  handleBasicInput: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "string" | "number",
    name: NumberInputNames
  ) => void;
}) => {
  const id = useId();
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <label htmlFor={id + "-prepTime"}>Prep Time</label>
        <input
          id={id + "-prepTime"}
          type="text"
          value={prepTime}
          onChange={(e) => handleBasicInput(e, "number", "prepTime")}
          className="inline-block w-full border-2 border-gray-500 p-1"
        />
      </div>
      <div className="flex-1">
        <label htmlFor={id + "-cookTime"}>Cook Time</label>
        <input
          id={id + "-cookTime"}
          type="text"
          value={cookTime}
          onChange={(e) => handleBasicInput(e, "number", "cookTime")}
          className="inline-block w-full border-2 border-gray-500 p-1"
        />
      </div>
    </div>
  );
};

const IngredientsSection = ({
  updateListInput,
  removeListInput,
  ingredients,
  addItemToList,
  handleDragEnd,
}: {
  updateListInput: (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string,
    type: ListInputFields
  ) => void;
  removeListInput: (id: string, type: ListInputFields) => void;
  ingredients: addRecipeWithoutMainImage["ingredients"];
  addItemToList: (
    e: React.MouseEvent<HTMLButtonElement>,
    isHeader: boolean,
    type: ListInputFields
  ) => void;
  handleDragEnd: (e: DragEndEvent, type: ListInputFields) => void;
}) => {
  const { canDrag, toggleCanDrag, sensors } = useListDnd();
  const formContext = useContext(FormErrorContext);
  const result = addRecipeWithMainImagesSchema
    .pick({ ingredients: true })
    .safeParse({ ingredients: ingredients });
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
        onDragEnd={(e) => handleDragEnd(e, "ingredients")}
      >
        <SortableContext
          items={ingredients}
          strategy={verticalListSortingStrategy}
        >
          {ingredients.map(({ id, name, isHeader }, index) => {
            return (
              <SortableItem key={id} id={id} canDrag={canDrag}>
                <DraggableInput
                  id={id}
                  index={index}
                  type="ingredients"
                  placeholder={
                    isHeader
                      ? "Ingredient Header placeholder"
                      : "e.g. 2 cups of sugar"
                  }
                  canDrag={canDrag}
                  value={name}
                  remove={removeListInput}
                  onChange={updateListInput}
                  isHeader={isHeader}
                />
              </SortableItem>
            );
          })}
        </SortableContext>
      </DndContext>
      {!result.success && formContext?.formErrors && (
        <ErrorBox>
          {result.error.flatten().fieldErrors.ingredients?.[0]}
        </ErrorBox>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={(e) => addItemToList(e, false, "ingredients")}
          className="border-2 border-gray-500 p-1"
        >
          Add Ingredient
        </Button>
        <Button
          type="button"
          onClick={(e) => addItemToList(e, true, "ingredients")}
          className="border-2 border-gray-500 p-1"
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
  cookingMethodsFormData,
  addToList,
  deleteFromList,
}: {
  cookingMethods: CookingMethod[];
  cookingMethodsFormData: addRecipeWithoutMainImage["cookingMethods"];
  addToList: (type: DropdownListNames, objToAdd: DropdownListValues) => void;
  deleteFromList: (type: DropdownListNames, id: string) => void;
}) => {
  return (
    <>
      <h2>Add Cooking methods</h2>
      <p>Add optional cooking methods to filter meals easier in the future</p>
      <div className="flex items-stretch gap-2">
        <Combobox
          data={cookingMethods}
          handleAdd={(objToAdd: DropdownListValues) =>
            addToList("cookingMethods", objToAdd)
          }
          selectedData={cookingMethodsFormData}
        />
      </div>
      <ChipContainer>
        {cookingMethodsFormData.map(({ id, name }) => (
          <Chip
            key={id}
            id={id}
            data={name}
            deleteChip={(id: string) => deleteFromList("cookingMethods", id)}
          />
        ))}
      </ChipContainer>
    </>
  );
};

const MealTypeSection = ({
  mealTypes,
  mealTypesFormData,
  addToList,
  deleteFromList,
}: {
  mealTypes: MealType[];
  mealTypesFormData: addRecipeWithoutMainImage["mealTypes"];
  addToList: (type: DropdownListNames, objToAdd: DropdownListValues) => void;
  deleteFromList: (type: DropdownListNames, id: string) => void;
}) => {
  return (
    <>
      <h2>Add Meal Types</h2>
      <p>
        Add optional meal types to make filter by meals easier in the future
      </p>
      <div className="flex items-stretch gap-2">
        <Combobox
          data={mealTypes}
          handleAdd={(objToAdd: DropdownListValues) =>
            addToList("mealTypes", objToAdd)
          }
          selectedData={mealTypesFormData}
        />
      </div>
      <ChipContainer>
        {mealTypesFormData.map(({ id, name }) => (
          <Chip
            key={id}
            id={id}
            data={name}
            deleteChip={(id: string) => deleteFromList("mealTypes", id)}
          />
        ))}
      </ChipContainer>
    </>
  );
};

const NationalitySection = ({
  nationalities,
  nationalitiesFormData,
  addToList,
  deleteFromList,
}: {
  nationalities: Nationality[];
  nationalitiesFormData: addRecipeWithoutMainImage["nationalities"];
  addToList: (type: DropdownListNames, objToAdd: DropdownListValues) => void;
  deleteFromList: (type: DropdownListNames, id: string) => void;
}) => {
  return (
    <>
      <h2>Add Nationalities</h2>
      <p>Add optional nationalities to filter by meals easier in the future</p>
      <div className="flex items-stretch gap-2">
        <Combobox
          data={nationalities}
          handleAdd={(objToAdd: DropdownListValues) =>
            addToList("nationalities", objToAdd)
          }
          selectedData={nationalitiesFormData}
          multiple={false}
        />
      </div>
      <ChipContainer>
        {nationalitiesFormData.map(({ id, name }) => (
          <Chip
            key={id}
            id={id}
            data={name}
            deleteChip={(id: string) => deleteFromList("nationalities", id)}
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

const StepsSection = ({
  updateListInput,
  removeListInput,
  steps,
  addItemToList,
  handleDragEnd,
}: {
  updateListInput: (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string,
    type: ListInputFields
  ) => void;
  removeListInput: (id: string, type: ListInputFields) => void;
  steps: addRecipeWithoutMainImage["steps"];
  addItemToList: (
    e: React.MouseEvent<HTMLButtonElement>,
    isHeader: boolean,
    type: ListInputFields
  ) => void;
  handleDragEnd: (e: DragEndEvent, type: ListInputFields) => void;
}) => {
  const { canDrag, toggleCanDrag, sensors } = useListDnd();
  const formContext = useContext(FormErrorContext);
  const result = addRecipeWithMainImagesSchema
    .pick({ steps: true })
    .safeParse({ steps: steps });
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
        onDragEnd={(e) => handleDragEnd(e, "steps")}
      >
        <SortableContext items={steps} strategy={verticalListSortingStrategy}>
          {steps.map(({ id, name, isHeader }, index) => {
            return (
              <SortableItem key={id} id={id} canDrag={canDrag}>
                <DraggableInput
                  id={id}
                  index={index}
                  type="steps"
                  placeholder={
                    isHeader ? "Steps Header placeholder" : "e.g. Soup"
                  }
                  canDrag={canDrag}
                  value={name}
                  remove={removeListInput}
                  onChange={updateListInput}
                  isHeader={isHeader}
                />
              </SortableItem>
            );
          })}
        </SortableContext>
      </DndContext>
      {!result.success && formContext?.formErrors && (
        <ErrorBox>{result.error.flatten().fieldErrors.steps?.[0]}</ErrorBox>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={(e) => addItemToList(e, false, "steps")}
          className="border-2 border-gray-500 p-1"
        >
          Add Step
        </Button>
        <Button
          type="button"
          onClick={(e) => addItemToList(e, true, "steps")}
          className="border-2 border-gray-500 p-1"
        >
          Add Header
        </Button>
      </div>
    </>
  );
};

const DraggableInput = ({
  id,
  remove,
  onChange,
  value,
  isHeader,
  canDrag,
  placeholder,
  type,
  index,
}: {
  id: string;
  remove: (id: string, type: ListInputFields) => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string,
    type: ListInputFields
  ) => void;
  value: string | number;
  isHeader: boolean;
  canDrag: boolean;
  placeholder: string;
  type: ListInputFields;
  index: number;
}) => {
  const { attributes, listeners, ref } = useSortableItemContext();
  const formContext = useContext(FormErrorContext);
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
      <FieldValidation
        highlightOnly
        error={formContext?.formErrors?.[type]?.[index]?.name}
      >
        <Input
          value={value}
          placeholder={placeholder}
          disabled={canDrag}
          onChange={(e) => onChange(e, id, type)}
          className={`${
            isHeader ? "font-extrabold" : ""
          } flex-1 border-2 border-gray-500 p-1 tracking-wide`}
        />
      </FieldValidation>
      {!canDrag && (
        <Button
          intent="noBoarder"
          type="button"
          onClick={() => remove(id, type)}
        >
          <BiMinus size={25} />
        </Button>
      )}
    </div>
  );
};

Create.auth = true;
Create.hideNav = true;

export default Create;
