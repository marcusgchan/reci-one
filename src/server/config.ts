export const config = {
  seed: {
    withTestRecipesAndUser: false,
  },
  s3: {
    presignedUrlDuration: 60 * 60 * 24, // 24h
  },
};
