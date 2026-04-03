"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, type MouseEvent, type PointerEvent } from "react";

type PortfolioItem = {
  id: string;
  slug: string;
  fullName: string;
  profileImageUrl: string | null;
  heroDescription: string | null;
  roles: string[];
  projectCount: number;
  serviceCount: number;
  socialLinkCount: number;
  location: string | null;
};

type LandingPortfolioCarouselProps = {
  portfolios: PortfolioItem[];
  roleLabelMap: Record<string, string>;
};

function getInitials(name: string) {
  const segments = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (segments.length === 0) {
    return "PF";
  }

  return segments.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function LandingPortfolioCarousel({
  portfolios,
  roleLabelMap,
}: LandingPortfolioCarouselProps) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const segmentWidthRef = useRef(0);
  const resetLockRef = useRef(false);
  const dragStateRef = useRef({
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });
  const loopedPortfolios = useMemo(
    () =>
      Array.from({ length: 3 }, (_, duplicateIndex) =>
        portfolios.map((portfolio) => ({
          portfolio,
          duplicateIndex,
        })),
      ).flat(),
    [portfolios],
  );

  useEffect(() => {
    const container = carouselRef.current;
    if (!container || portfolios.length === 0) {
      return;
    }

    const syncLoopPosition = (forceCenter = false) => {
      const nextSegmentWidth = container.scrollWidth / 3;

      if (!Number.isFinite(nextSegmentWidth) || nextSegmentWidth <= 0) {
        return;
      }

      segmentWidthRef.current = nextSegmentWidth;

      if (forceCenter || container.scrollLeft === 0) {
        container.scrollLeft = nextSegmentWidth;
      }
    };

    syncLoopPosition(true);

    const handleResize = () => syncLoopPosition(true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [portfolios]);

  const keepScrollInLoop = () => {
    const container = carouselRef.current;
    const segmentWidth = segmentWidthRef.current;

    if (!container || segmentWidth <= 0 || resetLockRef.current) {
      return;
    }

    if (container.scrollLeft < segmentWidth * 0.5) {
      resetLockRef.current = true;
      container.scrollLeft += segmentWidth;
      resetLockRef.current = false;
      return;
    }

    if (container.scrollLeft > segmentWidth * 1.5) {
      resetLockRef.current = true;
      container.scrollLeft -= segmentWidth;
      resetLockRef.current = false;
    }
  };

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof Element)) {
      return false;
    }

    return Boolean(target.closest("a, button, input, textarea, select, label"));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const container = carouselRef.current;
    if (!container || isInteractiveTarget(event.target)) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: container.scrollLeft,
      moved: false,
    };

    container.setPointerCapture(event.pointerId);
    container.classList.add("is-dragging");
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const container = carouselRef.current;
    const dragState = dragStateRef.current;

    if (!container || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;

    if (Math.abs(deltaX) > 6) {
      dragStateRef.current.moved = true;
    }

    container.scrollLeft = dragState.startScrollLeft - deltaX;
    keepScrollInLoop();
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const container = carouselRef.current;
    const dragState = dragStateRef.current;

    if (!container || dragState.pointerId !== event.pointerId) {
      return;
    }

    if (container.hasPointerCapture(event.pointerId)) {
      container.releasePointerCapture(event.pointerId);
    }

    container.classList.remove("is-dragging");
    dragStateRef.current.pointerId = -1;
    window.setTimeout(() => {
      dragStateRef.current.moved = false;
    }, 0);
  };

  const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (dragStateRef.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      dragStateRef.current.moved = false;
    }
  };

  return (
    <div
      ref={carouselRef}
      className="landing-portfolio-carousel"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={(event) => endDrag(event)}
      onScroll={keepScrollInLoop}
      aria-label="Public portfolio carousel"
    >
      <div className="landing-portfolio-track">
        {loopedPortfolios.map(({ portfolio, duplicateIndex }) => (
          <article
            key={`${portfolio.id}-${duplicateIndex}`}
            className="landing-portfolio-card landing-portfolio-carousel-card"
          >
            <div className="landing-portfolio-header">
              {portfolio.profileImageUrl ? (
                <Image
                  src={portfolio.profileImageUrl}
                  alt={`${portfolio.fullName} profile`}
                  className="landing-portfolio-avatar"
                  width={64}
                  height={64}
                />
              ) : (
                <div className="landing-portfolio-avatar landing-portfolio-avatar-fallback">
                  {getInitials(portfolio.fullName)}
                </div>
              )}

              <div className="landing-portfolio-meta">
                <h3>{portfolio.fullName}</h3>
                <p className="landing-portfolio-slug">/u/{portfolio.slug}</p>
              </div>
            </div>

            {portfolio.roles.length > 0 ? (
              <div className="portfolio-role-list">
                {portfolio.roles.map((role) => (
                  <span key={role} className="portfolio-role-pill">
                    {roleLabelMap[role] ?? role}
                  </span>
                ))}
              </div>
            ) : null}

            <p className="landing-portfolio-description">
              {portfolio.heroDescription ?? "Public creator profile ready to be explored."}
            </p>

            <div className="landing-portfolio-facts">
              <span>{portfolio.projectCount} projects</span>
              <span>{portfolio.serviceCount} services</span>
              <span>{portfolio.socialLinkCount} links</span>
              <span>{portfolio.location ?? "Remote / Global"}</span>
            </div>

            <a
              href={`/u/${portfolio.slug}`}
              className="landing-portfolio-link"
              target="_blank"
              rel="noreferrer"
              onClick={handleLinkClick}
              aria-hidden={duplicateIndex !== 1}
              tabIndex={duplicateIndex === 1 ? undefined : -1}
            >
              View portfolio
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
