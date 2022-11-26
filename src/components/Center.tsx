import { Loader } from "@/shared/components/Loader";
import React from "react";

export function LoaderSection({ centerFixed }: { centerFixed?: boolean }) {
  return (
    <section
      aria-labelledby="loader container"
      className={
        !centerFixed
          ? "flex h-full items-center justify-center"
          : "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      }
    >
      <Loader />
    </section>
  );
}
