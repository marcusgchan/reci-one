import { cva, VariantProps } from "class-variance-authority";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
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
      stretch: ["h-full", "w-full"],
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "stretch",
  },
});
