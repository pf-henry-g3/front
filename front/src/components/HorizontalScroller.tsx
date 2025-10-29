"use client";

import { ReactNode, useRef, useCallback } from "react";

export default function HorizontalScroller({
  children,
  gap = 16,
}: {
  children: ReactNode;
  gap?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const scrollOne = useCallback(
    (dir: "left" | "right") => {
      const el = ref.current;
      if (!el) return;


      const first = el.firstElementChild as HTMLElement | null;
      const itemWidth = first ? first.getBoundingClientRect().width : el.clientWidth - gap;
      const amount = Math.round(itemWidth + gap);

      el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    },
    [gap]
  );

  return (
    <div className="relative w-full px-12">
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory py-2"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>

      <button
        onClick={() => scrollOne("left")}
        aria-label="Scroll left"
        className="hidden md:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 text-oscuro2 bg-tur3 rounded-full shadow-md hover:cursor-pointer hover:text-oscuro1 hover:bg-tur1 transition hover:-translate-x-0.5 duration-100"
        >
        ‹
      </button>
        

      <button
        onClick={() => scrollOne("right")}
        aria-label="Scroll right"
        className="hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 text-oscuro2 bg-tur3 rounded-full shadow-md hover:cursor-pointer hover:text-oscuro1 hover:bg-tur1 hover:translate-x-0.5 duration-100"
      >
        ›
      </button>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Fir0efox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  );
}