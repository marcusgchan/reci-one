import { cva, VariantProps } from "class-variance-authority";

// Exclude size b/c it clashes with cva 'size'
// Detailed props has stuf like refs
type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> &
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > &
  VariantProps<typeof input>;

export function Input({ intent, size, className, ...props }: InputProps) {
  return <input className={input({ intent, size, className })} {...props} />;
}

const input = cva("border-gray-500 border-2 p-1", {
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
});
