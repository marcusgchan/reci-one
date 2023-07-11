import { CustomReactFC } from "@/shared/types";
import React, {
  SetStateAction,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { BiMinus } from "react-icons/bi";
import { GrDrag } from "react-icons/gr";
import { FormAddRecipe, addRecipeFormSchema } from "@/schemas/recipe";
import { v4 as uuidv4 } from "uuid";
import { RouterOutputs, trpc } from "@/utils/trpc";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useListDnd } from "@/components/recipes/useListDnd";
import { MdCompareArrows } from "react-icons/md";
import {
  ListInputFields,
  DropdownListValues,
} from "@/components/recipes/types";
import { useRouter } from "next/router";
import {
  SortableItemContext,
  useSortableItemContext,
} from "@/components/recipes/useSortableItemContext";
import { useSnackbarDispatch } from "@/components/Snackbar";
import { Combobox } from "@/ui/Combobox";
import { Chip } from "@/components/ui/Chip";
import {
  ImageUpload,
  UploadedImageResult,
  useImageUpload,
} from "@/ui/ImageUpload";
import { Input } from "@/ui/Input";
import { Textarea } from "@/ui/Textarea";
import { Button } from "@/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  UseFieldArrayRemove,
  UseFormRegister,
  useFieldArray,
  useForm,
  useFormContext,
  FieldError,
  FieldErrorsImpl,
  Merge,
  useWatch,
} from "react-hook-form";
import {
  ErrorBox,
  FieldValidation,
  FormItem,
  getErrorMsg,
  hasError,
} from "@/ui/FieldValidation";
import { ErrorMessage } from "@hookform/error-message";
import { Switch } from "@headlessui/react";
import { LoaderSection } from "@/components/LoaderSection";

const Index: CustomReactFC = () => {
  const router = useRouter();
  const {
    data: recipe,
    isLoading,
    isError,
  } = trpc.recipes.getRecipeFormFields.useQuery(
    { recipeId: router.query.recipeId as string },
    { enabled: !!router.query.recipeId }
  );

  if (isLoading) {
    return <LoaderSection />;
  }

  if (!recipe) {
    return <p>Recipe not found</p>;
  }

  if (isError) {
    return <p>Something went wrong</p>;
  }

  return <RecipeForm key={recipe.updatedAt.toString()} initialData={recipe} />;
};

type RecipeFormData = NonNullable<
  RouterOutputs["recipes"]["getRecipeFormFields"]
>;

