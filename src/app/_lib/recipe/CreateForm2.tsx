"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";

export function Stage2Form() {
  const [url, setUrl] = useState("");
  const router = useRouter();
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push(`/recipes/create?formStage=3&url=${url}`);
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        className="w-full"
      />
      <div className="flex justify-end gap-2">
        <Link
          className="border-2 border-primary p-1"
          href={{ href: "/recipes/create", query: { formStage: "1" } }}
        >
          Back
        </Link>
        <Button className="border-2 border-primary p-1">Parse</Button>
      </div>
    </form>
  );
}
