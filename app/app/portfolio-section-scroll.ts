"use client";

const MOBILE_NAV_OFFSET = 96;
const DESKTOP_WHEEL_THRESHOLD = 36;
const DESKTOP_WHEEL_COOLDOWN_MS = 720;
const WHEEL_IDLE_RESET_MS = 160;

function getTopOffset() {
  return window.innerWidth >= 992 ? 0 : MOBILE_NAV_OFFSET;
}

function getSectionTop(section: HTMLElement) {
  const sectionTop = window.scrollY + section.getBoundingClientRect().top;
  return Math.max(sectionTop - getTopOffset(), 0);
}

function getSections(sectionIds: string[]) {
  return sectionIds
    .map((id) => document.getElementById(id))
    .filter((section): section is HTMLElement => section instanceof HTMLElement);
}

function getActiveSectionIndex(sections: HTMLElement[]) {
  const currentY = window.scrollY + getTopOffset() + window.innerHeight * 0.2;

  let activeIndex = 0;
  sections.forEach((section, index) => {
    if (getSectionTop(section) <= currentY) {
      activeIndex = index;
    }
  });

  return activeIndex;
}

function canNaturallyScrollInsideSection(section: HTMLElement, direction: 1 | -1) {
  const sectionTop = getSectionTop(section);
  const sectionBottom = sectionTop + section.offsetHeight;
  const viewportTop = window.scrollY;
  const viewportCenter = viewportTop + window.innerHeight * 0.5;
  const isTallSection = section.offsetHeight > window.innerHeight;

  if (!isTallSection) {
    return false;
  }

  if (direction > 0) {
    return sectionBottom > viewportCenter;
  }

  return sectionTop < viewportCenter && viewportTop > sectionTop;
}

export function scrollToPortfolioSection(href: string, behavior: ScrollBehavior = "smooth") {
  if (typeof window === "undefined" || !href.startsWith("#")) {
    return;
  }

  const section = document.querySelector<HTMLElement>(href);
  if (!section) {
    return;
  }

  const nextTop = getSectionTop(section);
  window.scrollTo({ top: nextTop, behavior });
  window.history.pushState(null, "", href);
}

export function setupPortfolioWheelSnap(sectionIds: string[]) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  let isAnimating = false;
  let lastSnapAt = 0;
  let wheelDeltaAccumulator = 0;
  let wheelResetTimer: number | null = null;

  function clearWheelAccumulator() {
    wheelDeltaAccumulator = 0;

    if (wheelResetTimer !== null) {
      window.clearTimeout(wheelResetTimer);
      wheelResetTimer = null;
    }
  }

  function releaseAnimationLock() {
    window.setTimeout(() => {
      isAnimating = false;
    }, DESKTOP_WHEEL_COOLDOWN_MS);
  }

  function handleWheel(event: WheelEvent) {
    if (window.innerWidth < 992) {
      return;
    }

    const target = event.target;
    if (
      target instanceof HTMLElement
      && target.closest("input, textarea, select, button, [contenteditable='true'], audio, video")
    ) {
      return;
    }

    const now = Date.now();
    if (isAnimating || now - lastSnapAt < DESKTOP_WHEEL_COOLDOWN_MS) {
      event.preventDefault();
      return;
    }

    const sections = getSections(sectionIds);
    if (sections.length < 2) {
      return;
    }

    wheelDeltaAccumulator += event.deltaY;
    if (wheelResetTimer !== null) {
      window.clearTimeout(wheelResetTimer);
    }
    wheelResetTimer = window.setTimeout(clearWheelAccumulator, WHEEL_IDLE_RESET_MS);

    if (Math.abs(wheelDeltaAccumulator) < DESKTOP_WHEEL_THRESHOLD) {
      return;
    }

    const direction = wheelDeltaAccumulator > 0 ? 1 : -1;
    const activeIndex = getActiveSectionIndex(sections);
    const activeSection = sections[activeIndex];

    if (activeSection && canNaturallyScrollInsideSection(activeSection, direction)) {
      clearWheelAccumulator();
      return;
    }

    const nextIndex = Math.max(0, Math.min(sections.length - 1, activeIndex + direction));
    clearWheelAccumulator();

    if (nextIndex === activeIndex) {
      return;
    }

    event.preventDefault();
    isAnimating = true;
    lastSnapAt = now;
    window.scrollTo({
      top: getSectionTop(sections[nextIndex]),
      behavior: "smooth",
    });
    window.history.pushState(null, "", `#${sections[nextIndex].id}`);
    releaseAnimationLock();
  }

  window.addEventListener("wheel", handleWheel, { passive: false });

  return () => {
    clearWheelAccumulator();
    window.removeEventListener("wheel", handleWheel);
  };
}