const RecipeForm = ({ initialData: data }: { initialData: RecipeFormData }) => {
  const usingUploadedImage = data.mainImage?.type === "presignedUrl";
  const [isUploadedImage, setIsUploadedImage] = useState(usingUploadedImage);
  const methods = useForm<FormAddRecipe>({
    resolver: zodResolver(addRecipeFormSchema),
    defaultValues: data.form,
  });
  const router = useRouter();
  const [defaultSrc, setDefaultSrc] = useState(
    usingUploadedImage ? data.mainImage.src : undefined
  );
  const setFileMetadata = (file: File | undefined) => {
    if (file) {
      methods.setValue(
        "image.imageMetadata",
        {
          name: file.name,
          type: file.type,
          size: file.size,
        },
        { shouldDirty: true, shouldTouch: true }
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
  const queryUtils = trpc.useContext();
  const editRecipe = trpc.recipes.editRecipe.useMutation({
    async onSuccess(presignedPost) {
      if (!presignedPost) {
        snackbarDispatch({
          type: "SUCCESS",
          message: "Successfully edited recipe",
        });
        navigateToRecipes();
        return;
      }
      if (!file) {
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
        queryUtils.recipes.getRecipe.invalidate({
          recipeId: router.query.recipeId as string,
        });
        queryUtils.recipes.getRecipes.invalidate();
        queryUtils.recipes.getRecipeFormFields.invalidate({
          recipeId: router.query.recipeId as string,
        });
        navigateToRecipes();
      } catch (e) {
        snackbarDispatch({
          type: "ERROR",
          message: "There was a problem with uploading your image",
        });
      }
    },
  });
  const addParsedRecipeMutation = trpc.recipes.addParsedRecipe.useMutation({
    onSuccess() {
      snackbarDispatch({
        type: "SUCCESS",
        message: "Successfully create recipe",
      });
      navigateToRecipes();
    },
  });
  const snackbarDispatch = useSnackbarDispatch();
  const {
    formState: { dirtyFields },
  } = methods;
  const createRecipe = methods.handleSubmit((validData) => {
    if (isUploadedImage && validData.image.imageMetadata) {
      const formattedData = {
        id: router.query.recipeId as string,
        updateImage: !!dirtyFields.image?.imageMetadata,
        fields: {
          ...validData,
          imageMetadata: validData.image.imageMetadata,
        },
      };
      editRecipe.mutate(formattedData);
    } else {
      const formattedData = {
        ...validData,
        urlSourceImage: validData.image.urlSourceImage,
        urlSource: data?.siteInfo.url,
        originalAuthor: data?.siteInfo.author,
      };
      addParsedRecipeMutation.mutate(formattedData);
    }
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
            <Button
              intent="noBoarder"
              type="button"
              onClick={navigateToRecipes}
              className="p-1"
            >
              Back
            </Button>
            <h2 className="text-2xl">Edit Recipe</h2>
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
            <IngredientsSection />
          </SectionWrapper>
          <SectionWrapper>
            <StepsSection />
          </SectionWrapper>
          <SectionWrapper>
            <TimeSection />
          </SectionWrapper>
          <SectionWrapper>
            <MealTypeSection />
          </SectionWrapper>
          <SectionWrapper>
            <NationalitySection />
          </SectionWrapper>
          <SectionWrapper>
            <CookingMethodsSection />
          </SectionWrapper>
          <Button disabled={editRecipe.isLoading}>Edit</Button>
        </form>
      </FormProvider>
    </section>
  );
};

type imgMetadata = NonNullable<
  Exclude<FormAddRecipe["image"]["imageMetadata"], string>
>;

const NameDesImgSection = ({
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
}) => {
  const id = useId();
  const {
    register,
    formState: { errors, submitCount },
    control,
  } = useFormContext<FormAddRecipe>();
  function handleImageErrors(
    uploadErrors: Merge<FieldError, FieldErrorsImpl<imgMetadata>> | undefined
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
    if (urlSourceImage.length && imageMetadata && submitCount) {
      setImageErrorMessage(
        "Either enter an image url or upload an image. Not both"
      );
    } else if (!urlSourceImage.length && !imageMetadata && submitCount) {
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
              "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
            )}
          >
            <span className="sr-only">Use setting</span>
            <span
              aria-hidden="true"
              className={classNames(
                isUploadedImage ? "translate-x-5" : "translate-x-0",
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
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
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const TimeSection = () => {
  const id = useId();
  const {
    register,
    formState: { errors },
  } = useFormContext<FormAddRecipe>();
  return (
    <div className="flex gap-4">
      <FormItem className="flex-1">
        <label htmlFor={id + "-prepTime"}>Prep Time (Minutes)</label>
        <FieldValidation error={errors.prepTime}>
          <Input
            aria-errormessage={getErrorMsg(errors.prepTime)}
            aria-invalid={hasError(errors.prepTime)}
            id={id + "-prepTime"}
            min={0}
            type="number"
            {...register("prepTime", { valueAsNumber: true })}
            className="inline-block w-full border-2 border-gray-500 p-1"
          />
        </FieldValidation>
      </FormItem>
      <FormItem className="flex-1">
        <label htmlFor={id + "-cookTime"}>Cook Time (Minutes)</label>
        <FieldValidation error={errors.cookTime}>
          <Input
            aria-errormessage={getErrorMsg(errors.cookTime)}
            aria-invalid={hasError(errors.cookTime)}
            min={0}
            id={id + "-cookTime"}
            type="number"
            {...register("cookTime", { valueAsNumber: true })}
            className="inline-block w-full border-2 border-gray-500 p-1"
          />
        </FieldValidation>
      </FormItem>
    </div>
  );
};

const IngredientsSection = () => {
  const { canDrag, toggleCanDrag, sensors } = useListDnd();
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<FormAddRecipe>();
  const { fields, append, remove, move } = useFieldArray({
    name: "ingredients",
    control,
  });
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over!.id) {
      const oldIndex = fields.map(({ id }) => id).indexOf(active.id as string);
      const newIndex = fields.map(({ id }) => id).indexOf(over.id as string);
      move(oldIndex, newIndex);
    }
  };
  return (
    <>
      <h2 className="text-xl">Add Ingredients</h2>
      <p>
        Enter ingredients below. One ingredient per line and it should include
        the measurements. Add optional headers to group ingredients.
      </p>
      <Button
        intent="noBoarder"
        className="self-start"
        type="button"
        aria-label="Toggle rearrange"
        onClick={toggleCanDrag}
      >
        <MdCompareArrows className="rotate-90" size={20} />
      </Button>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={fields} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <SortableItem key={field.id} id={field.id} canDrag={canDrag}>
              <DraggableInput
                index={index}
                type="ingredients"
                placeholder={
                  field.isHeader
                    ? "Ingredient Header placeholder"
                    : "e.g. 2 cups of sugar"
                }
                canDrag={canDrag}
                remove={remove}
                register={register}
                isHeader={field.isHeader}
              />
            </SortableItem>
          ))}
        </SortableContext>
        <ErrorMessage
          errors={errors}
          name="ingredients"
          render={() => {
            return (
              <ErrorBox>
                {
                  errors?.ingredients?.find?.(
                    (ingredient) => ingredient?.name?.message
                  )?.name?.message
                }
              </ErrorBox>
            );
          }}
        />
      </DndContext>
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() =>
            append({
              id: uuidv4(),
              name: "",
              isHeader: false,
            })
          }
        >
          Add Ingredient
        </Button>
        <Button
          type="button"
          onClick={() =>
            append({
              id: uuidv4(),
              name: "",
              isHeader: true,
            })
          }
        >
          Add Header
        </Button>
      </div>
    </>
  );
};

const SortableItem = ({
  id,
  children,
  canDrag,
}: {
  id: string;
  children: React.ReactNode;
  canDrag: boolean;
}) => {
  const {
    attributes,
    listeners,

    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: id, disabled: !canDrag });

  const context = useMemo(
    () => ({
      attributes,
      listeners,
      ref: setActivatorNodeRef,
    }),
    [attributes, listeners, setActivatorNodeRef]
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <SortableItemContext.Provider value={context}>
      <div ref={setNodeRef} style={style}>
        {children}
      </div>
    </SortableItemContext.Provider>
  );
};

