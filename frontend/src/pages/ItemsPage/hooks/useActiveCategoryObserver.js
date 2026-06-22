import { useEffect, useRef, useState } from "react";

/**
 * Tracks which category section is in view without per-scroll getBoundingClientRect work.
 */
export function useActiveCategoryObserver(sectionIds, { topOffset = 160 } = {}) {
  const [activeId, setActiveId] = useState("all");
  const activeRef = useRef("all");

  useEffect(() => {
    if (!sectionIds.length) return;

    const visible = new Map();

    const pickActive = () => {
      if (window.scrollY < 100) {
        if (activeRef.current !== "all") {
          activeRef.current = "all";
          setActiveId("all");
        }
        return;
      }

      let bestId = null;
      let bestTop = Infinity;

      visible.forEach((_, id) => {
        const el = document.getElementById(`category-section-${id}`);
        if (!el) return;
        const top = el.getBoundingClientRect().top;
        if (top <= topOffset + 40 && top < bestTop) {
          bestTop = top;
          bestId = id;
        }
      });

      if (!bestId && visible.size > 0) {
        bestId = [...visible.keys()][0];
      }

      if (bestId && bestId !== activeRef.current) {
        activeRef.current = bestId;
        setActiveId(bestId);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id.replace("category-section-", "");
          if (entry.isIntersecting) {
            visible.set(id, entry.intersectionRatio);
          } else {
            visible.delete(id);
          }
        });
        pickActive();
      },
      {
        root: null,
        rootMargin: `-${topOffset}px 0px -55% 0px`,
        threshold: 0,
      }
    );

    const observed = [];
    for (const id of sectionIds) {
      const el = document.getElementById(`category-section-${id}`);
      if (el) {
        observer.observe(el);
        observed.push(el);
      }
    }

    let scrollTicking = false;
    const onScroll = () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        pickActive();
        scrollTicking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [sectionIds, topOffset]);

  return [activeId, setActiveId];
}
