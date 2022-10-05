// src/pages/_app.tsx
import { withTRPC } from "@trpc/next";
import type { AppRouter } from "../server/router";
import type { NextComponentType } from "next/dist/shared/lib/utils";
import superjson from "superjson";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import "../styles/globals.css";
import { AppProps } from "next/app";
import React from "react";
import useIsMobile from "../shared/hooks/useIsMobile";
import { DesktopNav, MobileNav } from "../components/Navbar";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
        {Component.auth ? (
          <Auth>
            <Layout hideNav={Component.hideNav}>
              <Component {...pageProps} />
            </Layout>
          </Auth>
        ) : (
          <Layout hideNav={Component.hideNav}>
            <Component {...pageProps} />
          </Layout>
        )}
      </SessionProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

const Auth = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();
  if (status === "loading") {
    return <div>Loading...</div>;
  } else if (status === "unauthenticated") {
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
  if (useIsMobile()) {
    return (
      <section className="p-5 h-screen flex flex-col gap-4">
        {!hideNav && (
          <header className="relative z-20">
            <MobileNav />
          </header>
        )}
        <main className="flex-1 flex-col min-h-0 isolate z-10 h-full overflow-scroll">
          {children}
        </main>
      </section>
    );
  }
  return (
    <section className="p-5 h-screen flex flex-col max-w-7xl mx-auto gap-4">
      {!hideNav && (
        <header>
          <DesktopNav />
        </header>
      )}
      <main className="flex-1 min-h-0 h-full overflow-scroll">{children}</main>
    </section>
  );
};

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;

    return {
      url,
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);
