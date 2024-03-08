# Reci One

- A recipe cookbook web app for add, viewing, deleting recipes
- Store recipes from other recipe websites by URL

## Tech Stack

- This is an app bootstrapped according to [Create T3 App](https://create.t3.gg/), also known as the T3-Stack
- T3-Stack: NextJs, Next Auth, tRPC, Prisma, TailwindCSS
- Images are stored in S3 in production and in a minIO container during local development
- Using PlanetScale for production and MySQL docker image for local development
- Docker is used for the dev environment
- Hosted on Vercel in production

## How to run

- Install docker and run the daemon
- Create a .env file in the root directory
- Generate the NEXTAUTH_SECRET and parser secret by running `openssl rand -base64 32`
- Create a Github client id and secret pair
- The home page url is `http://localhost:3000` and callback url is `http://localhost:3000/auth/callback/github`

Create an env file in the root directory:

```
# Prisma
# Local dev database
MY_SQL_ROOT_PASSWORD=secret
MY_SQL_DATABASE=reci-one-db
DATABASE_URL=mysql://root:secret@db:3306/reci-one-db

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

# secret key for parsing server
PARSER_SECRET=<parser-secret>
PARSER_URL=http://parser:8000
```

Create a .env file in `/parser`. This parser secret must match the parser secret in the other .env file

```
PARSER_SECRET=<parser-secret>
```

- Run `docker compose up` to start the docker containers
- Go into the Nextjs docker container by running `docker exec -it reci-one-next-1 bash` and run `npx prisma migrate dev` and `npx prisma db seed`

Now we need to get the local types setup since we just installed everything in the containers

Run:

- `npm i` in the root directory
- `poetry install --no-root` in `/parser` (Ensure you have poetry installed in your machine before running this command)
