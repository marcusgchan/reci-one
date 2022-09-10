import type { NextApiRequest, NextApiResponse } from "next";
import googleStorage from "../../../utils/googleStorage";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, nextAuthOptions);
  if (!session) return res.status(401).end();

  if (req.method === "POST") {
    const recipeName = req.query.recipeName;
    const recipeId = req.query.recipeId;
    if (typeof recipeName === "string" && typeof recipeId === "string") {
      try {
        const urls = await googleStorage.uploadImage(
          req,
          session.user?.id,
          recipeName,
          recipeId
        );
        res.status(200).json(urls);
      } catch (e) {
        console.error(e);
        res.status(500).end();
      }
    }
    res.status(400).end();
  } else {
    res.status(405).end();
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
