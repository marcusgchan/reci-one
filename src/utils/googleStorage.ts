import { Storage, Bucket } from "@google-cloud/storage";
import { NextApiRequest } from "next";
import { env } from "../server/env.mjs";
const Multer = require("multer");

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // no larger than 10mb
  },
});

// Instantiates a client. Explicitly use service account credentials by
// specifying the private key file. All clients in google-cloud-node have this
// helper, see https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
const projectId = "curious-context-360023";
const keyFilename = env.PATH_TO_KEYFILE;

const storage = new Storage({ projectId, keyFilename });
const bucket = storage.bucket(env.BUCKET_NAME);

type StorageBucket = Bucket;

const googleStorage = {
  async getImageLink(path: string) {
    const url = `https://storage.googleapis.com/storage/${env.BUCKET_NAME}/${path}`;
    return url;
  },
  async uploadImage(req: any, id: string | undefined, recipeName: string) {
    multer.array("files", 5)(req, {}, async () => {
      console.log(req.files);
      const files = <any[]>req.files;
      Promise.all(uploadFiles(files, id, recipeName, bucket))
        .then((urls) => {})
        .catch();
    });
    return "";
  },
};

function uploadFiles(
  files: any,
  id: string | undefined,
  recipeName: string,
  bucket: StorageBucket
): string[] {
  return files.map(({ originalname, buffer }: any) => {
    new Promise<string>(async (resolve, reject) => {
      const blob = bucket.file(originalname);
      const file = bucket.file(
        `https://storage.googleapis.com/${bucket.name}/${id}/${recipeName}/${blob.name}`
      );
      try {
        const fileExist = await file.exists();
        if (fileExist) {
          reject("File already exist");
          return;
        }
        const blobStream = blob.createWriteStream();
        blobStream.on("error", (err) =>
          reject("Something went wrong with the file upload")
        );
        blobStream.on("finish", () => {
          resolve(
            `https://storage.googleapis.com/${bucket.name}/${id}/${recipeName}/${blob.name}`
          );
        });
        blobStream.end(buffer);
      } catch (e) {
        console.error(e);
        reject("Something went wrong with the file upload");
      }
    });
  });
}

export default googleStorage;
