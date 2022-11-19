import React, { useState, useEffect } from "react";

export function useImageUpload() {
  const [file, setFile] = useState<File>();
  const formData = new FormData();

  // For displaying imgs
  const [imgObjUrl, setImgObjUrl] = useState<string>();
  useEffect(() => {
    let objUrl: string;
    if (file) {
      objUrl = URL.createObjectURL(file);
      setImgObjUrl(objUrl);
    }
    return () => {
      if (file) {
        URL.revokeObjectURL(objUrl);
      }
    };
  }, [file]);

  if (file) {
    formData.append(`file`, file, file.name);
  }
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList[0]) {
      setFile(fileList[0]);
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
      }
    }
  };
  return {
    file,
    handleFileSelect,
    handleFileDrop,
    formDataValue: formData.get("file"),
    imgObjUrl,
  };
}
