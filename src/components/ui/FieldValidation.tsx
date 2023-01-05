import { AiOutlineInfoCircle } from "react-icons/ai";
import { FieldError, MultipleFieldErrors } from "react-hook-form";

export function FieldValidation({
  children,
  error,
  highlightOnly,
}: {
  children: React.ReactNode;
  error: FieldError | MultipleFieldErrors | undefined;
  highlightOnly?: boolean;
}) {
  console.log(error?.message);
  return (
    <>
      {children}
      {!highlightOnly && error?.message && (
        <span className="text-red-500">{error.message}</span>
      )}
    </>
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
