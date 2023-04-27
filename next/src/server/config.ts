export const config = {
  seed: {
    withTestRecipesAndUser: false,
  },
  s3: {
    presignedUrlDuration: 60 * 60 * 24 * 7, // 7 days,
    presignedUploadExpiry: 60 * 5, // 5 min
    minFileSize: 1, // bytes
    maxFileSize: 10485760,
  },
};
