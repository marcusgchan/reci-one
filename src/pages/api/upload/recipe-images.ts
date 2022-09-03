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
    if (typeof recipeName === "string") {
      const url = googleStorage.uploadImage(req, session.user?.id, recipeName);
      res.status(200).send({ message: "success" });
    }
    res.status(400).end();
  } else {
    // Handle any other HTTP method
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
