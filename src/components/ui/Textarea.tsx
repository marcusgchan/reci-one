import { cva, VariantProps } from "class-variance-authority";

type TextareaProps = Omit<
  React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >,
  "size"
> &
  VariantProps<typeof textarea>;

export function Textarea({ intent, size, className, ...props }: TextareaProps) {
  return (
    <textarea className={textarea({ intent, size, className })} {...props} />
  );
}

const textarea = cva("border-gray-500 border-2 p-1", {
  variants: {
    intent: {
      primary: [""],
    },
    size: {
      medium: [""],
      stretch: ["h-full", "w-full"],
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "stretch",
  },
});
