"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export function RecipeCard({
  id,
  name,
  src,
}: {
  id: string;
  name: string;
  src: string;
}) {
  const router = useRouter();
  return (
    <button
      className="mx-auto flex aspect-[1/1.3] h-full w-full animate-fade-in-down flex-col items-stretch gap-4"
      onClick={() => router.push(`/recipes/${id}`)}
    >
      <div className="relative flex w-full basis-3/5">
        <Image
          className="object-cover"
          fill={true}
          unoptimized
          loading="lazy"
          alt={name}
          src={src}
        />
      </div>
      <div className="flex flex-1 items-center justify-center bg-accent-400">
        <h2 className="font-medium tracking-wide text-secondary">{name}</h2>
      </div>
    </button>
  );
}
