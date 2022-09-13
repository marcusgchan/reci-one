import { Storage, Bucket } from "@google-cloud/storage";
import { env } from "../server/env.mjs";
import { prisma } from "../server/db/client";
const Multer = require("multer");

// Note might not scale well
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

const googleStorage = {
  async uploadImage(req: any, id: string | undefined, recipeId: string) {
    const uploadPromise = new Promise<string[]>((resolve, reject) => {
      multer.array("files", 4)(req, {}, async () => {
        const files = <any[]>req.files;
        if (files.length === 0) {
          reject("No files provided");
          return;
        }
        return await Promise.all(uploadFiles(files, id, recipeId, bucket))
          .then(async (urls) => {
            await prisma.user.update({
              where: {
                id: id,
              },
              data: {
                recipes: {
                  update: {
                    where: {
                      id: recipeId,
                    },
                    data: {
                      images: {
                        createMany: {
                          data: urls.map((url) => ({ link: url })),
                        },
                      },
                    },
                  },
                },
              },
            });
            resolve(urls);
          })
          .catch(async (e: string) => {
            // Delete all files in the folder recipeName since upload failed
            try {
              const filesToDelete = (
                await bucket.getFiles({ prefix: `${id}/${recipeId}/` })
              )[0];
              filesToDelete.forEach(async (file) => await file.delete());
            } catch (e) {
              console.error(
                "Unable to delete files on GCS. Note: The files that aren't deleted will lead to a storage leak"
              );
            }
            reject(e);
          });
      });
    });
    return await uploadPromise;
  },
};

type StorageBucket = Bucket;

function uploadFiles(
  files: any,
  id: string | undefined,
  recipeId: string,
  bucket: StorageBucket
): string[] {
  return files.map(({ originalname, buffer }: any) => {
    return new Promise<string>(async (resolve, reject) => {
      const file = bucket.file(`${id}/${recipeId}/${originalname}`);
      try {
        const fileExist = (await file.exists())[0];
        if (fileExist) {
          reject("File already exist");
          return;
        }
        const blobStream = file.createWriteStream();
        blobStream.on("error", (err) =>
          reject("Something went wrong with the file upload")
        );
        blobStream.on("finish", () => {
          resolve(`https://storage.googleapis.com/${bucket.name}/${file.name}`);
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
