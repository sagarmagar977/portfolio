import type { Metadata, Viewport } from "next";
import { Bai_Jamjuree } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const baiJamjuree = Bai_Jamjuree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Portfolio Manager",
  description: "Create and manage your portfolio from one dashboard.",
};

export const viewport: Viewport = {
  themeColor: "#022a30",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: "dark" }}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/line-awesome@1.3.0/dist/line-awesome/css/line-awesome.min.css"
        />
      </head>
      <body className={baiJamjuree.className} tabIndex={0}>
        {children}
        <Script
          src="https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js"
          strategy="afterInteractive"
        />
        <Script id="aos-init" strategy="afterInteractive">
          {`
            (function initPortfolioAos() {
              function run() {
                if (!window.AOS) {
                  window.setTimeout(run, 100);
                  return;
                }

                document.documentElement.classList.add("aos-ready");
                window.AOS.init({
                  offset: 120,
                  delay: 0,
                  duration: 700,
                  easing: "ease",
                  once: false,
                  mirror: false,
                  anchorPlacement: "top-bottom",
                });
                window.AOS.refresh();
              }

              if (document.readyState === "complete" || document.readyState === "interactive") {
                run();
              } else {
                window.addEventListener("DOMContentLoaded", run, { once: true });
              }
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
