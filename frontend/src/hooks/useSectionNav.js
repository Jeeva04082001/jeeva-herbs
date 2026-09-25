import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/** Height of the sticky navbar — sections stop below it instead of under it. */
export const NAV_OFFSET = 76;

/** Single source of truth for the in-page links (Navbar + Footer both read this). */
export const sectionLinks = [
  { label: "About", id: "about" },
  { label: "Variants", id: "products" },
  { label: "Combos", id: "combos" },
  { label: "Benefits", id: "benefits" },
  { label: "Reviews", id: "reviews" },
  { label: "FAQ", id: "faq" },
  { label: "Contact", id: "contact" },
];

/** Scrolls to a section, allowing for the sticky bar. Returns false if it isn't on the page yet. */
export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return false;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET,
    behavior: reduceMotion ? "auto" : "smooth",
  });
  return true;
}

/**
 * Section navigation that works from any route.
 * Pass { observe: true } in ONE component (the Navbar) to also track the active
 * section and handle incoming /#hash links — otherwise you get duplicate observers.
 */
export function useSectionNav({ observe = false } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("");

  const isHome = location.pathname === "/";

  const goToSection = useCallback(
    (id) => {
      if (isHome) {
        scrollToSection(id);
        // Keeps the URL shareable without triggering a second, un-offset jump
        window.history.replaceState(null, "", `#${id}`);
      } else {
        navigate(`/#${id}`);
      }
    },
    [isHome, navigate]
  );

  // Arriving from another route: wait for Home to paint, then scroll.
  useEffect(() => {
    if (!observe || !isHome || !location.hash) return;

    const id = location.hash.slice(1);
    let frame;
    let attempts = 0;

    const tick = () => {
      if (scrollToSection(id) || attempts++ > 30) return;
      frame = requestAnimationFrame(tick);
    };
    tick();

    return () => cancelAnimationFrame(frame);
  }, [observe, isHome, location.hash]);

  // Highlight whichever section is currently in view.
  useEffect(() => {
    if (!observe || !isHome) {
      setActiveSection("");
      return;
    }

    const elements = sectionLinks
      .map((link) => document.getElementById(link.id))
      .filter(Boolean);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (inView[0]) setActiveSection(inView[0].target.id);
      },
      { rootMargin: `-${NAV_OFFSET + 8}px 0px -55% 0px` }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [observe, isHome]);

  return { goToSection, activeSection, isHome };
}