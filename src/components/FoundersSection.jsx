"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";

/**
 * FoundersSection
 * Drop this at the very top of app/page.tsx, above everything else.
 * Two founder portraits slide in from opposite edges and turn to
 * face each other as the section scrolls into view, with a light
 * parallax drift tied to scroll position underneath.
 *
 * Requires:
 *   /public/founders/founder-1.png
 *   /public/founders/founder-2.png
 * (already included in this delivery — just copy the whole
 * public/founders folder into your project's /public folder)
 */
export default function FoundersSection() {
  const { ref, visible } = useScrollReveal({ threshold: 0.2 });
  const sectionRef = useRef(null);
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const el = sectionRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const vh = window.innerHeight || 1;
          // -1 (section far below) .. 1 (section far above) roughly, clamped
          const progress = Math.max(-1, Math.min(1, 1 - rect.top / vh));
          setParallax(progress);
        }
        raf = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={(node) => {
        ref.current = node;
        sectionRef.current = node;
      }}
      className={`founders ${visible ? "is-visible" : ""}`}
    >
      <div className="founders__inner">
        <p className="founders__eyebrow">من بدأ الحكاية</p>
        <h2 className="founders__headline">
          اتنين بيسمعوا موسيقى صح، قرروا يبنوا المكان اللي الفنان فيه ياخد حقه
        </h2>

        <div className="founders__stage">
          <figure
            className="founders__portrait founders__portrait--left"
            style={{
              transform: `translateY(${parallax * -14}px)`,
            }}
          >
            <Image
              src="/founders/founder-1.png"
              alt="أحد مؤسسي تيونيفاي"
              width={640}
              height={900}
              className="founders__img"
              priority
            />
            <figcaption className="founders__caption">
              <span className="founders__name">المؤسس الأول</span>
              <span className="founders__role">Co-Founder</span>
            </figcaption>
          </figure>

          <div className="founders__divider" aria-hidden="true">
            <span className="founders__divider-line" />
          </div>

          <figure
            className="founders__portrait founders__portrait--right"
            style={{
              transform: `translateY(${parallax * 14}px)`,
            }}
          >
            <Image
              src="/founders/founder-2.png"
              alt="المؤسس الثاني لتيونيفاي"
              width={640}
              height={900}
              className="founders__img founders__img--flip"
              priority
            />
            <figcaption className="founders__caption">
              <span className="founders__name">المؤسس التاني</span>
              <span className="founders__role">Co-Founder</span>
            </figcaption>
          </figure>
        </div>
      </div>

      <style jsx>{`
        .founders {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background: #12100e;
          color: #f6f1e7;
          padding: clamp(3rem, 8vw, 7rem) clamp(1.25rem, 5vw, 4rem);
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        .founders__inner {
          max-width: 1180px;
          margin: 0 auto;
          width: 100%;
        }

        .founders__eyebrow {
          font-family: Georgia, "Iowan Old Style", ui-serif, serif;
          font-style: italic;
          font-size: 0.95rem;
          color: #d4a657;
          margin: 0 0 0.75rem;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }

        .founders__headline {
          font-family: Georgia, "Iowan Old Style", ui-serif, serif;
          font-weight: 600;
          font-size: clamp(1.6rem, 4vw, 2.75rem);
          line-height: 1.25;
          max-width: 18ch;
          margin: 0 0 clamp(2.5rem, 6vw, 4.5rem);
          color: #f6f1e7;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s;
        }

        .founders__stage {
          position: relative;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: end;
          gap: clamp(1rem, 3vw, 2.5rem);
        }

        .founders__portrait {
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          will-change: transform;
        }

        .founders__portrait--left {
          justify-self: end;
          opacity: 0;
          transform: translateX(-60px) rotate(-3deg);
          transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.05s,
            transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.05s;
        }

        .founders__portrait--right {
          justify-self: start;
          opacity: 0;
          transform: translateX(60px) rotate(3deg);
          transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s,
            transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
        }

        .founders.is-visible .founders__eyebrow,
        .founders.is-visible .founders__headline {
          opacity: 1;
          transform: translateY(0);
        }

        .founders.is-visible .founders__portrait--left {
          opacity: 1;
          transform: translateX(0) rotate(0deg);
        }

        .founders.is-visible .founders__portrait--right {
          opacity: 1;
          transform: translateX(0) rotate(0deg);
        }

        .founders__img {
          width: 100%;
          max-width: 300px;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 30px 40px rgba(0, 0, 0, 0.55));
        }

        /* Mirrors the right-hand founder so both portraits appear to
           face inward, toward each other. Remove this rule if it looks
           wrong once you see your real photos in place. */
        .founders__img--flip {
          transform: scaleX(-1);
        }

        .founders__caption {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
        }

        .founders__name {
          font-weight: 600;
          font-size: 1rem;
          color: #f6f1e7;
        }

        .founders__role {
          font-size: 0.8rem;
          color: #a99c8c;
          letter-spacing: 0.02em;
        }

        .founders__divider {
          align-self: stretch;
          display: flex;
          justify-content: center;
        }

        .founders__divider-line {
          width: 1px;
          height: 100%;
          background: linear-gradient(
            to bottom,
            transparent,
            #d4a657 40%,
            #d4a657 60%,
            transparent
          );
          opacity: 0.5;
        }

        @media (max-width: 720px) {
          .founders__stage {
            grid-template-columns: 1fr;
            justify-items: center;
            gap: 0.5rem;
          }
          .founders__portrait--left,
          .founders__portrait--right {
            justify-self: center;
          }
          .founders__divider {
            width: 60%;
            height: 1px;
          }
          .founders__divider-line {
            width: 100%;
            height: 1px;
            background: linear-gradient(
              to right,
              transparent,
              #d4a657 40%,
              #d4a657 60%,
              transparent
            );
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .founders__eyebrow,
          .founders__headline,
          .founders__portrait--left,
          .founders__portrait--right {
            transition: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </section>
  );
}
