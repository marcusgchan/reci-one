import { cva, VariantProps } from "class-variance-authority";

export interface ButtonProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export function Button({ intent, children, ...props }: ButtonProps) {
  return (
    <button className={button({ intent })} {...props}>
      {children}
    </button>
  );
}

const button = cva("border-gray-500 border-2 p-1", {
  variants: {
    intent: {
      primary: "",
    },
  },
  defaultVariants: {
    intent: "primary",
  },
});
