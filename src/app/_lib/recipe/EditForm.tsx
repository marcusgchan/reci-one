"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/Button";
import { RouterOutputs } from "~/trpc/shared";
import { CookingMethodsSection } from "./CookingMethodsSection";
import { NationalitiesSection } from "./NationalitiesSection";
import { MealTypesSection } from "./MealtypesSection";
import { TimeSection } from "./TimeSection";
import { DraggableStepList } from "./DraggableStepList";
import { DraggableIngredientList } from "./DraggableIngredientList";
import { NameDesImgSection } from "./NameImgDesSection";
import { FormAddRecipe, addRecipeFormSchema } from "~/schemas/recipe";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useImageUpload } from "~/components/ui/ImageUpload";
import { api } from "~/trpc/react";
import { useSnackbarDispatch } from "~/components/Snackbar";

type RecipeFormData = NonNullable<
  RouterOutputs["recipes"]["getRecipeFormFields"]
>;

export function EditForm({
  initialData: data,
}: {
  initialData: RecipeFormData;
}) {
  const usingUploadedImage = data.mainImage?.type === "presignedUrl";
  const [isUploadedImage, setIsUploadedImage] = useState(usingUploadedImage);
  const methods = useForm<FormAddRecipe>({
    resolver: zodResolver(addRecipeFormSchema),
    defaultValues: data.form,
  });
  const router = useRouter();
  const [defaultSrc, setDefaultSrc] = useState(
    usingUploadedImage ? data.mainImage.src : undefined,
  );
  const params = useParams();
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
  const handleRemoveFile = () => {
    setDefaultSrc(undefined);
    removeFile();
  };
  const queryUtils = api.useUtils();
  const editRecipe = api.recipes.editRecipe.useMutation({
    async onSuccess(presignedPost) {
      if (!presignedPost) {
        snackbarDispatch({
          type: "SUCCESS",
          message: "Successfully edited recipe",
        });
        navigateToRecipe();
        return;
      }
      if (!file) {
        console.log("file is missing");
        // error unable to upload file or user somehow removed img after upload
        snackbarDispatch({
          type: "ERROR",
          message: "There was a problem with uploading your image",
        });
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
        Promise.all([
          queryUtils.recipes.getRecipe.invalidate({
            recipeId: params.recipeId as string,
          }),
          queryUtils.recipes.getRecipes.invalidate(),
          queryUtils.recipes.getRecipeFormFields.invalidate({
            recipeId: params.recipeId as string,
          }),
        ]);
        navigateToRecipe();
      } catch (e) {
        snackbarDispatch({
          type: "ERROR",
          message: "There was a problem with uploading your image",
        });
      }
    },
  });
  const editUrlImageRecipeMutation = api.recipes.editUrlImageRecipe.useMutation(
    {
      onSuccess() {
        snackbarDispatch({
          type: "SUCCESS",
          message: "Successfully create recipe",
        });
        return Promise.all([
          navigateToRecipe(),
          queryUtils.recipes.getRecipe.invalidate({
            recipeId: params.recipeId as string,
          }),
          queryUtils.recipes.getRecipes.invalidate(),
          queryUtils.recipes.getRecipeFormFields.invalidate({
            recipeId: params.recipeId as string,
          }),
        ]);
      },
    },
  );
  const snackbarDispatch = useSnackbarDispatch();
  const {
    formState: { dirtyFields, errors },
  } = methods;
  console.log(errors);
  const createRecipe = methods.handleSubmit((validData) => {
    if (isUploadedImage && validData.image.imageMetadata) {
      const formattedData = {
        id: params.recipeId as string,
        updateImage: !!dirtyFields.image?.imageMetadata,
        fields: {
          ...validData,
          imageMetadata: validData.image.imageMetadata,
        },
      };
      console.log("Mutation");
      editRecipe.mutate(formattedData);
    } else {
      const formattedData = {
        id: params.recipeId as string,
        fields: {
          ...validData,
          urlSourceImage: validData.image.urlSourceImage,
        },
      };
      editUrlImageRecipeMutation.mutate(formattedData);
    }
  });
  const deleteRecipe = api.recipes.delete.useMutation({
    async onSuccess() {
      snackbarDispatch({
        type: "SUCCESS",
        message: "Successfully deleted recipe",
      });
      await queryUtils.recipes.getRecipes.invalidate();
      router.push("/recipes");
    },
  });
  const handleDelete = () =>
    deleteRecipe.mutate({ id: params.recipeId as string });
  const navigateToRecipe = async () =>
    router.push(`../${params.recipeId as string}`);
  return (
    <section className="p-5 pb-10">
      <FormProvider {...methods}>
        <form
          className="m-auto grid w-full max-w-xl grid-cols-1 gap-5 pb-2 text-gray-500"
          noValidate
          onSubmit={createRecipe}
        >
          <div>
            <Button
              intent="noBoarder"
              type="button"
              onClick={navigateToRecipe}
              className="p-1"
            >
              Back
            </Button>
            <div className="flex justify-between">
              <h2 className="text-2xl">Edit Recipe</h2>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={deleteRecipe.isLoading}
              >
                Delete
              </Button>
            </div>
          </div>
          <SectionWrapper>
            <NameDesImgSection
              uploadedImageResult={uploadedImageResult}
              handleFileSelect={handleFileSelect}
              handleFileDrop={handleFileDrop}
              removeFile={handleRemoveFile}
              isUploadedImage={isUploadedImage}
              setIsUploadedImage={setIsUploadedImage}
              defaultSrc={defaultSrc}
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
          <Button disabled={editRecipe.isLoading}>Edit</Button>
        </form>
      </FormProvider>
    </section>
  );
}

const SectionWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col gap-4">{children}</div>;
};
