import { useState } from "react";

export function useImageUpload(multiple = false) {
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
  return { files, handleFilesSelect, formData };
}
