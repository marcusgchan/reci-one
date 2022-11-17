import { useState } from "react";

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
