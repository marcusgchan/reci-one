import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { s3Client } from "@/utils/s3Client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "~/env";
import { config } from "src/server/config";
import { TRPCError } from "@trpc/server";
import { type AddRecipe } from "@/schemas/recipe";

export const getUploadSignedUrl = async (
  userId: string,
  recipeId: string,
  imageMetadata: AddRecipe["imageMetadata"],
  uuid: string,
) => {
  try {
    const { name, size, type } = imageMetadata;
    const presignedPost = await createPresignedPost(s3Client, {
      Bucket: env.BUCKET_NAME,
      Key: `${userId}/${recipeId}/${name}-${uuid}`,
      Expires: config.s3.presignedUrlDuration,
      Fields: {
        acl: "private",
        "Content-Type": type,
        "Content-Length": size.toString(),
      },
      Conditions: [
        { bucket: env.BUCKET_NAME },
        ["starts-with", "$key", `${userId}/${recipeId}/`],
        ["starts-with", "$Content-Type", "image/"],
        ["content-length-range", config.s3.minFileSize, config.s3.maxFileSize],
      ],
    });
    return {
      url: `${presignedPost.url}`,
      fields: presignedPost.fields,
    };
  } catch (err) {
    console.log("Error creating presigned URL", err);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }
};

export const getImageSignedUrl = async (
  userId: string,
  recipeId: string,
  imageName: string,
  roundedDate: string,
) => {
  const command = new GetObjectCommand({
    Bucket: `${env.BUCKET_NAME}`,
    Key: `${userId}/${recipeId}/${imageName}`,
  });
  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: config.s3.presignedUrlDuration,
    signingDate: roundedDate,
  });
  return signedUrl;
};

export const remove = async (
  userId: string,
  recipeId: string,
  fileName: string,
) => {
  const bucketParams = {
    Bucket: `${env.BUCKET_NAME}`,
    Key: `${userId}/${recipeId}/${fileName}`,
  };
  if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
    const minioPort = env.BUCKET_DOMAIN.split(":")[2];
    if (!minioPort) {
      throw new Error("Minio port not found");
    }
    const prevEndpoint = s3Client.config.endpoint;
    s3Client.config.endpoint = `http://minio:${minioPort}` as never;
    try {
      // Delete the object.
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketParams.Bucket,
          Key: bucketParams.Key,
        }),
      );
      console.log("Deleted object dev");
    } catch (err) {
      console.log("Error deleting object dev", err);
    } finally {
      s3Client.config.endpoint = prevEndpoint;
    }
  } else {
    try {
      // Delete the object.
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketParams.Bucket,
          Key: bucketParams.Key,
        }),
      );
    } catch (err) {
      console.log("Error deleting object prod", err);
    }
  }
};
