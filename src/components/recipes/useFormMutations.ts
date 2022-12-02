import {
  StringInputNames,
  NumberInputNames,
  DropdownListNames,
  ListInputFields,
} from "./types";
import { v4 as uuidv4 } from "uuid";
import { CookingMethod, MealType, Nationality } from "@prisma/client";
import { addRecipeWithoutMainImage } from "@/schemas/recipe";

export function useFormMutations(
  setFormData: (value: React.SetStateAction<addRecipeWithoutMainImage>) => void
) {
  const updateListInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string,
    type: ListInputFields
  ) => {
    setFormData((fd) => {
      return {
        ...fd,
        [type]: fd[type].map((item) => {
          if (item.id === id) {
            return {
              ...item,
              name: e.target.value,
            };
          }
          return item;
        }),
      };
    });
  };
  const removeListInput = (id: string, type: ListInputFields) => {
    setFormData((fd) => {
      return {
        ...fd,
        [type]: fd[type].filter((item) => item.id !== id),
      };
    });
  };
  const addItemToList = (
    e: React.MouseEvent<HTMLButtonElement>,
    isHeader: boolean,
    type: ListInputFields
  ) => {
    e.preventDefault();
    setFormData((fd) => {
      return {
        ...fd,
        [type]: [
          ...fd[type],
          {
            id: uuidv4(),
            order: fd[type].length,
            name: "",
            isHeader: isHeader,
          },
        ],
      };
    });
  };
  const handleBasicInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    type: "string" | "number",
    name: StringInputNames | NumberInputNames
  ) => {
    if (type === "string") {
      setFormData((fd) => {
        return {
          ...fd,
          [name]: e.target.value,
        };
      });
    } else if (type === "number") {
      setFormData((fd) => {
        const updatedValue = e.target.value;
        let computedUpdatedValue: number | "";
        // Number('') returns 0
        // Set to '' value of not a number
        if (updatedValue === "" || Number.isNaN(Number(updatedValue))) {
          computedUpdatedValue = "";
        } else {
          computedUpdatedValue = Number(updatedValue);
        }
        return {
          ...fd,
          [name]: computedUpdatedValue,
        };
      });
    }
  };
  const addToList = (
    type: DropdownListNames,
    objToAdd: MealType | Nationality | CookingMethod
  ) => {
    setFormData((fd) => {
      return {
        ...fd,
        [type]: [...fd[type], { ...objToAdd }],
      };
    });
  };
  const deleteFromList = (type: DropdownListNames, id: string) => {
    setFormData((fd) => {
      return {
        ...fd,
        [type]: fd[type].filter((value) => value.id !== id),
      };
    });
  };
  return {
    updateListInput,
    removeListInput,
    addItemToList,
    handleBasicInput,
    addToList,
    deleteFromList,
  };
}