const CookingMethodsSection = () => {
  const { data } = trpc.cookingMethods.getCookingMethods.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { control, getValues } = useFormContext<FormAddRecipe>();
  const { append, remove } = useFieldArray({
    name: "cookingMethods",
    control,
  });
  const fields = getValues("cookingMethods");
  return (
    <>
      <h2 className="text-xl">Add Cooking methods</h2>
      <p>Add optional cooking methods to filter meals easier in the future.</p>
      <div className="flex items-stretch gap-2">
        <Combobox
          data={data ?? []}
          handleAdd={(objToAdd: DropdownListValues) => {
            if (!fields.map(({ id }) => id).includes(objToAdd.id)) {
              append(objToAdd);
            }
          }}
          selectedData={fields}
        />
      </div>
      <ChipContainer>
        {fields.map(({ id, name }, index) => (
          <Chip key={id} id={id} data={name} deleteChip={() => remove(index)} />
        ))}
      </ChipContainer>
    </>
  );
};

const MealTypeSection = () => {
  const { data } = trpc.mealTypes.getMealTypes.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { control, getValues } = useFormContext<FormAddRecipe>();
  const { append, remove } = useFieldArray({
    name: "mealTypes",
    control,
  });
  const fields = getValues("mealTypes");
  return (
    <>
      <h2 className="text-xl">Add Meal Types</h2>
      <p>
        Add optional meal types to make filter by meals easier in the future.
      </p>
      <div className="flex items-stretch gap-2">
        <Combobox
          data={data ?? []}
          handleAdd={(objToAdd: DropdownListValues) => {
            if (!fields.map(({ id }) => id).includes(objToAdd.id)) {
              append(objToAdd);
            }
          }}
          selectedData={fields}
        />
      </div>
      <ChipContainer>
        {fields.map(({ id, name }, index) => (
          <Chip key={id} id={id} data={name} deleteChip={() => remove(index)} />
        ))}
      </ChipContainer>
    </>
  );
};

