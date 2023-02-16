import { useSession } from "next-auth/react";
import React, { useRef, useState } from "react";
import { FaBars } from "react-icons/fa";
import { CgClose } from "react-icons/cg";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

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
  const navRef = useRef<HTMLElement>(null);
  const html = document.querySelector("html");
  const toggleMenu = () => {
    setIsOpen((io) => !io);
  };
  const navigate = async (path: string) => {
    if (isOpen && navRef.current && navRef.current.getAnimations()) {
      router.push(path);
    } else if (router.pathname !== path) {
      router.push(path);
    }
  };
  return (
    <div className="isolate mx-auto flex w-full justify-between text-gray-500 md:hidden">
      <h1>
        <a tabIndex={0} className="text-3xl tracking-wider">
          Reci<span className="text-accent-500">One</span>
        </a>
      </h1>
      <button
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-controls="primary-navigation"
      >
        <FaBars size="30" />
      </button>

      <motion.nav
        ref={navRef}
        onAnimationStart={() => {
          if (isOpen && navRef.current) {
            navRef.current.style.display = "flex";
            (html as HTMLHtmlElement).style.overflow = 'hidden';
          }
        }}
        onAnimationComplete={() => {
          if (!isOpen && navRef.current) {
            navRef.current.style.display = 'none';
            (html as HTMLHtmlElement).style.overflow = 'auto';
          }
        }}
        animate={isOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 1, y: 0 },
          closed: { opacity: 0, y: "-100%" },
        }}
        transition={{ type: "tween" }}
        id="primary-navigation"
        className="fixed inset-0 hidden flex-col items-center justify-center gap-2 bg-secondary text-xl"
      >
        <button
          className="absolute top-[15px] right-[13px] text-gray-500"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-controls="primary-navigation"
        >
          <CgClose size={35} />
        </button>
        <ul>
          <li className="text-center">
            <button className="cursor-pointer">HOME</button>
          </li>
          <li className="text-center">
            <button className="cursor-pointer">FAVOURITES</button>
          </li>
          <li className="text-center">
            <button
              className="cursor-pointer"
              onClick={() => navigate("/recipes")}
            >
              RECIPES
            </button>
          </li>
          <li className="text-center">
            <button className="cursor-pointer">NOTES</button>
          </li>
          <li className="text-center">
            <button
              className="cursor-pointer"
              onClick={() => navigate("/recipes/create")}
            >
              ADD RECIPE
            </button>
          </li>
        </ul>
      </motion.nav>
    </div>
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
