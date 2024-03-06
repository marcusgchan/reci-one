"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "~/components/ui/Input";

export function Stage2Form() {
  const [url, setUrl] = useState("");
  return (
    <>
      <Input value={url} onChange={(e) => setUrl(e.target.value)} />
      <div className="flex justify-end gap-2">
        <Link href={{ href: "/recipes/create", query: { formStage: "1" } }}>
          Back
        </Link>
        <Link
          href={{ href: "/recipes/create", query: { formStage: "3", url } }}
        >
          Parse
        </Link>
      </div>
    </>
  );
}
