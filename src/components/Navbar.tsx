import { useSession } from "next-auth/react";
import React, { useLayoutEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import { CgClose } from "react-icons/cg";
import { useRouter } from "next/router";

export function NavBar() {
  return (
    <>
      <MobileNav />
      <DesktopNav />
    </>
  );
}

function DesktopNav() {
  const router = useRouter();
  const navigate = (path: string) => {
    if (router.pathname !== path) {
      router.push(path);
    }
  };
  return (
    <nav className="hidden w-full max-w-7xl justify-between border-4 border-gray-500 p-2 px-3 text-2xl text-gray-500 md:flex">
      <h1>
        <a className="cursor-pointer text-3xl tracking-wider">
          Reci<span className="text-accent-500 ">One</span>
        </a>
      </h1>
      <ul className="flex min-w-0 gap-4 text-xl text-accent-500">
        <li className="grid place-items-center">
          <button className="cursor-pointer">HOME</button>
        </li>
        <li className="grid place-items-center">
          <button className="cursor-pointer">FAVOURITES</button>
        </li>
        <li className="grid place-items-center">
          <button
            className="cursor-pointer"
            onClick={() => navigate("/recipes")}
          >
            RECIPES
          </button>
        </li>
        <li className="grid place-items-center">
          <button className="cursor-pointer">NOTES</button>
        </li>
        <li className="grid place-items-center">
          <button
            className="cursor-pointer"
            onClick={() => navigate("/recipes/create")}
          >
            ADD RECIPE
          </button>
        </li>
      </ul>
    </nav>
  );
}

function MobileNav() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen((io) => !io);
  const navigate = (path: string) => {
    if (router.pathname !== path) {
      router.push(path);
    }
    setIsOpen(false);
  };
  // Remove scrollbar from mobile nav
  // setInterval needs to match the transition time for the menu to full open b/c
  // users will see content shift since hidden will remove the scrollbar which shifts content
  useLayoutEffect(() => {
    const body = document.querySelector("body");
    if (!body) return;
    let id: number;
    if (isOpen) {
      id = window.setTimeout(() => (body.style.overflow = "hidden"), 150);
    } else {
      body.style.overflow = "auto";
    }
    return () => clearTimeout(id);
  });
  return (
    <nav className="isolate mx-auto flex w-full justify-between text-gray-500 md:hidden">
      <h1>
        <a tabIndex={0} className="text-3xl tracking-wider">
          Reci<span className="text-accent-500 ">One</span>
        </a>
      </h1>
      <button onClick={toggleMenu}>
        <FaBars size="30" />
      </button>
      <ul
        className={`${
          isOpen ? "translate-x-0" : "translate-x-full"
        } fixed inset-0 flex flex-col items-center justify-center gap-2 bg-secondary text-xl transition-transform`}
      >
        <li className="absolute top-[15px] right-[13px] text-gray-500">
          <button onClick={toggleMenu}>
            <CgClose size={35} />
          </button>
        </li>
        <li>
          <button className="cursor-pointer">HOME</button>
        </li>
        <li>
          <button className="cursor-pointer">FAVOURITES</button>
        </li>
        <li>
          <button
            className="cursor-pointer"
            onClick={() => navigate("/recipes")}
          >
            RECIPES
          </button>
        </li>
        <li>
          <button className="cursor-pointer">NOTES</button>
        </li>
        <li>
          <button
            className="cursor-pointer"
            onClick={() => navigate("/recipes/create")}
          >
            ADD RECIPE
          </button>
        </li>
      </ul>
    </nav>
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
    <p className="ml-auto flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap">
      Logged in as
      <span
        style={{ maxWidth: "5rem" }}
        className="inline-block w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
      >
        very long name for testing purposes
      </span>
    </p>
  );
}
