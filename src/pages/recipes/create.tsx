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
import { Ingredient } from "@prisma/client";

type StringInputNames = "name" | "description";

const Create: CustomReactFC = () => {
  const id = useId();
  const {
    mealTypesData,
    cookingMethodsData,
    nationalitiesData,
    isError,
    isLoading,
  } = useDropdownQuery();
  const [formData, setFormData] = useState<AddRecipeMutation>({
    name: "",
    description: "",
    ingredients: [
      { id: uuidv4(), order: 1, name: "", isHeader: false },
      { id: uuidv4(), order: 2, name: "", isHeader: false },
      { id: uuidv4(), order: 3, name: "", isHeader: false },
    ],
    steps: [
      { id: uuidv4(), order: 1, name: "", isHeader: false },
      { id: uuidv4(), order: 2, name: "", isHeader: false },
      { id: uuidv4(), order: 3, name: "", isHeader: false },
    ],
    prepTime: null,
    cookTime: null,
    isPublic: false,
  });
  const updateIngredientInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    setFormData((fd) => {
      const indexToUpdate = fd.ingredients.findIndex(
        (ingredient) => ingredient.id === id
      );
      if (indexToUpdate === -1) throw new Error("Id must exist");
      const copy = fd.ingredients.map((x) => ({ ...x }));
      const objectToUpdate = copy[indexToUpdate];
      objectToUpdate!.name = e.target.value;
      return { ...fd, steps: fd.steps.map((x) => x), ingredients: copy };
    });
  };
  const removeIngredient = (id: string) => {
    setFormData((fd) => {
      return {
        ...fd,
        ingredients: fd.ingredients.filter((ingrdient) => ingrdient.id !== id),
      };
    });
  };
  const addItem = (
    e: React.MouseEvent<HTMLButtonElement>,
    isHeader: boolean,
    type: "ingredients" | "steps"
  ) => {
    e.preventDefault();
    setFormData((fd) => {
      return {
        ...fd,
        [type]: [
          ...fd[type],
          {
            id: uuidv4(),
            order: fd[type].length + 1,
            name: "",
            isHeader: isHeader,
          },
        ],
      };
    });
  };
  const updateStepInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    setFormData((fd) => {
      const indexToUpdate = fd.steps.findIndex(
        (ingredient) => ingredient.id === id
      );
      if (indexToUpdate === -1) throw new Error("Id must exist");
      const copy = fd.steps.map((x) => ({ ...x }));
      const objectToUpdate = copy[indexToUpdate];
      objectToUpdate!.name = e.target.value;
      return { ...fd, steps: copy, ingredients: fd.ingredients.map((x) => x) };
    });
  };
  const removeStep = (id: string) => {
    setFormData((fd) => {
      return {
        ...fd,
        steps: fd.steps.filter((step) => step.id !== id),
      };
    });
  };

  const handleStringInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    name: StringInputNames
  ) => {
    setFormData((fd) => {
      return {
        ...fd,
        [name]: e.target.value,
      };
    });
  };
  return (
    <section>
      <form className="w-full max-w-lg mx-auto text-gray-500 grid gap-5 pb-2">
        <SectionWrapper>
          <NameDesImgSection
            name={formData.name}
            handleStringInput={handleStringInput}
          />
        </SectionWrapper>
        <SectionWrapper>
          <IngredientsSection
            updateIngredientInput={updateIngredientInput}
            removeIngredient={removeIngredient}
            ingredients={formData.ingredients}
            addItem={addItem}
          />
        </SectionWrapper>
        <SectionWrapper>
          <StepsSection
            updateStepInput={updateStepInput}
            removeStep={removeStep}
            steps={formData.steps}
            addItem={addItem}
          />
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
            className="border-gray-500 border-2 w-full inline-block"
          />
        </div>
        <div>
          <label className="block">Description</label>
          <textarea
            rows={5}
            className="border-gray-500 border-2 w-full"
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

const TimeSection = () => {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <label htmlFor="">Prep Time</label>
        <input
          type="number"
          className="border-gray-500 border-2 w-full inline-block"
        />
      </div>
      <div className="flex-1">
        <label htmlFor="">Cook Time</label>
        <input
          type="number"
          className="border-gray-500 border-2 w-full inline-block"
        />
      </div>
    </div>
  );
};

