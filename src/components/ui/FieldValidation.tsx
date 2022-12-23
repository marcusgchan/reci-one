import { ZodFormattedError } from "zod";

export function FieldValidation<T>({
  children,
  error,
}: {
  children: React.ReactNode;
  error: ZodFormattedError<T, string> | undefined;
}) {
  if (!error || (error._errors && !error._errors.length))
    return <>{children}</>;
  return (
    <div>
      {children}
      <span className="text-red-500">{error._errors.join(". ")}</span>
    </div>
  );
}
