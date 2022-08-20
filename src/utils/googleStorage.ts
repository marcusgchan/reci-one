import { Storage } from "@google-cloud/storage";
import { env } from "../server/env.mjs";

// Instantiates a client. Explicitly use service account credentials by
// specifying the private key file. All clients in google-cloud-node have this
// helper, see https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
const projectId = "curious-context-360023";
const keyFilename = env.PATH_TO_KEYFILE;
const storage = new Storage({ projectId, keyFilename });

// Makes an authenticated API request.
async function listBuckets() {
  try {
    const [buckets] = await storage.getBuckets();

    console.log("Buckets:");
    buckets.forEach((bucket) => {
      console.log(bucket.name);
    });
  } catch (err) {
    console.error("ERROR:", err);
  }
}

export { listBuckets };
