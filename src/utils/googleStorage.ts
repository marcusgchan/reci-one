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
  async uploadImage(
    req: any,
    id: string | undefined,
    recipeName: string,
    recipeId: string
  ) {
    const uploadPromise = new Promise<string[]>((resolve, reject) => {
      multer.array("files", 4)(req, {}, async () => {
        const files = <any[]>req.files;
        return await Promise.all(uploadFiles(files, id, recipeName, bucket))
          .then(async (urls) => {
            // store in db
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
          .catch((e: string) => reject(e));
      });
    });
    return await uploadPromise;
  },
};

type StorageBucket = Bucket;

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
