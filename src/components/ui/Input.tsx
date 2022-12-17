import { cva, VariantProps } from "class-variance-authority";

export interface ButtonProps
  extends React.HTMLAttributes<HTMLInputElement>,
    VariantProps<typeof input> {}

export function Input({ intent, ...props }: ButtonProps) {
  return <input className={input({ intent })} {...props} />;
}

const input = cva("border-gray-500 border-2 p-1", {
  variants: {
    intent: {
      primary: "",
    },
  },
  defaultVariants: {
    intent: "primary",
  },
});
