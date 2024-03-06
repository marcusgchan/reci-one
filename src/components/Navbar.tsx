"use client";

import { useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import { FaBars } from "react-icons/fa";
import { CgClose } from "react-icons/cg";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const navigate = (path: string) => {
    if (pathname !== path) {
      router.push(path);
    }
  };
  return (
    <nav className="hidden w-full justify-between border-4 border-gray-500 p-2 px-3 text-2xl text-gray-500 md:flex">
      <h1>
        <button
          onClick={() => navigate("/recipes")}
          className="cursor-pointer text-3xl tracking-wider"
        >
          Reci<span className="text-accent-500 ">One</span>
        </button>
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
  const [nextRoute, setNextRoute] = useState("");
  // let html: HTMLElement | undefined;
  // useEffect(() => {
  //   html = document.querySelector("html") as HTMLElement;
  // }, []);
  const toggleMenu = () => {
    setIsOpen((io) => !io);
  };
  const queueNavigation = (path: string) => {
    toggleMenu();
    setNextRoute(path);
  };
  return (
    <div className="isolate mx-auto flex w-full justify-between text-gray-500 md:hidden">
      <h1>
        <button
          onClick={() => queueNavigation("/recipes")}
          className="text-3xl tracking-wider"
        >
          Reci<span className="text-accent-500">One</span>
        </button>
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
          // Animating opening state
          if (isOpen && navRef.current) {
            navRef.current.style.display = "flex";
            // (html as HTMLHtmlElement).style.overflow = "hidden";
          }
          // Closing state
          else {
            // (html as HTMLHtmlElement).style.overflow = "auto";
          }
        }}
        onAnimationComplete={() => {
          if (!isOpen && nextRoute) {
            router.push(nextRoute);
            setNextRoute("");
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
          className="absolute right-[13px] top-[15px] text-gray-500"
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
              onClick={toggleMenu}
              onAnimationEnd={() => queueNavigation("/recipes")}
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
              onClick={() => queueNavigation("/recipes/create")}
            >
              ADD RECIPE
            </button>
          </li>
        </ul>
      </motion.nav>
    </div>
  );
}
