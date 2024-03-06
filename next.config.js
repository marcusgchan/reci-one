import { env } from "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", env.BUCKET_DOMAIN],
  },
};

export default config;

