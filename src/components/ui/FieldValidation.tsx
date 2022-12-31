import { useState } from "react";
import { ZodFormattedError } from "zod";
import { AiOutlineInfoCircle } from "react-icons/ai";
import {
  addRecipeWithMainImage,
  addRecipeWithoutMainImage,
} from "@/schemas/recipe";

export function FieldValidation<T>({
  children,
  error,
  highlightOnly,
}: {
  children: React.ReactNode;
  error: ZodFormattedError<T, string> | undefined;
  highlightOnly?: boolean;
}) {
  if (!error || (error._errors && !error._errors.length))
    return <>{children}</>;
  return (
    <div className="error group flex h-full w-full flex-col">
      {children}
      {!highlightOnly && (
        <span className="text-red-500">{error._errors.join(". ")}</span>
      )}
    </div>
  );
}

export function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-2 border-red-500 bg-red-100 p-2 text-red-500">
      <AiOutlineInfoCircle size={20} />
      {children}
    </div>
  );
}

type FormState<Schema> = {
  [K in keyof Schema]: Schema[K] extends string | number | boolean
    ? Schema[K]
    : Schema[K] extends Array<DefaultArrayItem>
    ? Array<DefaultArrayItem>
    : Schema[K] extends Array<BaseArrayItem & Record<string, string | number>>
    ? Array<BaseArrayItem & Record<string, string | number>>
    : never;
};

type BaseArrayItem = {
  id: string;
  order?: number;
};

type DefaultArrayItem = BaseArrayItem & { value: string };

type FilterPrimitives<T> = {
  [key in keyof T as T[key] extends Array<unknown> ? key : never]: T[key];
};

type a = keyof FilterPrimitives<addRecipeWithMainImage>;

export function useForm<T>(initialState: FormState<T>) {
  const [formData, setFormData] = useState<FormState<T>>(initialState);
  const registerPrimitive = (key: keyof FormState<T>) => {
    return {
      onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setFormData({
          ...formData,
          [key]: e.currentTarget.value,
        });
      },
      value: formData[key],
    };
  };
  const registerArrayField = (
    key: keyof FilterPrimitives<T>,
    index: number,
    innerKey?: string
  ) => {
    return {
      onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const list = formData[key];
        if (!isArray(list)) return;
        if (!innerKey) {
          list.push({ id: "1", order: 1, name: "a" });
          setFormData({
            ...formData,
            [key]: [
              ...list,
              {
                id: "1",
                ordjer: index,
                value: e.currentTarget.value,
              },
            ],
          });
        } else {
          setFormData({
            ...formData,
            [key]: [
              ...list,
              { id: "1", order: index, [innerKey]: e.currentTarget.value },
            ],
          });
        }
      },
      value: formData[key],
    };
  };
  return { registerPrimitive, registerArrayField };

  function isArray(input: unknown): input is DefaultArrayItem[] {
    return Array.isArray(input);
  }
}
