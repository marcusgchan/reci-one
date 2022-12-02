import { CustomReactFC } from "@/shared/types";
import React, { useId, useState, useMemo, useContext } from "react";
import { BiMinus } from "react-icons/bi";
import { GrDrag } from "react-icons/gr";
import { CgCloseO } from "react-icons/cg";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Combobox } from "@headlessui/react";
import { useDropdownQuery } from "@/components/recipes/useDropdownQuery";
import {
  addRecipeWithMainImagesSchema,
  addRecipeWithoutMainImage,
} from "@/schemas/recipe";
import { v4 as uuidv4 } from "uuid";
import type { MealType, Nationality, CookingMethod } from "@prisma/client";
import { trpc } from "@/utils/trpc";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
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
import { useImageUpload } from "@/components/recipes/useImageUpload";
import Image from "next/image";
import { LoaderSection } from "@/components/LoaderSection";
import {
  SortableItemContext,
  useSortableItemContext,
} from "@/components/recipes/useSortableItemContext";

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

  const mutation = trpc.recipes.addRecipe.useMutation({
    async onSuccess(presignedPost) {
      const file = formData.get("file");
      if (!file) {
        // error unable to upload file (show snackbar)
        return;
      }
      // Add fields that are required for presigned post
      const newFormData = new FormData();
      Object.entries(presignedPost.fields).forEach(([field, value]) => {
        newFormData.append(field, value);
      });
      // File must be last item that is appended to form
      newFormData.append("file", file);
      await fetch(presignedPost.url, {
        method: "POST",
        body: newFormData,
      });
      navigateToRecipes();
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
      setRecipeData((fd) => {
        const oldIndex = fd[type]
          .map(({ id }) => id)
          .indexOf(active.id as string);
        const newIndex = fd[type]
          .map(({ id }) => id)
          .indexOf(over.id as string);
        const updatedArray = arrayMove(fd[type], oldIndex, newIndex);
        return {
          ...fd,
          [type]: updatedArray.map((item, i) => ({ ...item, order: i })),
        };
      });
    }
  };

  const createRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...recipeData,
      imageMetadata: { name: file?.name, type: file?.type, size: file?.size },
    };
    const result = addRecipeWithMainImagesSchema.safeParse(data);
    if (result.success) {
      mutation.mutate(result.data);
    }
    // Todo: handle errors
  };

  const navigateToRecipes = () => router.push("/recipes");

  if (isLoading || isError) {
    return <LoaderSection centerFixed />;
  }

  return (
    <section className="p-5 pb-10">
      <form
        className="m-auto grid w-full max-w-xl grid-cols-1 gap-5 pb-2 text-gray-500"
        onSubmit={createRecipe}
      >
        <div>
          <button type="button" onClick={navigateToRecipes} className="p-1">
            Back
          </button>
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
        <button className="border-2 border-gray-500 p-1">Create</button>
      </form>
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
  return (
    <div className="grid grid-cols-1 gap-2 sm:h-56 sm:grid-cols-2">
      <div className="flex min-w-[50%] flex-1 shrink-0 flex-col gap-4">
        <div>
          <label className="block" htmlFor={id + "-name"}>
            Name
          </label>
          <input
            id={id + "-name"}
            type="text"
            value={name}
            onChange={(e) => handleStringInput(e, "string", "name")}
            className="inline-block w-full border-2 border-gray-500 p-1"
          />
        </div>
        <div className="flex h-full flex-col">
          <label className="block" htmlFor={id + "-description"}>
            Description
          </label>
          <textarea
            id={id + "-description"}
            className="w-full flex-1 basis-full resize-none border-2 border-gray-500 p-1"
            onChange={(e) => handleStringInput(e, "string", "description")}
          />
        </div>
      </div>
      <div className="h-60 sm:h-full">
        <UploadImages
          handleFileLoad={handleFileLoad}
          removeFile={removeFile}
          handleFilesSelect={handleFileSelect}
          handleFileDrop={handleFileDrop}
          imgObjUrl={imgObjUrl}
        />
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
  return (
    <>
      <h2>Add Ingredients</h2>
      <p>
        Enter ingredients below. One ingredient per line and it should include
        the measurements. Add optional headers to group ingredients
      </p>
      <button
        className="self-start"
        type="button"
        aria-label="Toggle rearrange"
        onClick={toggleCanDrag}
      >
        <MdCompareArrows className="rotate-90" size={20} />
      </button>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e) => handleDragEnd(e, "ingredients")}
      >
        <SortableContext
          items={ingredients}
          strategy={verticalListSortingStrategy}
        >
          {ingredients.map(({ id, name, isHeader }) => {
            return (
              <SortableItem key={id} id={id} canDrag={canDrag}>
                <DraggableInput
                  id={id}
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

      <div className="flex gap-2">
        <button
          type="button"
          onClick={(e) => addItemToList(e, false, "ingredients")}
          className="border-2 border-gray-500 p-1"
        >
          Add Ingredient
        </button>
        <button
          type="button"
          onClick={(e) => addItemToList(e, true, "ingredients")}
          className="border-2 border-gray-500 p-1"
        >
          Add Header
        </button>
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
        <SearchableSelect
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
        <SearchableSelect
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
        <SearchableSelect
          data={nationalities}
          handleAdd={(objToAdd: DropdownListValues) =>
            addToList("nationalities", objToAdd)
          }
          selectedData={nationalitiesFormData}
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

const Chip = ({
  data,
  id,
  deleteChip,
}: {
  data: string;
  id: string;
  deleteChip: (id: string) => void;
}) => {
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-100 py-0.5 pl-2.5 pr-1 text-sm font-medium text-indigo-700">
      {data}
      <button
        onClick={() => deleteChip(id)}
        type="button"
        className="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
      >
        <span className="sr-only">Remove {data} option</span>
        <svg
          onClick={() => deleteChip(id)}
          className="h-2 w-2"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 8 8"
        >
          <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
        </svg>
      </button>
    </span>
  );
};

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

const SearchableSelect = ({
  data,
  handleAdd,
  selectedData,
}: {
  data: MealType[];
  handleAdd: (value: MealType) => void;
  selectedData: MealType[];
}) => {
  const [query, setQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<MealType | "">();

  const filteredData =
    query === ""
      ? data
      : data.filter((mealType) => {
          return mealType.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Combobox
      className="flex-1"
      as="div"
      value={selectedPerson}
      onChange={(e: MealType | Nationality | CookingMethod) => {
        if (selectedData.filter((data) => data.id === e.id).length > 0) {
          setSelectedPerson("");
          return;
        }
        handleAdd(e);
        setSelectedPerson("");
      }}
    >
      <div className="relative">
        <Combobox.Input
          autoComplete="off"
          className="w-full border-2 border-gray-500 py-2 pl-3 pr-10 shadow-sm sm:text-sm"
          onChange={(e) => setQuery(e.target.value)}
          displayValue={(mealType: MealType) => mealType?.name}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        {filteredData.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm">
            {filteredData.map((data) => (
              <Combobox.Option
                key={data.id}
                value={data}
                className={({ active }) =>
                  classNames(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active ? "bg-indigo-600 text-white" : "text-gray-900"
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <span
                      className={classNames(
                        "block truncate",
                        selected && "font-semibold"
                      )}
                    >
                      {data.name}
                    </span>

                    {selectedData.map((data) => data.id).includes(data.id) && (
                      <span
                        className={classNames(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active ? "text-white" : "text-indigo-600"
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
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
  return (
    <>
      <h2>Add Steps</h2>
      <p>
        Enter Steps below. One Step per line. Add optional headers to group
        steps
      </p>
      <button
        className="self-start"
        type="button"
        aria-label="Toggle rearrange"
        onClick={toggleCanDrag}
      >
        <MdCompareArrows className="rotate-90" size={20} />
      </button>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e) => handleDragEnd(e, "steps")}
      >
        <SortableContext items={steps} strategy={verticalListSortingStrategy}>
          {steps.map(({ id, name, isHeader }) => {
            return (
              <SortableItem key={id} id={id} canDrag={canDrag}>
                <DraggableInput
                  id={id}
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
      <div className="flex gap-2">
        <button
          type="button"
          onClick={(e) => addItemToList(e, false, "steps")}
          className="border-2 border-gray-500 p-1"
        >
          Add Step
        </button>
        <button
          type="button"
          onClick={(e) => addItemToList(e, true, "steps")}
          className="border-2 border-gray-500 p-1"
        >
          Add Header
        </button>
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
}) => {
  const { attributes, listeners, ref } = useSortableItemContext();
  return (
    <div className="flex items-center gap-2">
      {canDrag && (
        <button
          className="touch-manipulation"
          {...attributes}
          {...listeners}
          ref={ref}
        >
          <GrDrag size={25} className="cursor-grab" />
        </button>
      )}
      <input
        value={value}
        placeholder={placeholder}
        disabled={canDrag}
        onChange={(e) => onChange(e, id, type)}
        className={`${
          isHeader ? "font-extrabold" : ""
        } flex-1 border-2 border-gray-500 p-1 tracking-wide`}
      />
      {!canDrag && (
        <button type="button" onClick={() => remove(id, type)}>
          <BiMinus size={30} />
        </button>
      )}
    </div>
  );
};

const UploadImages = ({
  handleFilesSelect,
  handleFileDrop,
  imgObjUrl,
  handleFileLoad,
  removeFile,
}: {
  handleFilesSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileDrop: (e: React.DragEvent) => void;
  imgObjUrl: string | undefined;
  handleFileLoad: (src: string) => void;
  removeFile: (src: string) => void;
}) => {
  return (
    <div className="flex h-full flex-col">
      <label htmlFor="cover-photo">Upload Recipe Image</label>
      {!imgObjUrl ? (
        <div
          className="cursor-drop flex h-full items-center justify-center rounded-md border-2 border-dashed border-gray-400 px-6 py-8"
          onDrop={handleFileDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex items-center text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="border-gray relative cursor-pointer rounded-md border-2 bg-white p-[0.5px] font-medium text-gray-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  multiple={false}
                  onChange={handleFilesSelect}
                  className="sr-only"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      ) : (
        <div className="relative h-full">
          <button
            onClick={() => removeFile(imgObjUrl)}
            className="absolute right-0 top-0 z-10 translate-x-1/2 -translate-y-1/2 rounded-full bg-white text-gray-400 outline-offset-2 transition-transform hover:scale-110 focus:scale-110"
          >
            <CgCloseO size={25} />
          </button>
          <Image
            src={imgObjUrl}
            onLoad={() => handleFileLoad(imgObjUrl)}
            objectFit="cover"
            layout="fill"
            alt="uploaded image"
          />
        </div>
      )}
    </div>
  );
};

Create.auth = true;
Create.hideNav = true;

export default Create;