const IngredientsSection = ({
  updateIngredientInput,
  removeIngredient,
  ingredients,
  addItem,
}: {
  updateIngredientInput: (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => void;
  removeIngredient: (id: string) => void;
  ingredients: AddRecipeMutation["ingredients"];
  addItem: (
    e: React.MouseEvent<HTMLButtonElement>,
    isHeader: boolean,
    type: "ingredients" | "steps"
  ) => void;
}) => {
  return (
    <>
      <h2>Add Ingredients</h2>
      <p>
        Enter ingredients below. One ingredient per line and it should include
        the measurements. Add optional headers to group ingredients
      </p>
      {ingredients.map(({ id, name, isHeader }) => {
        return (
          <DraggableInput
            key={id}
            id={id}
            value={name}
            remove={removeIngredient}
            onChange={updateIngredientInput}
            isHeader={isHeader}
          />
        );
      })}
      <div className="flex gap-2">
        <button
          onClick={(e) => addItem(e, false, "ingredients")}
          className="border-gray-500 border-2 p-1"
        >
          ADD INGREDIENT
        </button>
        <button
          onClick={(e) => addItem(e, true, "ingredients")}
          className="border-gray-500 border-2 p-1"
        >
          ADD HEADER
        </button>
      </div>
    </>
  );
};

const CookingMethodsSection = () => {
  return (
    <>
      <h2>Add Cooking methods</h2>
      <p>Add optional cooking methods to filter meals easier in the future</p>
      <div className="flex gap-2 items-stretch">
        <SearchableSelect />
        <button className="border-2 border-gray-500 p-1">ADD</button>
      </div>
    </>
  );
};

const MealTypeSection = () => {
  return (
    <>
      <h2>Add Mealtypes</h2>
      <p>
        Add optional meal types to make filter by meals easier in the future
      </p>
      <div className="flex gap-2 items-stretch">
        <SearchableSelect />
        <button className="border-2 border-gray-500 p-1">ADD</button>
      </div>
      <div>
        <Chips />
        <Chips />
        <Chips />
        <Chips />
        <Chips />
        <Chips />
        <Chips />
        <Chips />
        <Chips />
        <Chips />
        <Chips />
        <Chips />
      </div>
    </>
  );
};

const NationalitySection = () => {
  return (
    <>
      <h2>Add Nationalities</h2>
      <p>Add optional nationalities to filter by meals easier in the future</p>
      <div className="flex gap-2 items-stretch">
        <SearchableSelect />
        <button className="border-2 border-gray-500 p-1">ADD</button>
      </div>
    </>
  );
};

const Chips = () => {
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-100 py-0.5 pl-2.5 pr-1 text-sm font-medium text-indigo-700">
      Large
      <button
        type="button"
        className="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
      >
        <span className="sr-only">Remove large option</span>
        <svg
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

const SearchableSelect = () => {
  const people = [
    { id: 1, name: "Leslie Alexander" },
    // More users...
  ];
  const [query, setQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState();

  const filteredPeople =
    query === ""
      ? people
      : people.filter((person) => {
          return person.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Combobox
      className="flex-1"
      as="div"
      value={selectedPerson}
      onChange={setSelectedPerson}
    >
      <div className="relative">
        <Combobox.Input
          className="w-full border-2 border-gray-500 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(person) => person?.name}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        {filteredPeople.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredPeople.map((person) => (
              <Combobox.Option
                key={person.id}
                value={person}
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
                      {person.name}
                    </span>

                    {selected && (
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
  updateStepInput,
  removeStep,
  steps,
  addItem,
}: {
  updateStepInput: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  removeStep: (id: string) => void;
  steps: AddRecipeMutation["steps"];
  addItem: (
    e: React.MouseEvent<HTMLButtonElement>,
    isHeader: boolean,
    type: "ingredients" | "steps"
  ) => void;
}) => {
  return (
    <>
      <h2>Add Steps</h2>
      <p>
        Enter Steps below. One Step per line. Add optional headers to group
        steps
      </p>
      {steps.map(({ id, name, isHeader }) => {
        return (
          <DraggableInput
            key={id}
            id={id}
            value={name}
            remove={removeStep}
            onChange={updateStepInput}
            isHeader={isHeader}
          />
        );
      })}
      <div className="flex gap-2">
        <button
          onClick={(e) => addItem(e, false, "steps")}
          className="border-gray-500 border-2 p-1"
        >
          ADD STEP
        </button>
        <button
          onClick={(e) => addItem(e, true, "steps")}
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
}: {
  id: string;
  remove: (id: string) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  value: string | number;
  isHeader: boolean;
}) => {
  return (
    <div className="flex items-center gap-2">
      <GrDrag size={20} className="cursor-grab" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e, id)}
        className={`${
          isHeader ? "font-extrabold" : ""
        } border-gray-500 border-2 flex-1 p-1 tracking-wide`}
      />
      <BiMinus size={30} onClick={(e) => remove(id)} />
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
