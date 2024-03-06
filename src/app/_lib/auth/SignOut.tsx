"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return <button onClick={() => signOut()}>Logout</button>;
}
