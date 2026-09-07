"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/config/app";

export default function FAQ({ platforms }: { platforms: string[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = FAQ_ITEMS.map((item) => ({
    ...item,
    answer:
      item.answer === "__DYNAMIC_PLATFORMS__"
        ? `Tunify currently supports ${platforms.length > 0 ? platforms.join(", ") : "REPLACE_ME"}.`
        : item.answer,
  }));

  return (
    <section id="faq" className="py-24 sm:py-28">
      <div className="container-page max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2>

        <div className="mt-10 divide-y divide-white/8 border-y border-white/8">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div key={item.question}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-base font-medium text-mist-100 sm:text-lg">{item.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-mist-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-sm leading-relaxed text-mist-400 sm:text-base">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
