import { ChangeEvent, useState } from "react";
import { useMutation } from "react-query";

const Create = () => {
  const [files, setFiles] = useState<File[]>([]);
  const uploadFilesMutation = useMutation(
    () => {
      const formData = new FormData();
      files.forEach((file, i) => {
        console.log(file.name);
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
    <div>
      <input type="file" onChange={handleFilesSelect} multiple />
      <button onClick={() => uploadFilesMutation.mutate()}>upload</button>
    </div>
  );
};

export default Create;
