import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

// Exclude size b/c it clashes with cva 'size'
// Detailed props has stuf like refs
type InputProps = Omit<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  "size"
> &
  VariantProps<typeof input>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { intent, size, className, ...props }: InputProps,
  ref,
) {
  return (
    <input
      ref={ref}
      className={input({ intent, size, className })}
      {...props}
    />
  );
});

const input = cva(
  "border-gray-500 border-2 p-1 group-[.error]:border-red-500",
  {
    variants: {
      intent: {
        primary: [""],
      },
      size: {
        medium: [""],
        large: ["tracking-wide", "text-xl"],
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "medium",
    },
  },
);
