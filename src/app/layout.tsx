"use client";

import "./globals.css";


// import { RecoilRoot } from "recoil";
import { Toaster } from "react-hot-toast";
import { Suspense, useEffect } from "react";
import { WalletProvider } from "@/context/base";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {



  return (
    <html lang="en">
      <body
      // className={geistSans.className}
      >

        {/* <RecoilRoot> */}

        <Suspense fallback={<div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-2"> ...</span>
        </div>}>
        <WalletProvider>
          {children}
        </WalletProvider>
          {/* {children} */}
        </Suspense>
        <Toaster position="top-right" reverseOrder={false} />
        {/* </RecoilRoot> */}

      </body>
    </html>
  );
}
