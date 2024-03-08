import { Switch } from "@headlessui/react";
import { type SetStateAction, useEffect, useId, useState } from "react";
import {
  type FieldError,
  type FieldErrorsImpl,
  type Merge,
  useFormContext,
  useWatch,
} from "react-hook-form";
import {
  ErrorBox,
  FieldValidation,
  FormItem,
  getErrorMsg,
  hasError,
} from "~/components/ui/FieldValidation";
import {
  ImageUpload,
  type UploadedImageResult,
} from "~/components/ui/ImageUpload";
import { Input } from "~/components/ui/Input";
import { Textarea } from "~/components/ui/Textarea";
import { type FormAddRecipe } from "~/schemas/recipe";

type ImgMetadata = NonNullable<
  Exclude<FormAddRecipe["image"]["imageMetadata"], string>
>;

export function NameDesImgSection({
  uploadedImageResult,
  handleFileSelect,
  handleFileDrop,
  removeFile,
  isUploadedImage,
  setIsUploadedImage,
  defaultSrc,
}: {
  uploadedImageResult: UploadedImageResult;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileDrop: (e: React.DragEvent) => void;
  removeFile: () => void;
  isUploadedImage: boolean;
  setIsUploadedImage: React.Dispatch<SetStateAction<boolean>>;
  defaultSrc?: string;
}) {
  const id = useId();
  const {
    register,
    formState: { errors, submitCount },
    control,
  } = useFormContext<FormAddRecipe>();
  function handleImageErrors(
    uploadErrors: Merge<FieldError, FieldErrorsImpl<ImgMetadata>> | undefined,
  ) {
    if (!uploadErrors) return;
    // File doesn't exist
    // Name must exist if the file is uploaded to browser
    if (uploadErrors?.message) {
      return uploadErrors.name;
    }
    // File too big
    if (uploadErrors?.size) {
      return uploadErrors.size;
    }
    if (uploadErrors?.type) {
      // Invalid file type
      return uploadErrors.types;
    }
  }
  const urlSourceImage = useWatch({ control, name: "image.urlSourceImage" });
  const imageMetadata = useWatch({ control, name: "image.imageMetadata" });
  const [imageErrorMessage, setImageErrorMessage] = useState("");
  useEffect(() => {
    if (!urlSourceImage.length && !imageMetadata && submitCount) {
      setImageErrorMessage("Enter an image url or upload an image");
    } else {
      setImageErrorMessage("");
    }
  }, [urlSourceImage, imageMetadata, submitCount]);
  return (
    <div className="flex flex-col gap-2">
      <div className="grid min-h-[250px] grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="flex min-w-[50%] flex-1 shrink-0 flex-col gap-4">
          <FormItem>
            <label className="block" htmlFor={id + "-name"}>
              Name
            </label>
            <FieldValidation error={errors.name}>
              <Input
                aria-invalid={hasError(errors.name)}
                aria-errormessage={getErrorMsg(errors.name)}
                id={id + "-name"}
                type="text"
                {...register("name")}
                className="inline-block w-full border-2 border-gray-500 p-1"
              />
            </FieldValidation>
          </FormItem>
          <div className="flex h-full flex-col">
            <FormItem className="flex-1">
              <label className="block" htmlFor={id + "-description"}>
                Description
              </label>
              <Textarea
                id={id + "-description"}
                className="h-full min-h-[200px] resize-none border-2 border-gray-500 p-1"
                {...register("description")}
              />
            </FormItem>
          </div>
        </div>
        {/* Wrapped outside to prevent image upload from shrinking if there's an error */}
        <div className="h-full min-h-[20rem] md:min-h-[15rem]">
          <FieldValidation
            error={handleImageErrors(errors.image?.imageMetadata)}
          >
            {isUploadedImage ? (
              <ImageUpload
                uploadedImageResult={uploadedImageResult}
                removeFile={removeFile}
                handleFilesSelect={handleFileSelect}
                handleFileDrop={handleFileDrop}
                defaultSrc={defaultSrc}
              />
            ) : (
              <div className="relative h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={`absolute h-full w-full rounded-md border-2 border-dashed object-cover ${
                    urlSourceImage ? "border-transparent" : ""
                  }`}
                  src={urlSourceImage}
                  alt="recipe image"
                />
              </div>
            )}
          </FieldValidation>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="ml-auto flex items-center gap-2 self-start">
          <span className="whitespace-nowrap">Image Link</span>
          <Switch
            checked={isUploadedImage}
            onChange={setIsUploadedImage}
            className={classNames(
              isUploadedImage ? "bg-accent-500" : "bg-gray-200",
              "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2",
            )}
          >
            <span className="sr-only">Use setting</span>
            <span
              aria-hidden="true"
              className={classNames(
                isUploadedImage ? "translate-x-5" : "translate-x-0",
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              )}
            />
          </Switch>
          <span className="whitespace-nowrap">Upload Image</span>
        </div>
        {!isUploadedImage && (
          <FormItem>
            <label htmlFor={id + "-url"}>Image Url</label>
            <FieldValidation error={errors.image?.urlSourceImage}>
              <Input
                className="w-full"
                aria-errormessage={getErrorMsg(errors.image?.urlSourceImage)}
                aria-invalid={hasError(errors.image?.urlSourceImage)}
                id={id + "-url"}
                {...register("image.urlSourceImage")}
              />
            </FieldValidation>
          </FormItem>
        )}
        {imageErrorMessage.length > 0 && (
          <ErrorBox>{imageErrorMessage}</ErrorBox>
        )}
      </div>
    </div>
  );
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
