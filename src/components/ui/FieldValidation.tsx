import { useState } from "react";
import { ZodFormattedError } from "zod";

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
    <div className={"error group flex w-full flex-col"}>
      {children}
      {!highlightOnly && (
        <span className="text-red-500">{error._errors.join(". ")}</span>
      )}
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
