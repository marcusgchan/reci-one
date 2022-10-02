import { CustomReactFC } from "@/shared/types";
import { RecipeUpload } from "../../components/recipes/RecipeUpload";
import React, { useId, useState } from "react";

const Create: CustomReactFC = () => {
  const id = useId();
  const [step, setStep] = useState(1);
  const goToNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // handle submit
    }
  };
  return (
    <section>
      <form className="w-full max-w-lg mx-auto text-gray-500 grid gap-2">
        <ResolveStep step={step}>
          <FirstStep />
          <div>2</div>
          <div>3</div>
        </ResolveStep>
        <button
          onClick={goToNextStep}
          className="block border-primary border-2 p-2 ml-auto"
        >
          NEXT
        </button>
      </form>
    </section>
  );
};

const FirstStep = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2">
      <div className="flex shrink-0 flex-1 flex-col gap-4 min-w-[50%]">
        <div>
          <label className="block">Name</label>
          <input
            type="text"
            className="border-gray-500 border-2 w-full inline-block"
          />
        </div>
        <div>
          <label className="block">Description</label>
          <textarea rows={5} className="border-gray-500 border-2 w-full" />
        </div>
      </div>
      <div className="flex-1 shrink-0 bg-red-300">
        <UploadImages />
      </div>
    </div>
  );
};

const ResolveStep = ({
  children,
  step,
}: {
  children: React.ReactNode[];
  step: number;
}) => {
  console.log(children);
  return <>{children.filter((child, i) => i + 1 === step)}</>;
};

const UploadImages = () => {
  return (
    <div>
      <label htmlFor="cover-photo">Upload Recipe Image</label>
      <div className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-8">
        <div className="space-y-1 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
            >
              <span>Upload a file</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>
    </div>
  );
};

Create.auth = true;
Create.hideNav = true;

export default Create;
