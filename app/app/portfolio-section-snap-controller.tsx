"use client";

import { useEffect } from "react";
import { setupPortfolioWheelSnap } from "./portfolio-section-scroll";

export function PortfolioSectionSnapController({ sectionIds }: { sectionIds: string[] }) {
  useEffect(() => setupPortfolioWheelSnap(sectionIds), [sectionIds]);

  return null;
}
