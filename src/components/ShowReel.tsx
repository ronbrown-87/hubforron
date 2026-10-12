import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

/**
 * Showreel: a looping, cinematic presentation of the work.
 * Visual language borrowed from product-launch reels: full-bleed scenes that dissolve into each
 * other, a slow push-in / pan on every image, a bold bottom-left caption, a 3D "fan" of cards with the
 * centre card raised, and collaboration cursors drifting over a canvas.
 *
 * Performance: only transform/opacity are animated; everything pauses when the reel is off-screen,
 * hovered (mouse), the tab is hidden, or the visitor prefers reduced motion. Scene timing is driven by the
 * progress bar's CSS animation (onAnimationEnd) so the bar and the slide can never drift apart.
 */

type Scene = {
  id: string;
  kind: "cinematic" | "fan" | "collab";
  title: string;
  text: string;
  images: string[];
  alt: string;
  pan: "in" | "left" | "right";
};

const SCENES: Scene[] = [
  {
    id: "web",
    kind: "cinematic",
    title: "Websites built to convert",
    text: "Premium, responsive web experiences with clear positioning and conversion-focused actions.",
    images: ["/work/norum-dark-showcase.webp"],
    alt: "Dark-mode website concept shown on desktop and mobile screens",
    pan: "in",
  },
  {
    id: "brand",
    kind: "fan",
    title: "Brand identities that stand out",
    text: "Logos, stationery, flyers and company profiles delivered as one consistent system.",
    images: ["/work/norum-business-card-showcase.webp", "/work/norum-flyer-showcase.webp", "/work/norum-company-profile-showcase.webp"],
    alt: "Business cards, flyers and a company profile fanned out in 3D",
    pan: "in",
  },
  {
    id: "responsive",
    kind: "cinematic",
    title: "Responsive on every screen",
    text: "One experience that carries cleanly from large desktops to tablets and phones.",
    images: ["/work/norum-wide-devices.webp"],
    alt: "Responsive website displayed across a range of devices",
    pan: "left",
  },
  {
    id: "together",
    kind: "collab",
    title: "Built together, start to finish",
    text: "Clear milestones, shared checkpoints and a binding agreement before any work begins.",
    images: ["/work/norum-multidevice-suite.webp"],
    alt: "Connected brand suite across web, mobile and tablet",
    pan: "right",
  },
  {
    id: "impact",
    kind: "cinematic",
    title: "Code. Design. Impact.",
    text: "Campaign visuals and art direction that turn a promise into something memorable.",
    images: ["/work/norum-cinematic-web.webp"],
    alt: "Cinematic promotional composition for Norum'sHub",
    pan: "in",
  },
];

const SCENE_MS = 7000;

function CursorIcon() {
  return (
    <svg viewBox="0 0 16 20" width="16" height="20" aria-hidden="true">
      <path d="M1.5 1.5 14 9.2l-5.3 1.2-2.6 5.6z" fill="currentColor" stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function ShowReel() {
  const [state, setState] = useState({ index: 0, prev: -1 });
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);

  const { index, prev } = state;
  const scene = SCENES[index]!;
  const running = playing && inView && tabVisible && !hovering && !reduced;

  const step = (delta: number) =>
    setState((current) => ({ index: (current.index + delta + SCENES.length) % SCENES.length, prev: current.index }));
  const goTo = (target: number) =>
    setState((current) => (current.index === target ? current : { index: target, prev: current.index }));

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(motion.matches);
    sync();
    motion.addEventListener("change", sync);
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    const node = root.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), { threshold: 0.25 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
  };
  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => { touchStart.current = event.touches[0]?.clientX ?? null; };
  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    const end = event.changedTouches[0]?.clientX;
    if (start == null || end == null) return;
    const delta = end - start;
    if (Math.abs(delta) > 48) step(delta < 0 ? 1 : -1);
  };
  const mouseOnly = (value: boolean) => (event: PointerEvent<HTMLDivElement>) => { if (event.pointerType === "mouse") setHovering(value); };

  return (
    <div
      ref={root}
      className="reel"
      data-running={String(running)}
      data-reduced={String(reduced)}
      style={{ "--reel-dur": `${SCENE_MS}ms` } as CSSProperties}
    >
      <div
        className="reel-stage aspect-[4/5] sm:aspect-[16/9]"
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured work showreel"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onPointerEnter={mouseOnly(true)}
        onPointerLeave={mouseOnly(false)}
      >
        {SCENES.map((item, i) => {
          const active = i === index;
          return (
            <div
              key={item.id}
              className="reel-scene"
              data-active={active}
              data-leaving={i === prev && !active}
              data-kind={item.kind}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${SCENES.length}`}
              aria-hidden={!active}
            >
              {item.kind === "fan" ? (
                <>
                  <div className="reel-bg" />
                  <div className="reel-fan">
                    <img src={item.images[0]} alt="" className="reel-card reel-card-l" loading="lazy" decoding="async" width={800} height={597} />
                    <img src={item.images[2]} alt="" className="reel-card reel-card-r" loading="lazy" decoding="async" width={800} height={597} />
                    <img src={item.images[1]} alt={item.alt} className="reel-card reel-card-c" loading="lazy" decoding="async" width={800} height={597} />
                  </div>
                </>
              ) : (
                <img
                  src={item.images[0]}
                  alt={item.alt}
                  className="reel-media"
                  data-pan={item.pan}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  width={1376}
                  height={768}
                />
              )}
              {item.kind === "collab" && (
                <div className="reel-cursors" aria-hidden="true">
                  <span className="reel-cursor reel-cursor-a"><CursorIcon /><span className="reel-tag">Designer</span></span>
                  <span className="reel-cursor reel-cursor-b"><CursorIcon /><span className="reel-tag">Client</span></span>
                </div>
              )}
            </div>
          );
        })}

        <div className="reel-scrim" aria-hidden="true" />

        <div className="reel-counter" aria-hidden="true">
          <span className="reel-counter-dot" />
          <span>SHOWREEL</span>
          <span className="reel-counter-num">{String(index + 1).padStart(2, "0")} / {String(SCENES.length).padStart(2, "0")}</span>
        </div>

        <div className="reel-caption" key={scene.id} aria-live={running ? "off" : "polite"}>
          <h3 className="reel-title">{scene.title}</h3>
          <p className="reel-text">{scene.text}</p>
        </div>

        <div className="reel-bar">
          <div className="reel-segs" role="group" aria-label="Choose a scene">
            {SCENES.map((item, i) => (
              <button
                key={item.id}
                type="button"
                className="reel-seg"
                aria-label={`Show scene ${i + 1}: ${item.title}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
              >
                <span className="reel-track">
                  <span
                    className="reel-fill"
                    data-state={i < index ? "done" : i === index ? "active" : "idle"}
                    onAnimationEnd={i === index && !reduced ? () => step(1) : undefined}
                  />
                </span>
              </button>
            ))}
          </div>
          <div className="reel-controls">
            <button type="button" className="reel-btn" aria-label="Previous scene" onClick={() => step(-1)}><ChevronLeft /></button>
            <button type="button" className="reel-btn" aria-label={playing ? "Pause showreel" : "Play showreel"} aria-pressed={!playing} onClick={() => setPlaying((value) => !value)}>
              {playing ? <Pause /> : <Play />}
            </button>
            <button type="button" className="reel-btn" aria-label="Next scene" onClick={() => step(1)}><ChevronRight /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
