"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { type FormAddRecipe, addRecipeFormSchema } from "~/schemas/recipe";
import { type RouterOutputs } from "~/trpc/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { useImageUpload } from "~/components/ui/ImageUpload";
import { api } from "~/trpc/react";
import { useSnackbarDispatch } from "~/components/Snackbar";
import { Button } from "~/components/ui/Button";
import { NameDesImgSection } from "./NameImgDesSection";
import { DraggableIngredientList } from "./DraggableIngredientList";
import { MealTypesSection } from "./MealtypesSection";
import { TimeSection } from "./TimeSection";
import { DraggableStepList } from "./DraggableStepList";
import { NationalitiesSection } from "./NationalitiesSection";
import { CookingMethodsSection } from "./CookingMethodsSection";
import Link from "next/link";

type RecipeFormData = RouterOutputs["recipes"]["parseRecipe"] | undefined;

export function RecipeForm({
  initialData: data,
}: {
  initialData: RecipeFormData | undefined;
}) {
  const usingUploadedImage =
    (data?.initialData && data.initialData.image.urlSourceImage.length == 0) ??
    true;
  const [isUploadedImage, setIsUploadedImage] = useState(usingUploadedImage);
  const methods = useForm<FormAddRecipe>({
    resolver: zodResolver(addRecipeFormSchema),
    defaultValues: data?.initialData ?? {
      name: "",
      description: "",
      image: {
        urlSourceImage: "",
        imageMetadata: undefined,
      },
      ingredients: [
        { id: uuidv4(), name: "", isHeader: false },
        { id: uuidv4(), name: "", isHeader: false },
        { id: uuidv4(), name: "", isHeader: false },
      ],
      steps: [
        { id: uuidv4(), name: "", isHeader: false },
        { id: uuidv4(), name: "", isHeader: false },
        { id: uuidv4(), name: "", isHeader: false },
      ],
      prepTime: "",
      cookTime: "",
      cookingMethods: [],
      mealTypes: [],
      nationalities: [],
    },
  });
  const router = useRouter();
  const setFileMetadata = (file: File | undefined) => {
    if (file) {
      methods.setValue(
        "image.imageMetadata",
        {
          name: file.name,
          type: file.type,
          size: file.size,
        },
        { shouldDirty: true, shouldTouch: true },
      );
    } else {
      methods.setValue("image.imageMetadata", undefined, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  };
  const {
    file,
    handleFileSelect,
    uploadedImageResult,
    handleFileDrop,
    removeFile,
  } = useImageUpload(setFileMetadata);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addRecipeMutation = api.recipes.addRecipe.useMutation({
    onError() {
      setIsSubmitting(false);
    },
    async onSuccess(presignedPost) {
      if (!file) {
        // error unable to upload file or user somehow removed img after upload
        snackbarDispatch({
          type: "ERROR",
          message: "There was a problem with uploading your image",
        });
        setIsSubmitting(false);
        return;
      }
      if (!presignedPost) {
        snackbarDispatch({
          type: "SUCCESS",
          message: "Successfully create recipe",
        });
        navigateToRecipes();
        router.refresh();
        return;
      }
      // Add fields that are required for presigned post
      const newFormData = new FormData();
      Object.entries(presignedPost.fields).forEach(([field, value]) => {
        newFormData.append(field, value);
      });
      // File must be last item that is appended to form
      newFormData.append("file", file);
      try {
        const res = await fetch(presignedPost.url, {
          method: "POST",
          body: newFormData,
        });
        if (!res.ok) throw new Error("Unable to upload file");
        snackbarDispatch({
          type: "SUCCESS",
          message: "Successfully create recipe",
        });
        navigateToRecipes();
        router.refresh();
      } catch (e) {
        snackbarDispatch({
          type: "ERROR",
          message: "There was a problem with uploading your image",
        });
        setIsSubmitting(false);
      }
    },
  });
  const addParsedRecipeMutation = api.recipes.addParsedRecipe.useMutation({
    onError() {
      setIsSubmitting(false);
    },
    onSuccess() {
      snackbarDispatch({
        type: "SUCCESS",
        message: "Successfully create recipe",
      });
      navigateToRecipes();
      router.refresh();
    },
  });
  const snackbarDispatch = useSnackbarDispatch();
  const createRecipe = methods.handleSubmit((validData) => {
    if (isUploadedImage && validData.image.imageMetadata) {
      const formattedData = {
        ...validData,
        imageMetadata: validData.image.imageMetadata,
        urlSource: data?.siteInfo.url,
        originalAuthor: data?.siteInfo.author,
      };
      addRecipeMutation.mutate(formattedData);
    } else {
      const formattedData = {
        ...validData,
        urlSourceImage: validData.image.urlSourceImage,
        urlSource: data?.siteInfo.url,
        originalAuthor: data?.siteInfo.author,
      };
      addParsedRecipeMutation.mutate(formattedData);
    }
    setIsSubmitting(true);
  });
  const navigateToRecipes = () => router.push("/recipes");
  return (
    <section className="p-5 pb-10">
      <FormProvider {...methods}>
        <form
          className="m-auto grid w-full max-w-xl grid-cols-1 gap-5 pb-2 text-gray-500"
          noValidate
          onSubmit={createRecipe}
        >
          <div>
            <Link
              type="button"
              href="/recipes/create?formStage=1"
              className="p-1"
            >
              Back
            </Link>
            <h2 className="text-2xl">Add Recipe</h2>
          </div>
          <SectionWrapper>
            <NameDesImgSection
              uploadedImageResult={uploadedImageResult}
              handleFileSelect={handleFileSelect}
              handleFileDrop={handleFileDrop}
              removeFile={removeFile}
              isUploadedImage={isUploadedImage}
              setIsUploadedImage={setIsUploadedImage}
            />
          </SectionWrapper>
          <SectionWrapper>
            <DraggableIngredientList />
          </SectionWrapper>
          <SectionWrapper>
            <DraggableStepList />
          </SectionWrapper>
          <SectionWrapper>
            <TimeSection />
          </SectionWrapper>
          <SectionWrapper>
            <MealTypesSection />
          </SectionWrapper>
          <SectionWrapper>
            <NationalitiesSection />
          </SectionWrapper>
          <SectionWrapper>
            <CookingMethodsSection />
          </SectionWrapper>
          <Button disabled={isSubmitting}>Create</Button>
        </form>
      </FormProvider>
    </section>
  );
}

const SectionWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col gap-4">{children}</div>;
};
