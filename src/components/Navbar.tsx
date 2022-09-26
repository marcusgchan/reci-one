import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import { GrFormClose } from "react-icons/gr";
import { useRouter } from "next/router";

export function DesktopNav() {
  const router = useRouter();
  return (
    <nav className="flex justify-between px-3 text-2xl border-primary border-4 w-full p-2">
      <h1>
        <a className="text-3xl tracking-wider cursor-pointer" tabIndex={0}>
          Reci<span className="text-accent-500 ">One</span>
        </a>
      </h1>
      <ul className="flex gap-4 text-xl min-w-0 text-accent-500">
        <li className="grid place-items-center">
          <a className="cursor-pointer" tabIndex={0}>
            HOME
          </a>
        </li>
        <li className="grid place-items-center">
          <a className="cursor-pointer" tabIndex={0}>
            FAVOURITES
          </a>
        </li>
        <li className="grid place-items-center">
          <a className="cursor-pointer" onClick={() => router.push("/recipes")}>
            RECIPES
          </a>
        </li>
        <li className="grid place-items-center">
          <a className="cursor-pointer" tabIndex={0}>
            NOTES
          </a>
        </li>
        <li className="grid place-items-center">
          <a className="cursor-pointer" tabIndex={0}>
            ADD RECIPE
          </a>
        </li>
        {/* <LoggedIn /> */}
      </ul>
    </nav>
  );
}

export function MobileNav() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen((io) => !io);
  return (
    <nav className="flex justify-between py-4 px-10 isolate md:max-w-7xl max-w-lg w-full mx-auto">
      <h1>
        <a tabIndex={0} className="text-3xl tracking-wider">
          Reci<span className="text-accent-500 ">One</span>
        </a>
      </h1>
      <button onFocus={toggleMenu} onClick={toggleMenu} className="">
        <FaBars size="30" />
      </button>
      <ul
        className={`${
          isOpen ? "translate-x-0" : "translate-x-full"
        } fixed inset-0 flex transition-transform flex-col justify-center items-center bg-secondary text-xl gap-2`}
      >
        <li className="absolute top-[12px] right-[15px]">
          <button onClick={toggleMenu}>
            <GrFormClose size={35} />
          </button>
        </li>
        <li>
          <a tabIndex={0} className="cursor-pointer">
            HOME
          </a>
        </li>
        <li>
          <a tabIndex={0} className="cursor-pointer">
            FAVOURITES
          </a>
        </li>
        <li>
          <a
            tabIndex={0}
            className="cursor-pointer"
            onClick={() => router.push("/recipes")}
          >
            RECIPES
          </a>
        </li>
        <li>
          <a tabIndex={0} className="cursor-pointer">
            NOTES
          </a>
        </li>
        <li>
          <a tabIndex={0} className="cursor-pointer">
            ADD RECIPE
          </a>
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
