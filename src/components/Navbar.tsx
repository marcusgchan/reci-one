import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import { GrFormClose } from "react-icons/gr";

export function DesktopNav() {
  return (
    <nav className="flex justify-between px-3 text-2xl border-primary border-4 w-full p-2">
      <div>
        <a href="#" className="text-3xl tracking-wider">
          Reci<span className="text-accent-500 ">One</span>
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
    <nav className="flex justify-between py-4 px-10 isolate md:max-w-7xl max-w-xl w-full mx-auto">
      <h1>
        <a href="#" className="text-3xl tracking-wider">
          Reci<span className="text-accent-500 ">One</span>
        </a>
      </h1>
      <button onClick={toggleMenu} className="">
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
          <a>HOME</a>
        </li>
        <li>
          <a>FAVOURITES</a>
        </li>
        <li>
          <a>MY RECIPES</a>
        </li>
        <li>
          <a>NOTES</a>
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
