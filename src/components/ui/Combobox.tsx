import { Combobox as HeadlessCombobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

export function Combobox<T extends { name: string; id: string }>({
  data,
  handleAdd,
  selectedData,
  multiple = true,
}: {
  data: T[];
  handleAdd: (value: T) => void;
  selectedData: T[];
  multiple?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [currentlySelectedOption, setCurrentlySelectedOption] = useState<
    T | ""
  >();

  const filteredData =
    query === ""
      ? data
      : data.filter((option) => {
          return option.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <HeadlessCombobox
      className="flex-1"
      as="div"
      value={currentlySelectedOption}
      onChange={(e: T) => {
        if (
          multiple &&
          selectedData.filter((data) => data.id === e.id).length > 0
        ) {
          setCurrentlySelectedOption("");
          return;
        }
        handleAdd(e);
      }}
    >
      <div className="relative">
        <HeadlessCombobox.Input
          autoComplete="off"
          className="w-full border-2 border-gray-500 py-2 pl-3 pr-10 shadow-sm sm:text-sm"
          onChange={(e) => setQuery(e.target.value)}
          displayValue={(mealType: T) => mealType?.name}
        />
        <HeadlessCombobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </HeadlessCombobox.Button>

        {filteredData.length > 0 && (
          <HeadlessCombobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm">
            {filteredData.map((data) => (
              <HeadlessCombobox.Option
                key={data.id}
                value={data}
                className={({ active }) =>
                  classNames(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active ? "bg-accent-400 text-white" : "text-gray-900"
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
                          active ? "text-white" : "text-accent-400"
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </HeadlessCombobox.Option>
            ))}
          </HeadlessCombobox.Options>
        )}
      </div>
    </HeadlessCombobox>
  );
}

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}
