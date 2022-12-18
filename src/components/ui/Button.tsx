import { cva, VariantProps } from "class-variance-authority";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > &
  VariantProps<typeof button>;

export function Button({
  intent,
  size,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={button({ intent, size, className })} {...props}>
      {children}
    </button>
  );
}

const button = cva("p-1", {
  variants: {
    intent: {
      primary: ["border-gray-500", "border-2"],
      noBoarder: [""],
    },
    size: {
      large: ["p-2"],
      medium: ["p-1"],
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "medium",
  },
});
