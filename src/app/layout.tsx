import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { SnackbarProvider } from "~/components/Snackbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "ReciOne",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`mx-auto max-w-screen-xl p-4 font-sans ${inter.variable}`}
      >
        <TRPCReactProvider>
          <SnackbarProvider>{children}</SnackbarProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
