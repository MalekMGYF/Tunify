"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useScrollReveal
 * Vanilla IntersectionObserver hook — no extra npm packages needed.
 * Returns a ref to attach to any element, and a boolean that flips
 * to true once the element scrolls into view (and stays true).
 *
 * Usage:
 *   const { ref, visible } = useScrollReveal();
 *   <div ref={ref} className={visible ? "reveal is-visible" : "reveal"}>
 */
export function useScrollReveal({ threshold = 0.25, rootMargin = "0px 0px -10% 0px" } = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect people who've asked their OS for less motion.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el); // animate in once, don't re-trigger
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, visible };
}
