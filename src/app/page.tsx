import { getServerAuthSession } from "~/server/auth";
import { SignOutButton } from "./_lib/auth/SignOut";
import { SignInButton } from "./_lib/auth/SignIn";

export default async function Home() {
  const session = await getServerAuthSession();
  if (session) {
    return (
      <>
        Signed in as {session.user?.email} <br />
        <SignOutButton />
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <SignInButton />
    </>
  );
}
