import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { s3Client } from "@/utils/s3Client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "src/server/env.mjs";
import { config } from "src/server/config";
import { TRPCError } from "@trpc/server";

export const getUploadSignedUrl = async (
  userId: string,
  recipeId: string,
  imageName: string
) => {
  const bucketParams = {
    Bucket: `${env.BUCKET_NAME}`,
    Key: `${userId}/${recipeId}/${imageName}`,
  };
  try {
    const command = new PutObjectCommand(bucketParams);
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: config.s3.presignedUrlDuration,
      signingDate: new Date(),
    });
    return signedUrl;
  } catch (err) {
    console.log("Error creating presigned URL", err);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }
};

export const getImageSignedUrl = async (
  userId: string,
  recipeId: string,
  imageName: string
) => {
  const command = new GetObjectCommand({
    Bucket: `${env.BUCKET_NAME}`,
    Key: `${userId}/${recipeId}/${imageName}`,
  });
  // const date = new Date();
  // date.setHours(9);
  // date.setMinutes(0);
  // date.setSeconds(0);
  // date.setMilliseconds(0);
  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: config.s3.presignedUrlDuration,
    // signingDate: date,
  });
  return signedUrl;
};

export const remove = async (
  userId: string,
  recipeId: string,
  fileName: string
) => {
  const bucketParams = {
    Bucket: `${env.BUCKET_NAME}`,
    Key: `${userId}/${recipeId}/${fileName}`,
  };
  try {
    // Delete the object.
    console.log(`\nDeleting object "${bucketParams.Key}"} from bucket`);
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketParams.Bucket,
        Key: bucketParams.Key,
      })
    );
  } catch (err) {
    console.log("Error deleting object", err);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }
};
