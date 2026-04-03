"use client";

import { useEffect, useState } from "react";

type PortfolioNavProps = {
  fullName: string;
  profileImageUrl: string | null;
  items: Array<{
    href: string;
    label: string;
  }>;
  variant?: "sidebar" | "topbar";
};

export function PortfolioNav({ fullName, profileImageUrl, items, variant = "sidebar" }: PortfolioNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("#home");
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "P";

  useEffect(() => {
    const closeMenu = () => setIsOpen(false);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("hashchange", closeMenu);
    return () => {
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("hashchange", closeMenu);
    };
  }, []);

  useEffect(() => {
    const sections = items
      .map((item) => document.querySelector(item.href))
      .filter((section): section is HTMLElement => section instanceof HTMLElement);

    if (!sections.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveHref(`#${visible[0].target.id}`);
        }
      },
      {
        rootMargin: "-18% 0px -58% 0px",
        threshold: [0.2, 0.4, 0.7],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className={variant === "topbar"
      ? "sticky top-0 z-40 border-b border-white/8 bg-[rgba(2,42,48,0.9)] backdrop-blur relative"
      : "sticky top-0 z-40 bg-[var(--color-base)] lg:fixed lg:inset-y-0 lg:left-0 lg:right-auto lg:w-[var(--sidbar-width)] lg:bg-[linear-gradient(rgba(3,63,71,0.8),rgba(3,63,71,0.8)),url('/assets/images/sidebar-img.jpg')] lg:bg-cover lg:bg-center"}
    >
      <div className={variant === "topbar"
        ? "mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4"
        : "mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center px-4 py-4 lg:flex lg:h-full lg:flex-col lg:justify-center lg:px-5 lg:py-[2.75rem]"}
      >
        <a
          className={variant === "topbar"
            ? "flex min-w-0 items-center gap-3"
            : "min-w-0 lg:mx-auto lg:mb-8 lg:flex lg:w-full lg:flex-col lg:items-center"}
          href="#home"
          onClick={() => setIsOpen(false)}
        >
          <span className={`block text-2xl font-bold text-[var(--color-heading)]${variant === "topbar" ? "" : " lg:hidden"}`}>
            {fullName}
          </span>
          <span
            className={variant === "topbar"
              ? "hidden h-12 w-12 overflow-hidden rounded-full border border-[var(--color-brand)] shadow-[0_0_0_3px_rgba(223,247,128,0.08)] sm:block"
              : "hidden h-[178px] w-[178px] overflow-hidden rounded-full border-[8px] border-[var(--color-brand)] shadow-[0_16px_34px_rgba(0,0,0,0.22)] lg:block"}
          >
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                className="h-full w-full object-cover"
                alt={fullName}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(224,247,128,0.16),rgba(255,255,255,0.04))] text-[var(--color-heading)]">
                <span className={variant === "topbar" ? "text-sm font-bold" : "text-4xl font-bold tracking-[0.08em]"}>
                  {initials}
                </span>
              </span>
            )}
          </span>
        </a>

        <button
          type="button"
          className={`justify-self-end inline-flex h-14 w-14 items-center justify-center rounded-2xl border text-[var(--color-heading)] transition focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] lg:hidden ${
            isOpen
              ? "border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.06)] text-[var(--color-heading)] shadow-[0_0_0_3px_rgba(255,255,255,0.18)]"
              : "border-white/20 bg-transparent text-[rgba(255,255,255,0.82)] hover:border-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--color-heading)]"
          }`}
          aria-expanded={isOpen}
          aria-controls="site-navigation"
          aria-label="Toggle navigation"
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className="sr-only">Toggle navigation</span>
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </button>

        <div
          id="site-navigation"
          className={variant === "topbar"
            ? `${isOpen ? "mt-4 flex" : "hidden"} absolute left-4 right-4 top-full flex-col rounded-3xl border border-white/10 bg-[rgba(2,42,48,0.98)] p-3 shadow-2xl md:static md:mt-0 md:flex md:w-auto md:flex-row md:border-0 md:bg-transparent md:p-0 md:shadow-none`
            : `${isOpen ? "col-span-2 mt-4 flex border-t border-white/10 pt-4" : "hidden"} w-full flex-col bg-transparent p-0 shadow-none lg:col-auto lg:mt-0 lg:flex lg:w-full lg:flex-none lg:justify-center lg:border-0 lg:pt-0`}
        >
          <ul className={variant === "topbar"
            ? "flex w-full flex-col gap-1 text-left md:w-auto md:flex-row md:items-center md:gap-2 md:text-center"
            : "flex w-full flex-col gap-1 text-left lg:items-center lg:gap-4 lg:text-center"}
          >
            {items.map((item) => (
              <li key={item.href} className={variant === "topbar" ? "" : "lg:flex lg:justify-center"}>
                <a
                  className={`rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-[0.02em] transition ${
                    variant === "topbar"
                      ? "block md:px-3 md:py-2"
                      : "block w-full lg:inline-flex lg:items-center lg:justify-center lg:rounded-none lg:bg-transparent lg:px-0 lg:py-1.5 lg:text-[0.98rem]"
                  } ${
                    activeHref === item.href
                      ? variant === "topbar"
                        ? "bg-[rgba(223,247,128,0.14)] text-[var(--color-brand)] ring-1 ring-[rgba(223,247,128,0.35)]"
                        : "text-[var(--color-brand)]"
                      : variant === "topbar"
                        ? "text-white hover:bg-white/5 hover:text-[var(--color-brand)]"
                        : "text-white hover:text-[var(--color-brand)]"
                  }`}
                  href={item.href}
                  onClick={() => {
                    setActiveHref(item.href);
                    setIsOpen(false);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
