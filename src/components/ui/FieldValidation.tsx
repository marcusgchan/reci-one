import { useState } from "react";
import { ZodFormattedError } from "zod";
import { AiOutlineInfoCircle } from "react-icons/ai";

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
  [K in keyof Schema]: Schema[K] extends string | number | { name: string }[]
    ? Schema[K]
    : never;
};

export function useInitializeFormErrors<T>() {
  const [formErrors, setFormErrors] = useState<FormState<T> | null>(null);
  const resetForm = () => setFormErrors(null);
  return { formErrors, resetForm, setFormErrors };
}
