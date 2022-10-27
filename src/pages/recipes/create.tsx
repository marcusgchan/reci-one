import { CustomReactFC } from "@/shared/types";
import { RecipeUpload } from "../../components/recipes/RecipeUpload";
import React, { useId, useRef, useState } from "react";
import { BiMinus } from "react-icons/bi";
import { GrDrag } from "react-icons/gr";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Combobox } from "@headlessui/react";
import { useDropdownQuery } from "@/components/recipes/useDropdownQuery";
import { AddRecipeMutation } from "@/schemas/recipe";
import { v4 as uuidv4 } from "uuid";
import type { MealType, Nationality, CookingMethod } from "@prisma/client";
import { Loader } from "@/shared/components/Loader";
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
import { useFormMutations } from "@/components/useFormMutations";
import {
  StringInputNames,
  NumberInputNames,
  DropdownListNames,
  ListInputFields,
  AddRecipeMutationWithId,
  DropdownListValues,
} from "@/components/recipes/types";

const Create: CustomReactFC = () => {
  const id = useId();
  const mutation = trpc.useMutation(["recipes.addRecipe"]);

  const {
    mealTypesData,
    cookingMethodsData,
    nationalitiesData,
    isError,
    isLoading,
  } = useDropdownQuery();
  const [formData, setFormData] = useState<AddRecipeMutationWithId>({
    name: "",
    description: "",
    ingredients: [
      { id: uuidv4(), order: 0, name: "a", isHeader: false },
      { id: uuidv4(), order: 1, name: "b", isHeader: false },
      { id: uuidv4(), order: 2, name: "c", isHeader: false },
    ],
    steps: [
      { id: uuidv4(), order: 0, name: "", isHeader: false },
      { id: uuidv4(), order: 1, name: "", isHeader: false },
      { id: uuidv4(), order: 2, name: "", isHeader: false },
    ],
    prepTime: 0,
    cookTime: 0,
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
  } = useFormMutations(setFormData);

  const handleDragEnd = (event: DragEndEvent, type: ListInputFields) => {
    const { active, over } = event;
    if (active && over && active.id !== over!.id) {
      setFormData((fd) => {
        const oldIndex = fd[type]
          .map(({ id }) => id)
          .indexOf(active.id as string);
        const newIndex = fd[type]
          .map(({ id }) => id)
          .indexOf(over.id as string);
        return {
          ...fd,
          [type]: arrayMove(fd[type], oldIndex, newIndex),
        };
      });
    }
  };

  if (isLoading) {
    return <Loader />;
  }
  return (
    <section className="p-4">
      <form className="w-full max-w-lg m-auto text-gray-500 grid gap-5 pb-2">
        <h2 className="text-2xl">Add Recipe</h2>
        <SectionWrapper>
          <NameDesImgSection
            name={formData.name}
            handleStringInput={handleBasicInput}
          />
        </SectionWrapper>
        <SectionWrapper>
          <IngredientsSection
            updateListInput={updateListInput}
            removeListInput={removeListInput}
            ingredients={formData.ingredients}
            addItemToList={addItemToList}
            handleDragEnd={handleDragEnd}
          />
        </SectionWrapper>
        <SectionWrapper>
          <StepsSection
            updateListInput={updateListInput}
            removeListInput={removeListInput}
            steps={formData.steps}
            addItemToList={addItemToList}
            handleDragEnd={handleDragEnd}
          />
        </SectionWrapper>
        <SectionWrapper>
          <TimeSection
            cookTime={formData.cookTime}
            prepTime={formData.prepTime}
            handleBasicInput={handleBasicInput}
          />
        </SectionWrapper>
        <SectionWrapper>
          <MealTypeSection
            mealTypesFormData={formData.mealTypes}
            mealTypes={mealTypesData || []}
            addToList={addToList}
            deleteFromList={deleteFromList}
          />
        </SectionWrapper>
        <SectionWrapper>
          <NationalitySection
            nationalitiesFormData={formData.nationalities}
            nationalities={nationalitiesData || []}
            addToList={addToList}
            deleteFromList={deleteFromList}
          />
        </SectionWrapper>
        <SectionWrapper>
          <CookingMethodsSection
            cookingMethodsFormData={formData.cookingMethods}
            cookingMethods={cookingMethodsData || []}
            addToList={addToList}
            deleteFromList={deleteFromList}
          />
        </SectionWrapper>
      </form>
    </section>
  );
};

const NameDesImgSection = ({
  name,
  handleStringInput,
}: {
  name: AddRecipeMutation["name"];
  handleStringInput: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    name: StringInputNames
  ) => void;
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2">
      <div className="flex shrink-0 flex-1 flex-col gap-4 min-w-[50%]">
        <div>
          <label className="block">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleStringInput(e, "name")}
            className="border-gray-500 p-1 border-2 w-full inline-block"
          />
        </div>
        <div>
          <label className="block">Description</label>
          <textarea
            rows={5}
            className="border-gray-500 p-1 border-2 w-full"
            onChange={(e) => handleStringInput(e, "description")}
          />
        </div>
      </div>
      <div className="flex-1 shrink-0 bg-red-300">
        <UploadImages />
      </div>
    </div>
  );
};

