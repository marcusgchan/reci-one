import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { s3Client } from "@/utils/s3Client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "src/server/env.mjs";
import { config } from "src/server/config";
import { TRPCError } from "@trpc/server";
import { addRecipeWithMainImage } from "@/schemas/recipe";

export const getUploadSignedUrl = async (
  userId: string,
  recipeId: string,
  imageMetadata: addRecipeWithMainImage["imageMetadata"],
  roundedDate: string
) => {
  try {
    const { name, size, type } = imageMetadata;
    const presignedPost = await createPresignedPost(s3Client, {
      Bucket: env.BUCKET_NAME,
      Key: `${userId}/${recipeId}/${name}-${roundedDate}`,
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
    // Hacky workaround to get post presigned urls to work with minIO b/c
    // the url goes to http://localhost:9000 without appending the bucket name after
    // for some reason
    if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
      return {
        url: `${presignedPost.url}${env.BUCKET_NAME}`,
        fields: presignedPost.fields,
      };
    }
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
  roundedDate: string
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
