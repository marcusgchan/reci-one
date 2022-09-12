import { ChangeEvent, useState } from "react";
import { useMutation } from "react-query";

export function RecipeUpload({ multiple = false }: { multiple?: boolean }) {
  const [files, setFiles] = useState<File[]>([]);
  const uploadFilesMutation = useMutation(
    () => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append(`files`, file, file.name);
      });
      return fetch(`/api/upload/recipe-images?file=abc.jpeg`, {
        method: "Post",
        body: formData,
      });
    },
    {
      onSuccess(data) {
        console.log(data);
      },
    }
  );
  const handleFilesSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      setFiles([...files, ...Array.from(fileList)]);
    }
  };
  return (
    <form>
      <input type="file" onChange={handleFilesSelect} multiple={multiple} />
      <button
        disabled={files.length === 0}
        onClick={(e) => {
          e.preventDefault();
          uploadFilesMutation.mutate();
        }}
      >
        upload
      </button>
    </form>
  );
}
