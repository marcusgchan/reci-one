export const config = {
  seed: {
    withTestRecipesAndUser: true,
  },
  s3: {
    presignedUrlDuration: 60 * 60 * 24, // 24h
  },
};
