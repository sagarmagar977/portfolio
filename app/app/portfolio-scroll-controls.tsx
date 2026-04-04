"use client";

import { useEffect, useState } from "react";

export function PortfolioScrollControls() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setShowBackToTop(window.scrollY > 520);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      type="button"
      className={`portfolio-back-to-top${showBackToTop ? " portfolio-back-to-top-visible" : ""}`}
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5 5 12l1.4 1.4 4.6-4.6V20h2V8.8l4.6 4.6L19 12z" />
      </svg>
    </button>
  );
}
