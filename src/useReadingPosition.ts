"use client";

import { useEffect, useState, type RefObject } from "react";

export interface ReadingSection {
  id: string;
  label: string;
  depth?: number;
}

export interface ReadingPositionOptions {
  sections: readonly ReadingSection[];
  containerRef?: RefObject<HTMLElement | null> | undefined;
  offset?: number | undefined;
}

export function useReadingPosition({
  sections,
  containerRef,
  offset = 100,
}: ReadingPositionOptions) {
  const [position, setPosition] = useState({ activeId: "", progress: 0 });

  useEffect(() => {
    const container = containerRef?.current;
    const scroller = container ?? window;
    const find = (id: string) => {
      const element = document.getElementById(id);
      return element && (!container || container.contains(element))
        ? element
        : null;
    };
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = container
        ? container.getBoundingClientRect().top + container.clientTop
        : 0;
      let activeId = sections[0]?.id ?? "";
      for (const section of sections) {
        const element = find(section.id);
        if (element && element.getBoundingClientRect().top <= top + offset + 1)
          activeId = section.id;
      }
      const scrollTop = container ? container.scrollTop : window.scrollY;
      const distance = container
        ? container.scrollHeight - container.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        distance > 0 ? Math.max(0, Math.min(1, scrollTop / distance)) : 0;
      if (distance > 0 && scrollTop >= distance - 1)
        activeId = sections[sections.length - 1]?.id ?? "";
      setPosition((previous) =>
        previous.activeId === activeId && previous.progress === progress
          ? previous
          : { activeId, progress },
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(container ?? document.documentElement);
    for (const section of sections) {
      const element = find(section.id);
      if (element) observer.observe(element);
    }
    scroller.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scroller.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sections, containerRef, offset]);

  function navigate(id: string) {
    const element = document.getElementById(id);
    const container = containerRef?.current;
    if (!element || (container && !container.contains(element))) return;
    const top = container
      ? element.getBoundingClientRect().top -
        container.getBoundingClientRect().top -
        container.clientTop +
        container.scrollTop -
        offset
      : element.getBoundingClientRect().top + window.scrollY - offset;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "instant"
      : "smooth";
    (container ?? window).scrollTo({ top, behavior });
    const previousTabIndex = element.getAttribute("tabindex");
    if (previousTabIndex === null) element.setAttribute("tabindex", "-1");
    element.focus({ preventScroll: true });
    if (previousTabIndex === null)
      element.addEventListener(
        "blur",
        () => element.removeAttribute("tabindex"),
        { once: true },
      );
  }

  return { ...position, navigate };
}
