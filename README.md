# Reci One
- A recipe cookbook web app for add, viewing, deleting recipes
- Store recipes from other recipe websites by URL
- Currently, most features are still in development

## Tech Stack
- This is an app bootstrapped according to the [init.tips](https://init.tips) stack, also known as the T3-Stack
- T3-Stack: React, React Query, tRPC, TypeScript, Zod, Prisma, NextAuth, NextJS, MySQL
- Images are stored in S3 in production and in a minIO container during local development
- Using PlanetScale for production and MySQL docker image for local development
- Docker is used for the dev environment
- Hosted on Vercel in production

## How to run
- Install docker and run the daemon
- Create a .env file in the root directory
- Generate the NEXTAUTH_SECRET by running ```openssl rand -base64 32```
- Create a Github client id and secret pair

```
# Prisma
# Local dev database
MY_SQL_ROOT_PASSWORD=secret
DATABASE_URL=mysql://root:secret@localhost:3306/recipe-db

# Next Auth
NEXTAUTH_SECRET=<NextAuth Secret>
NEXTAUTH_URL=http://localhost:3000/

# Next Auth Discord Provider
GITHUB_CLIENT_ID=<Github OAuth ID>
GITHUB_CLIENT_SECRET=<Github OAuth Secret>

# minio
ACCESS_KEY_ID=abcde
SECRET_ACCESS_KEY=12345678
BUCKET_NAME=minio-reci-one
BUCKET_DOMAIN=http://localhost:9000

```

- Run ```npm run dev``` to start the NextJS server
- Run ```docker compose up``` to start the docker containers
