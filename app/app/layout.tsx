import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sagar Thapa",
  description: "Portfolio of Sagar Thapa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/line-awesome@1.3.0/dist/line-awesome/css/line-awesome.min.css"
        />
      </head>
      <body data-bs-spy="scroll" data-bs-target=".navbar" data-bs-smooth-scroll="true" tabIndex={0}>
        {children}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
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
