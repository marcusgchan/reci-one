import type { NextComponentType } from "next/dist/shared/lib/utils";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import "../styles/globals.css";
import { AppProps } from "next/app";
import React from "react";
import { NavBar } from "@/components/Navbar";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader } from "@/shared/components/Loader";
import { trpc } from "@/utils/trpc";
import { SnackbarProvider } from "@/components/Snackbar";

type CustomPageProps = AppProps & {
  Component: NextComponentType & { auth?: boolean; hideNav?: boolean };
};

const queryClient = new QueryClient();

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: CustomPageProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <SnackbarProvider>
          <Auth componentAuth={Component.auth}>
            <Layout hideNav={Component.hideNav}>
              <Component {...pageProps} />
            </Layout>
          </Auth>
        </SnackbarProvider>
      </SessionProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

const Auth = ({
  children,
  componentAuth,
}: {
  children: React.ReactNode;
  componentAuth?: boolean;
}) => {
  const { status } = useSession();
  if (status === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader />
      </div>
    );
  } else if (componentAuth && status === "unauthenticated") {
    return (
      <div>
        <h1>You are not logged in</h1>
        <button onClick={() => signIn()}>Login</button>
      </div>
    );
  }
  return <>{children}</>;
};

const Layout = ({
  children,
  hideNav,
}: {
  children: React.ReactNode;
  hideNav: boolean | undefined;
}) => {
  return (
    <section className="isolate mx-auto flex min-h-full w-full flex-col gap-2 p-4 pt-0">
      {!hideNav && (
        <header className="sticky top-0 z-20 grid place-items-center bg-white py-4">
          <NavBar />
        </header>
      )}
      <main className="isolate z-10 mx-auto min-h-0 w-full max-w-7xl">
        {children}
      </main>
    </section>
  );
};

export default trpc.withTRPC(MyApp);
