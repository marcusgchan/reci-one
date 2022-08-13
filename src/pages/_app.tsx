// src/pages/_app.tsx
import { withTRPC } from "@trpc/next";
import type { AppRouter } from "../server/router";
import type { AppType, NextComponentType } from "next/dist/shared/lib/utils";
import superjson from "superjson";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import "../styles/globals.css";
import { AppProps } from "next/app";
import React, { Fragment, useEffect, useState } from "react";
import useIsMobile from '../shared/hooks/useIsMobile';

type CustomPageProps = AppProps & {
  Component: NextComponentType & { auth?: boolean };
};

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: CustomPageProps) => {
  return (
    <SessionProvider session={session}>
      {Component.auth ? (
        <Auth>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </Auth>
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </SessionProvider>
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

const Layout = ({children}: {children : React.ReactNode}) => {

  if (useIsMobile()) {
    return (
      <>
        <div>Burger</div>
        <main>{children}</main>
      </>
    );
  }
  return (
    <>
      <nav className="flex bg-slate-500">
        <li>HOME</li>
        <li>SEARCH</li>
        <li>FAVOURITES</li>
      </nav>
      <main>
        {children}
      </main>
    </>
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