const NationalitySection = () => {
  const { data } = trpc.nationalities.getNationalities.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { control, getValues } = useFormContext<FormAddRecipe>();
  const { append, remove } = useFieldArray({
    name: "nationalities",
    control,
  });
  const fields = getValues("nationalities");
  return (
    <>
      <h2 className="text-xl">Add Nationalities</h2>
      <p>Add optional nationalities to filter by meals easier in the future.</p>
      <div className="flex items-stretch gap-2">
        <Combobox
          data={data ?? []}
          handleAdd={(objToAdd: DropdownListValues) => {
            if (!fields.map(({ id }) => id).includes(objToAdd.id)) {
              append(objToAdd);
            }
          }}
          selectedData={fields}
        />
      </div>
      <ChipContainer>
        {fields.map(({ id, name }, index) => (
          <Chip key={id} id={id} data={name} deleteChip={() => remove(index)} />
        ))}
      </ChipContainer>
    </>
  );
};

const ChipContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-wrap gap-2">{children}</div>;
};

const SectionWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col gap-4">{children}</div>;
};

const StepsSection = () => {
  const { canDrag, toggleCanDrag, sensors } = useListDnd();
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<FormAddRecipe>();
  const { fields, append, remove, move } = useFieldArray({
    name: "steps",
    control,
  });
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over!.id) {
      const oldIndex = fields.map(({ id }) => id).indexOf(active.id as string);
      const newIndex = fields.map(({ id }) => id).indexOf(over.id as string);
      move(oldIndex, newIndex);
    }
  };
  return (
    <>
      <h2 className="text-xl">Add Steps</h2>
      <p>
        Enter Steps below. One Step per line. Add optional headers to group
        steps.
      </p>
      <Button
        intent="noBoarder"
        className="self-start"
        type="button"
        aria-label="Toggle rearrange"
        onClick={toggleCanDrag}
      >
        <MdCompareArrows className="rotate-90" size={20} />
      </Button>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={fields} strategy={verticalListSortingStrategy}>
          {fields.map(({ id, isHeader }, index) => {
            return (
              <SortableItem key={id} id={id} canDrag={canDrag}>
                <DraggableInput
                  index={index}
                  type="steps"
                  placeholder={
                    isHeader ? "Steps Header placeholder" : "e.g. Soup"
                  }
                  canDrag={canDrag}
                  isHeader={isHeader}
                  remove={remove}
                  register={register}
                />
              </SortableItem>
            );
          })}
        </SortableContext>
      </DndContext>
      <ErrorMessage
        errors={errors}
        name="steps"
        render={() => {
          return (
            <ErrorBox>
              {
                errors?.steps?.find?.((step) => step?.name?.message)?.name
                  ?.message
              }
            </ErrorBox>
          );
        }}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() =>
            append({
              id: uuidv4(),
              name: "",
              isHeader: false,
            })
          }
        >
          Add Step
        </Button>
        <Button
          type="button"
          onClick={() =>
            append({
              id: uuidv4(),
              name: "",
              isHeader: true,
            })
          }
        >
          Add Header
        </Button>
      </div>
    </>
  );
};

const DraggableInput = ({
  isHeader,
  canDrag,
  placeholder,
  type,
  index,
  register,
  remove,
}: {
  isHeader: boolean;
  canDrag: boolean;
  placeholder: string;
  type: ListInputFields;
  index: number;
  register: UseFormRegister<FormAddRecipe>;
  remove: UseFieldArrayRemove;
}) => {
  const { attributes, listeners, ref } = useSortableItemContext();
  const {
    formState: { errors },
  } = useFormContext<FormAddRecipe>();
  return (
    <div className="flex h-10 items-stretch">
      {canDrag && (
        <button
          type="button"
          className="mr-2 touch-manipulation"
          {...attributes}
          {...listeners}
          ref={ref}
        >
          <GrDrag size={25} className="cursor-grab" />
        </button>
      )}
      <FieldValidation highlightOnly error={errors?.[type]?.[index]?.name}>
        <Input
          aria-invalid={hasError(errors?.[type]?.[index]?.name)}
          aria-errormessage={getErrorMsg(errors?.[type]?.[index]?.name)}
          placeholder={placeholder}
          disabled={canDrag}
          {...register(`${type}.${index}.name`)}
          className={`${
            isHeader ? "font-extrabold" : ""
          } flex-1 border-2 border-gray-500 p-1 tracking-wide`}
        />
      </FieldValidation>
      {!canDrag && (
        <Button intent="noBoarder" type="button" onClick={() => remove(index)}>
          <BiMinus size={25} />
        </Button>
      )}
    </div>
  );
};

Index.auth = true;
Index.hideNav = true;

export default Index;
