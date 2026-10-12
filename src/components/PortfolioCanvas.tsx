import { useEffect, useId, useRef, useState, type ReactNode, type PointerEvent } from "react";
import { Hand, Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Connection = { id: string; path: string };

/** Presentation-only: project content and actions remain owned by the portfolio. */
export function PortfolioCanvas({ hubs, children, category }: { hubs: ReactNode; children: ReactNode; category: string }) {
  const viewport = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });
  const svgId = useId().replace(/:/g, "");
  // Phones/tablets & reduced-motion users: skip the travelling pulses (SMIL animation across the whole canvas).
  const [lite, setLite] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px), (hover: none), (prefers-reduced-motion: reduce)");
    const update = () => setLite(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Pause everything that animates while it is off-screen: card motion via data-visible,
  // the SVG pulses via pauseAnimations(), and the cursors via data-visible on the canvas root.
  // On desktop it also wires the mouse-follow 3D tilt + glare on each mockup.
  // Re-runs when the filter swaps the cards.
  useEffect(() => {
    const surface = world.current;
    const root = viewport.current;
    if (!surface || !root) return;
    const cleanups: Array<() => void> = [];

    if (typeof IntersectionObserver !== "undefined") {
      const cards = new IntersectionObserver((entries) => {
        entries.forEach((entry) => entry.target.setAttribute("data-visible", String(entry.isIntersecting)));
      }, { rootMargin: "80px 0px" });
      surface.querySelectorAll<HTMLElement>(".portfolio-card").forEach((card) => cards.observe(card));
      const canvas = new IntersectionObserver(([entry]) => {
        const visible = Boolean(entry?.isIntersecting);
        root.parentElement?.setAttribute("data-visible", String(visible));
        const graphic = svg.current;
        if (!graphic || typeof graphic.pauseAnimations !== "function") return;
        if (visible) graphic.unpauseAnimations(); else graphic.pauseAnimations();
      });
      canvas.observe(root);
      cleanups.push(() => { cards.disconnect(); canvas.disconnect(); });
    }

    if (!lite) {
      surface.querySelectorAll<HTMLElement>(".mockup-stage").forEach((stage) => {
        let frame = 0;
        const move = (event: globalThis.PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => {
            const rect = stage.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;
            stage.style.setProperty("--ry", `${((x - 0.5) * 10).toFixed(2)}deg`);
            stage.style.setProperty("--rx", `${((0.5 - y) * 8).toFixed(2)}deg`);
            stage.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
            stage.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
          });
        };
        const leave = () => {
          cancelAnimationFrame(frame);
          stage.style.setProperty("--rx", "0deg");
          stage.style.setProperty("--ry", "0deg");
        };
        stage.addEventListener("pointermove", move);
        stage.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          cancelAnimationFrame(frame);
          stage.removeEventListener("pointermove", move);
          stage.removeEventListener("pointerleave", leave);
        });
      });
    }
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [category, lite]);

  useEffect(() => {
    const surface = world.current;
    if (!surface) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = surface.getBoundingClientRect();
        const point = (element: HTMLElement) => {
          const rect = element.getBoundingClientRect();
          return { x: (rect.left - bounds.left) / zoom, y: (rect.top - bounds.top) / zoom, w: rect.width / zoom, h: rect.height / zoom };
        };
        const hubs = Array.from(surface.querySelectorAll<HTMLElement>("[data-service-node]"));
        const cards = Array.from(surface.querySelectorAll<HTMLElement>("[data-project-node]"));
        const paths: Connection[] = [];
        // Read every hub rect once (was recomputed for every card, forcing repeated layout).
        const hubPoints = new Map(hubs.map((node) => [node, point(node)] as const));
        const elbow = Math.max(...Array.from(hubPoints.values(), (p) => p.y + p.h)) + 24;
        cards.forEach((card, index) => {
          const hub = hubs.find((node) => node.dataset['serviceNode'] === card.dataset['projectNode']);
          if (!hub) return;
          const start = hubPoints.get(hub)!;
          const end = point(card);
          const x = start.x + start.w / 2;
          const y = start.y + start.h;
          const rail = end.x - 16;
          const targetY = end.y + 48;
          paths.push({ id: `project-${index}`, path: `M ${x} ${y} V ${elbow - 10} Q ${x} ${elbow} ${x + (rail > x ? 10 : -10)} ${elbow} H ${rail} V ${targetY - 10} Q ${rail} ${targetY} ${rail + 10} ${targetY} H ${end.x}` });
        });
        // Return the previous state object when nothing changed so React skips the re-render.
        setConnections((prev) => prev.length === paths.length && prev.every((c, i) => c.id === paths[i]!.id && c.path === paths[i]!.path) ? prev : paths);
        setDimensions((prev) => prev.width === surface.offsetWidth && prev.height === surface.offsetHeight ? prev : { width: surface.offsetWidth, height: surface.offsetHeight });
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(surface);
    surface.querySelectorAll<HTMLElement>("[data-project-node], [data-service-node]").forEach((node) => observer.observe(node));
    measure();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [category, zoom]);

  useEffect(() => {
    viewport.current?.scrollTo({ left: 0, top: 0 });
  }, [category]);

  const reset = () => {
    setZoom(1);
    viewport.current?.scrollTo({ left: 0, top: 0, behavior: "smooth" });
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!pan || event.pointerType === "touch" || !(event.target instanceof Element) || event.target.closest("button, a, input, select, textarea")) return;
    const container = viewport.current;
    if (!container) return;
    drag.current = { x: event.clientX, y: event.clientY, left: container.scrollLeft, top: container.scrollTop };
    container.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const container = viewport.current;
    if (!drag.current || !container) return;
    container.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
    container.scrollTop = drag.current.top - (event.clientY - drag.current.y);
  };

  return <div className="portfolio-canvas mt-8">
    <div className="canvas-toolbar flex flex-wrap items-center justify-between gap-3 border-y border-glass-line py-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><span className="canvas-status-dot" />Norum'sHub <span className="text-primary">/</span> Creative ecosystem</div>
      <div className="hidden items-center gap-1 sm:flex" role="group" aria-label="Canvas controls">
        <Button variant="ghost" size="icon" title="Pan canvas" aria-label="Pan canvas" aria-pressed={pan} onClick={() => setPan(!pan)} className={pan ? "bg-primary/15 text-primary" : "text-muted-foreground"}><Hand className="size-4" /></Button>
        <span className="mx-1 h-5 border-l border-glass-line" />
        <Button variant="ghost" size="icon" title="Zoom out" aria-label="Zoom out" disabled={zoom <= 0.7} onClick={() => setZoom((value) => Math.max(0.7, +(value - 0.1).toFixed(1)))}><Minus className="size-4" /></Button>
        <output className="w-12 text-center font-mono text-xs text-muted-foreground" aria-label="Canvas zoom">{Math.round(zoom * 100)}%</output>
        <Button variant="ghost" size="icon" title="Zoom in" aria-label="Zoom in" disabled={zoom >= 1.3} onClick={() => setZoom((value) => Math.min(1.3, +(value + 0.1).toFixed(1)))}><Plus className="size-4" /></Button>
        <Button variant="ghost" size="icon" title="Reset canvas" aria-label="Reset canvas" onClick={reset}><RotateCcw className="size-4" /></Button>
      </div>
    </div>
    <div ref={viewport} className={`canvas-viewport ${pan ? "canvas-pan" : ""}`} role="region" aria-label="Interactive project canvas" tabIndex={0} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      <div ref={world} className="canvas-world" style={{ zoom }}>
        <svg ref={svg} className="canvas-connections" width={dimensions.width} height={dimensions.height} aria-hidden="true">
          {connections.map(({ id, path }, index) => <g key={`${category}-${id}`}>
            <path d={path} className="connection-glow" />
            <path id={`${svgId}-${id}`} d={path} className="connection-line" />
            {!lite && <circle r="3" className="connection-pulse"><animateMotion dur={`${5 + index * 0.6}s`} begin={`${index * -0.8}s`} repeatCount="indefinite" path={path} /></circle>}
          </g>)}
        </svg>
        {!lite && <div className="canvas-cursors" aria-hidden="true">
          <span className="canvas-cursor canvas-cursor-a"><svg viewBox="0 0 16 20" width="16" height="20"><path d="M1.5 1.5 14 9.2l-5.3 1.2-2.6 5.6z" fill="currentColor" stroke="white" strokeWidth="1.2" strokeLinejoin="round" /></svg><span className="canvas-tag">Designer</span></span>
          <span className="canvas-cursor canvas-cursor-b"><svg viewBox="0 0 16 20" width="16" height="20"><path d="M1.5 1.5 14 9.2l-5.3 1.2-2.6 5.6z" fill="currentColor" stroke="white" strokeWidth="1.2" strokeLinejoin="round" /></svg><span className="canvas-tag">Client</span></span>
        </div>}
        <div className="canvas-hubs">{hubs}</div>
        <div key={category} className="canvas-projects" role="tabpanel" aria-label={`${category} projects`}>{children}</div>
      </div>
    </div>
    <div className="flex justify-between border-t border-glass-line py-3 font-mono text-[10px] text-muted-foreground"><span>CODE / DESIGN / IMPACT</span><span className="text-primary">{category.toUpperCase()}</span></div>
  </div>;
}