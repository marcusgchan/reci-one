import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { FaBars } from "react-icons/fa";

export function DesktopNav() {
  return (
    <nav className="flex justify-between px-3 text-2xl border-primary border-4 w-full p-2">
      <div>
        <a>
          <h2>Cookbook</h2>
        </a>
      </div>
      <div className="flex gap-6 min-w-0 text-accent-500">
        <a>HOME</a>
        <a>FAVOURITES</a>
        <a>MY RECIPES</a>
        <a>NOTES</a>
        {/* <LoggedIn /> */}
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
        <FaBars size="20" />
      </button>
      <nav
        className={`${
          isOpen ? "translate-x-0" : "translate-x-full"
        } z-40 transition-transform fixed flex flex-col gap-5 justify-center items-center text-2xl inset-0 h-full w-full min-width-0 bg-secondary`}
      >
        <button
          onClick={toggleMenu}
          className="absolute top-3 right-3 text-accent"
        >
          X
        </button>
        {/* <LoggedIn /> */}
        <a>HOME</a>
        <a>FAVOURITES</a>
        <a>MY RECIPES</a>
        <a>NOTES</a>
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
