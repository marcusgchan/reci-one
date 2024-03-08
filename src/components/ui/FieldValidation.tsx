import { cva, type VariantProps } from "class-variance-authority";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { type FieldError, type MultipleFieldErrors } from "react-hook-form";

export function FieldValidation({
  children,
  error,
  highlightOnly,
}: {
  children: React.ReactNode;
  error: FieldError | MultipleFieldErrors | undefined;
  highlightOnly?: boolean;
}) {
  return (
    <div
      className={`${
        error?.message ? "error" : ""
      } group flex h-full w-full flex-col`}
    >
      {children}
      {!highlightOnly && error?.message && (
        <span className="text-red-500">{error.message}</span>
      )}
    </div>
  );
}

export function hasError(error: FieldError | MultipleFieldErrors | undefined) {
  return error?.message ? true : false;
}

export function getErrorMsg(error: FieldError | undefined) {
  if (!error?.message) return;
  return error.message;
}

export function ErrorBox({
  children,
}: {
  children: React.ReactNode | undefined;
}) {
  if (!children) return null;
  return (
    <div className="flex items-center gap-2 border-2 border-red-500 bg-red-100 p-2 text-red-500">
      <AiOutlineInfoCircle size={20} />
      {children}
    </div>
  );
}

type FormItem = Omit<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  "size"
> &
  VariantProps<typeof formItem>;
const formItem = cva("flex flex-col gap-2", {
  variants: {
    intent: {
      primary: [""],
    },
  },
  defaultVariants: {
    intent: "primary",
  },
});

export function FormItem({
  children,
  intent,
  className,
}: FormItem & { children: React.ReactNode }) {
  return <div className={formItem({ className, intent })}>{children}</div>;
}
