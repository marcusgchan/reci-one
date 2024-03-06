import { NavBar } from "~/components/Navbar";

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <div className="space-y-2">
      <header className="sticky top-0 z-20 grid place-items-center bg-white">
        <NavBar />
      </header>
      {children}
    </div>
  );
}
