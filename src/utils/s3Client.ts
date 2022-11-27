// Create service client module using ES6 syntax.
import { S3Client } from "@aws-sdk/client-s3";
import { env } from "src/server/env.mjs";
// Set the AWS Region.
const REGION = "us-west-1";
// Create an Amazon S3 service client object.
const s3Client = new S3Client({
  endpoint: env.BUCKET_DOMAIN,
  region: REGION,
  forcePathStyle: env.NODE_ENV === "development" || "test" ? true : false,
  credentials: {
    accessKeyId: env.ACCESS_KEY_ID,
    secretAccessKey: env.SECRET_ACCESS_KEY,
  },
});
export { s3Client };
