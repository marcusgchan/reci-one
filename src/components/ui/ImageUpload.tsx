import Image from "next/image";
import { CgCloseO } from "react-icons/cg";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { FormItem } from "./FieldValidation";

export function ImageUpload({
  handleFilesSelect,
  handleFileDrop,
  imgObjUrl,
  handleFileLoad,
  removeFile,
}: {
  handleFilesSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileDrop: (e: React.DragEvent) => void;
  imgObjUrl: string | undefined;
  handleFileLoad: (src: string) => void;
  removeFile: (src: string) => void;
}) {
  return (
    <FormItem className="flex h-full flex-col">
      <label htmlFor="cover-photo">Upload Recipe Image</label>
      {!imgObjUrl ? (
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
          <button
            onClick={() => removeFile(imgObjUrl)}
            className="absolute right-0 top-0 z-10 translate-x-1/2 -translate-y-1/2 rounded-full bg-white text-gray-400 outline-offset-2 transition-transform hover:scale-110 focus:scale-110"
          >
            <CgCloseO size={25} />
          </button>
          <Image
            src={imgObjUrl}
            className="object-fill"
            onLoad={() => handleFileLoad(imgObjUrl)}
            fill={true}
            alt="uploaded image"
          />
        </div>
      )}
    </FormItem>
  );
}

// SetFileMetadata is used to sync file metadeta stored in form state with file
export function useImageUpload(
  setFileMetadata: (file: File | undefined) => void
) {
  const [file, setFile] = useState<File>();
  const formData = new FormData();
  const router = useRouter();
  let imgObjUrlRef = useRef<string>();

  if (file) {
    formData.append(`file`, file, file.name);
  }
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList[0]) {
      setFile(fileList[0]);
      setFileMetadata(fileList[0]);
      imgObjUrlRef.current = URL.createObjectURL(fileList[0]);
    }
  };
  const handleFileDrop = (e: React.DragEvent) => {
    // Prevent file from opening
    e.preventDefault();

    const items = e.dataTransfer.items;
    if (items) {
      // Get first file that was uploaded
      const file = items[0]?.getAsFile();
      if (file) {
        setFile(file);
        setFileMetadata(file);
        imgObjUrlRef.current = URL.createObjectURL(file);
      }
    }
  };
  const handleFileLoad = (src: string) => {
    URL.revokeObjectURL(src);
  };
  const removeFile = (src: string) => {
    imgObjUrlRef.current = undefined;
    URL.revokeObjectURL(src);
    setFile(undefined);
    setFileMetadata(undefined);
  };
  // Hacky way to ensure no memory leaks when navigating away while img has not uploaded
  // Since when uploaded it will revoke the url object however since it hasn't uploaded it may cause
  // a memory leak
  useEffect(() => {
    const handleRouteChange = () => {
      URL.revokeObjectURL(imgObjUrlRef.current ?? "");
    };
    router.events.on("beforeHistoryChange", handleRouteChange);
    return () => router.events.off("beforeHistoryChange", handleRouteChange);
  }, [router]);

  return {
    file,
    handleFileSelect,
    handleFileDrop,
    formData,
    handleFileLoad,
    removeFile,
    imgObjUrlRef,
  };
}

// THIS IS NOT REFATORED AND WILL NOT WORK
export function useImagesUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const formData = new FormData();
  files.forEach((file) => {
    formData.append(`files`, file, file.name);
  });
  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      setFiles([...files, ...Array.from(fileList)]);
    }
  };
  const handleFileDrop = (e: React.DragEvent) => {
    // Prevent file from opening
    e.preventDefault();

    const items = e.dataTransfer.items;
    const filesFromDrop = [] as File[];
    if (items) {
      [...items].forEach((item) => {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            filesFromDrop.push(file);
          }
        }
      });
      setFiles(filesFromDrop);
    }
  };
  return { files, handleFilesSelect, handleFileDrop, formData };
}
