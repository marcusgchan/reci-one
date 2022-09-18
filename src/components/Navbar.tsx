import { useSession } from "next-auth/react";
import React, { useState } from "react";

export function DesktopNav() {
  return (
    <nav className="flex bg-slate-500 justify-between px-3 text-2xl min-w-0">
      <div>
        <a>
          <h2>Cookbook</h2>
        </a>
      </div>
      <div className="flex gap-6 min-w-0">
        <a>abcd</a>
        <a>abcd</a>
        <a>abcd</a>
        <a>abcd</a>
        <LoggedIn />
      </div>
    </nav>
  );
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen((io) => !io);
  return (
    <>
      <button onClick={toggleMenu} className="fixed top-3 right-3">
        Burger
      </button>
      <nav
        className={`${
          isOpen ? "translate-x-0" : ""
        } transition-transform translate-x-full fixed flex flex-col gap-5 justify-center items-center text-2xl inset-0 h-full w-full min-width-0 bg-gray-600 text-slate-50`}
      >
        <button
          onClick={toggleMenu}
          className="absolute top-3 right-3 text-accent"
        >
          X
        </button>
        <LoggedIn />
        <a>abcd</a>
        <a>abcd</a>
        <a>abcd</a>
        <a>abcd</a>
      </nav>
    </>
  );
}

function LoggedIn(
  props: React.HTMLAttributes<HTMLParagraphElement | HTMLAnchorElement>
) {
  const { status, data } = useSession();
  const isLoggedIn = status === "authenticated";
  // if (isLoggedIn) {
  //   return <p {...props}>Logged in as {data?.user?.name}</p>;
  // }

  // return <a {...props}>Login</a>;
  return (
    <p className="flex gap-2 items-center ml-auto min-w-0 whitespace-nowrap overflow-hidden">
      Logged in as
      <span
        style={{ maxWidth: "5rem" }}
        className="inline-block w-full min-w-0 text-ellipsis whitespace-nowrap overflow-hidden"
      >
        very long name for testing purposes
      </span>
    </p>
  );
}