const TimeSection = ({
  cookTime,
  prepTime,
  handleBasicInput,
}: {
  cookTime: AddRecipeMutation["cookTime"];
  prepTime: AddRecipeMutation["prepTime"];
  handleBasicInput: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: NumberInputNames
  ) => void;
}) => {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <label htmlFor="">Prep Time</label>
        <input
          type="number"
          value={prepTime}
          onChange={(e) => handleBasicInput(e, "prepTime")}
          className="border-gray-500 p-1 border-2 w-full inline-block"
        />
      </div>
      <div className="flex-1">
        <label htmlFor="">Cook Time</label>
        <input
          type="number"
          value={cookTime}
          onChange={(e) => handleBasicInput(e, "cookTime")}
          className="border-gray-500 p-1 border-2 w-full inline-block"
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
  ingredients: AddRecipeMutationWithId["ingredients"];
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
          onClick={(e) => addItemToList(e, false, "ingredients")}
          className="border-gray-500 border-2 p-1"
        >
          ADD INGREDIENT
        </button>
        <button
          onClick={(e) => addItemToList(e, true, "ingredients")}
          className="border-gray-500 border-2 p-1"
        >
          ADD HEADER
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
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id, disabled: !canDrag });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const CookingMethodsSection = ({
  cookingMethods,
  cookingMethodsFormData,
  addToList,
  deleteFromList,
}: {
  cookingMethods: CookingMethod[];
  cookingMethodsFormData: AddRecipeMutationWithId["cookingMethods"];
  addToList: (type: DropdownListNames, objToAdd: DropdownListValues) => void;
  deleteFromList: (type: DropdownListNames, id: string) => void;
}) => {
  return (
    <>
      <h2>Add Cooking methods</h2>
      <p>Add optional cooking methods to filter meals easier in the future</p>
      <div className="flex gap-2 items-stretch">
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
  mealTypesFormData: AddRecipeMutationWithId["mealTypes"];
  addToList: (type: DropdownListNames, objToAdd: DropdownListValues) => void;
  deleteFromList: (type: DropdownListNames, id: string) => void;
}) => {
  return (
    <>
      <h2>Add Meal Types</h2>
      <p>
        Add optional meal types to make filter by meals easier in the future
      </p>
      <div className="flex gap-2 items-stretch">
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
  nationalitiesFormData: AddRecipeMutationWithId["nationalities"];
  addToList: (type: DropdownListNames, objToAdd: DropdownListValues) => void;
  deleteFromList: (type: DropdownListNames, id: string) => void;
}) => {
  return (
    <>
      <h2>Add Nationalities</h2>
      <p>Add optional nationalities to filter by meals easier in the future</p>
      <div className="flex gap-2 items-stretch">
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
          className="w-full border-2 border-gray-500 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          onChange={(e) => setQuery(e.target.value)}
          displayValue={(mealType: MealType) => mealType?.name}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-full text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        {filteredData.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
  steps: AddRecipeMutationWithId["steps"];
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
          onClick={(e) => addItemToList(e, false, "steps")}
          className="border-gray-500 border-2 p-1"
        >
          ADD STEP
        </button>
        <button
          onClick={(e) => addItemToList(e, true, "steps")}
          className="border-gray-500 border-2 p-1"
        >
          ADD HEADER
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
  return (
    <div className="flex items-center gap-2">
      {canDrag && <GrDrag size={20} className="cursor-grab" />}
      <input
        value={value}
        placeholder={placeholder}
        disabled={canDrag}
        onChange={(e) => onChange(e, id, type)}
        className={`${
          isHeader ? "font-extrabold" : ""
        } border-gray-500 border-2 flex-1 p-1 tracking-wide`}
      />
      {!canDrag && (
        <button onClick={() => remove(id, type)}>
          <BiMinus size={30} />
        </button>
      )}
    </div>
  );
};

const UploadImages = () => {
  return (
    <div>
      <label htmlFor="cover-photo">Upload Recipe Image</label>
      <div className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-8">
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
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
            >
              <span>Upload a file</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>
    </div>
  );
};

Create.auth = true;
Create.hideNav = true;

export default Create;
