import Image from "next/image";
import { CgCloseO } from "react-icons/cg";
import React, { useState } from "react";
import { FormItem } from "./FieldValidation";
import { LoaderSection } from "../LoaderSection";

export function ImageUpload({
  uploadedImageResult,
  handleFilesSelect,
  handleFileDrop,
  removeFile,
  defaultSrc,
}: {
  uploadedImageResult: UploadedImageResult;
  handleFilesSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileDrop: (e: React.DragEvent) => void;
  removeFile: () => void;
  defaultSrc?: string;
}) {
  const { src, isLoading } = uploadedImageResult;
  return (
    <FormItem className="flex h-full flex-col">
      <label htmlFor="cover-photo">Upload Recipe Image</label>
      {!src && !defaultSrc ? (
        <div
          className="cursor-drop flex h-full items-center justify-center rounded-md border-2 border-dashed border-gray-400 px-6 py-8 group-[.error]:border-red-500"
          onDrop={handleFileDrop}
          onDragOver={(e) => e.preventDefault()}
        >
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
            <div className="flex items-center text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="border-gray relative cursor-pointer rounded-md border-2 bg-white px-1 py-[0.2rem] font-medium text-gray-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept="image/*"
                  multiple={false}
                  onChange={handleFilesSelect}
                  className="sr-only"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      ) : (
        <div className="relative h-full">
          {isLoading ? (
            <LoaderSection />
          ) : (
            <>
              <button
                type="button"
                onClick={removeFile}
                className="absolute right-0 top-0 z-10 -translate-y-1/2 translate-x-1/2 rounded-full bg-white text-gray-400 outline-offset-2 transition-transform hover:scale-110 focus:scale-110"
              >
                <CgCloseO size={25} />
              </button>
              <Image
                unoptimized
                src={(src || defaultSrc) as string}
                className="object-cover"
                fill={true}
                alt="uploaded image"
              />
            </>
          )}
        </div>
      )}
    </FormItem>
  );
}

export type UploadedImageResultEmpty = {
  src: null;
  isLoading: false;
  error: null;
};

export type UploadedImageResultSuccess = {
  src: string;
  isLoading: false;
  error: null;
};

export type UploadedImageResultLoading = {
  src: null;
  isLoading: true;
  error: null;
};

export type UploadedImageResultError = {
  src: null;
  isLoading: false;
  error: string;
};

export type UploadedImageResult =
  | UploadedImageResultEmpty
  | UploadedImageResultSuccess
  | UploadedImageResultLoading
  | UploadedImageResultError;

// SetFileMetadata is used to sync file metadeta stored in form state with file
export function useImageUpload(
  setFileMetadata: (file: File | undefined) => void
) {
  const [file, setFile] = useState<File>();
  // For image preview
  const [uploadedImageResult, setUploadedImageResult] =
    useState<UploadedImageResult>({ src: null, isLoading: false, error: null });
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList[0] && fileList[0].type.includes("image/")) {
      setFile(fileList[0]);
      setFileMetadata(fileList[0]);
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const src = e.target?.result;
        if (!src) {
          setUploadedImageResult({
            src: null,
            error: "Error uploading image",
            isLoading: false,
          });
          return;
        }
        setUploadedImageResult({
          src: src as string,
          isLoading: false,
          error: null,
        });
      };
      fileReader.readAsDataURL(fileList[0]);
      setUploadedImageResult({ isLoading: true, src: null, error: null });
    }
  };
  const handleFileDrop = (e: React.DragEvent) => {
    // Prevent file from opening
    e.preventDefault();
    const items = e.dataTransfer.items;
    if (items) {
      // Get first file that was uploaded
      const file = items[0]?.getAsFile();
      if (file && file.type.includes("image/")) {
        setFile(file);
        setFileMetadata(file);
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          const src = e.target?.result;
          if (!src) {
            setUploadedImageResult({
              src: null,
              error: "Error uploading image",
              isLoading: false,
            });
            return;
          }
          setUploadedImageResult({
            src: src as string,
            isLoading: false,
            error: null,
          });
        };
        fileReader.readAsDataURL(file);
        setUploadedImageResult({ isLoading: true, src: null, error: null });
      }
    }
  };
  const removeFile = () => {
    setFile(undefined);
    setUploadedImageResult({ src: null, isLoading: false, error: null });
    setFileMetadata(undefined);
  };
  return {
    file,
    handleFileSelect,
    uploadedImageResult,
    handleFileDrop,
    removeFile,
  };
}
