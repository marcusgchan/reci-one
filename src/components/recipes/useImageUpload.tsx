import { useState } from "react";

export function useImageUpload() {
  const [file, setFile] = useState<File>();
  const formData = new FormData();
  if (file) {
    formData.append(`file`, file, file.name);
  }
  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList[0]) {
      setFile(fileList[0]);
    }
  };
  return { file, handleFilesSelect, formData };
}
