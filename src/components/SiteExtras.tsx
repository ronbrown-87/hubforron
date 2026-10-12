import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";

/** Thin reading-progress bar. Pure CSS (scroll-driven animation); renders nothing visible where unsupported. */
export function ScrollProgress() {
  return <div className="scroll-progress" aria-hidden="true" />;
}

/** Tracks which section is under the middle of the viewport, for highlighting the nav. */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState("");
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

/** WhatsApp quick-contact + back-to-top. Scroll handler is rAF-throttled and only re-renders when the flag flips. */
export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => { frame = 0; setShowTop(window.scrollY > 700); };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 z-40 flex flex-col items-end gap-3 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:right-6">
      <button
        type="button"
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-all duration-300 hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${showTop ? "pointer-events-auto translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
      >
        <ArrowUp className="size-5" />
      </button>
      <a
        href="https://wa.me/260972601568?text=Hello%20Norum%27sHub%2C%20I%27d%20like%20to%20discuss%20a%20project."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="pointer-events-auto flex h-12 items-center gap-2 rounded-full bg-[#25D366] px-3.5 text-sm font-bold text-[#06371b] shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4"
      >
        <MessageCircle className="size-5" />
        <span className="hidden sm:inline">Chat on WhatsApp</span>
      </a>
    </div>
  );
}
