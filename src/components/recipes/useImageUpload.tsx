import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

export function useImageUpload() {
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
  });

  return {
    file,
    handleFileSelect,
    handleFileDrop,
    formDataValue: formData.get("file"),
    handleFileLoad,
    removeFile,
    imgObjUrlRef,
  };
}
