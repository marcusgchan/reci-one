import "server-only";

import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

export async function Auth({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
