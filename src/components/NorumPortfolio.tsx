import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Braces,
  Check,
  ChevronRight,
  Code2,
  Download,
  ExternalLink,
  FileText,
  Heart,
  Instagram,
  Layers3,
  Mail,
  Menu,
  MessageCircle,
  Palette,
  Phone,
  Quote,
  Rocket,
  Send,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { PortfolioCanvas } from "@/components/PortfolioCanvas";
import { ShowReel } from "@/components/ShowReel";
import { FloatingActions, ScrollProgress, useActiveSection } from "@/components/SiteExtras";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import mark from "@/assets/norumshub-mark.png";
import heroRender from "@/assets/norumshub-official-logo.jpg.asset.json";
import responsiveEditorial from "@/assets/norum-responsive-editorial.webp";
import multideviceSuite from "@/assets/norum-multidevice-suite.webp";
import wideDevices from "@/assets/norum-wide-devices.webp";
import darkShowcase from "@/assets/norum-dark-showcase.webp";
import cinematicWeb from "@/assets/norum-cinematic-web.webp";
import cleanBusiness from "@/assets/norum-clean-business.webp";
import businessCardShowcase from "@/assets/norum-business-card-showcase.webp";
import flyerShowcase from "@/assets/norum-flyer-showcase.webp";
import companyProfileShowcase from "@/assets/norum-company-profile-showcase.webp";

const nav = [["Services", "services"], ["Portfolio", "portfolio"], ["Work Process", "process"], ["Trust Wall", "reviews"], ["FAQ", "faq"], ["Contact", "contact"]] as const;
const spySections = ["showreel", "services", "portfolio", "process", "reviews", "faq", "contact"] as const;
const stats = [["09", "Featured projects"], ["04", "Core services"], ["24h", "Typical reply time"], ["1:1", "Direct collaboration"]] as const;
const tools = ["React", "Tailwind CSS", "Responsive Web", "UI/UX Design", "Brand Identity", "Logo Design", "Print & Social Graphics", "Company Profiles", "API Integration"] as const;
const faqs = [
  ["How do I start a project?", "Send your brief through the contact form, WhatsApp or email. I review your goals and reply with the next practical step, usually within 24 hours."],
  ["What happens after I send a brief?", "We clarify scope, audience and timeline, then you receive a transparent proposal with milestones and a formal agreement before any work begins."],
  ["Do I sign an agreement?", "Yes. Every project starts with a binding agreement that has signature space for both the creative and the client. The Service Guide & Agreement PDF in the Work Process section shows the template."],
  ["What can you build or design?", "Websites and web apps, logos and brand identities, business cards, flyers and posters, and corporate documents such as company profiles and proposals."],
  ["How long does a project take?", "It depends on scope. A single design takes less time than a full web app, so a clear timeline is agreed in the proposal and progress is shared at agreed checkpoints."],
  ["Will my website work on phones?", "Yes. Websites are built to be responsive, so they adapt cleanly from large desktop screens down to phones."],
] as const;
const services = [
  { icon: Code2, title: "Web & Software Development", text: "Full-stack web applications, landing pages, API integrations, and responsive React/Tailwind interfaces.", number: "01" },
  { icon: Palette, title: "Brand & Logo Design", text: "Custom logo design, brand guidelines, visual identity systems, and production-ready vector assets.", number: "02" },
  { icon: Layers3, title: "Print & Digital Graphics", text: "High-resolution business cards, flyers, event posters, and promotional materials that make an impact.", number: "03" },
  { icon: FileText, title: "Corporate Documents", text: "Professional company profiles, project proposals, and executive document layouts built for credibility.", number: "04" },
] as const;
const filters = ["All", "Web Apps", "Branding & Logos", "Business Cards & Flyers", "Company Profiles"] as const;
// `image` = small thumbnail bundled for the cards; `full` = larger copy in /public/work opened by the action button.
const projects = [
  { title: "Editorial Portfolio Experience", category: "Web Apps", desc: "A crisp, editorial portfolio concept that carries the Norum’sHub experience consistently from desktop to mobile.", tags: ["Responsive", "UI/UX", "Portfolio"], image: responsiveEditorial, full: "/work/norum-responsive-editorial.webp", action: "View Project", likes: 128, motion: "motion-device-rise" },
  { title: "Connected Brand Suite", category: "Company Profiles", desc: "A unified digital and corporate presentation designed across web, mobile, tablet, and a polished agency profile.", tags: ["Company Profile", "Web", "Mobile"], image: multideviceSuite, full: "/work/norum-multidevice-suite.webp", action: "View Project", likes: 116, motion: "motion-perspective-drift" },
  { title: "Digital Realities Campaign", category: "Branding & Logos", desc: "A spacious campaign visual pairing the Norum’sHub identity with a responsive service-led website experience.", tags: ["Campaign", "Brand System", "Web Design"], image: wideDevices, full: "/work/norum-wide-devices.webp", action: "View Design", likes: 104, motion: "motion-cinematic-pan" },
  { title: "Built Better Web Experience", category: "Web Apps", desc: "A premium dark-mode website concept focused on clear positioning, conversion actions, and responsive delivery.", tags: ["Landing Page", "Responsive", "Conversion"], image: darkShowcase, full: "/work/norum-dark-showcase.webp", action: "View Project", likes: 137, motion: "motion-screen-glide" },
  { title: "Norum’sHub Business Cards", category: "Business Cards & Flyers", desc: "A premium dark-and-light business card system with clear contact details and a confident professional finish.", tags: ["Business Cards", "Stationery", "Print"], image: businessCardShowcase, full: "/work/norum-business-card-showcase.webp", action: "View Design", likes: 98, motion: "motion-card-deal" },
  { title: "Creative Campaign Flyers", category: "Business Cards & Flyers", desc: "A coordinated flyer series promoting web development, branding, and creative design services.", tags: ["Flyers", "Campaign", "Print"], image: flyerShowcase, full: "/work/norum-flyer-showcase.webp", action: "View Design", likes: 103, motion: "motion-flyer-fan" },
  { title: "Code. Design. Impact.", category: "Business Cards & Flyers", desc: "A cinematic promotional composition that turns the Norum’sHub promise into a memorable campaign visual.", tags: ["Art Direction", "Campaign", "Digital"], image: cinematicWeb, full: "/work/norum-cinematic-web.webp", action: "View Design", likes: 91, motion: "motion-focus-pull" },
  { title: "Digital Solutions Overview", category: "Company Profiles", desc: "A clean service presentation communicating core Norum’sHub capabilities with clarity across desktop and mobile.", tags: ["Service Guide", "Layout", "Responsive"], image: cleanBusiness, full: "/work/norum-clean-business.webp", action: "View Project", likes: 109, motion: "motion-desk-float" },
  { title: "Norum’sHub Company Profile", category: "Company Profiles", desc: "A boardroom-ready corporate profile with a refined cover, structured service pages, and a polished editorial layout.", tags: ["Company Profile", "Editorial", "PDF"], image: companyProfileShowcase, full: "/work/norum-company-profile-showcase.webp", action: "View Design", likes: 121, motion: "motion-page-flip" },
] as const;
const processSteps = [
  ["01", "Discovery & Requirement Gathering", "We clarify your goals, audience, scope, timeline, and what success should look like."],
  ["02", "Proposal & Binding Agreement", "You receive a transparent proposal, milestones, terms, and a formal agreement before work begins."],
  ["03", "Design & Code Execution", "Ideas move into focused design and development, with progress shared at agreed checkpoints."],
  ["04", "Final Review & Launch", "We refine, test, secure approval, and hand over a polished result ready for the real world."],
] as const;
const reviews = [
  { name: "Chanda M.", role: "Operations Director", quote: "The process was clear from the first call. Our new platform feels faster, sharper, and far easier for the team to use." },
  { name: "Natasha K.", role: "Founder, Naya Collective", quote: "Norum’sHub turned a rough idea into an identity that finally feels like us. Professional, patient, and creatively precise." },
  { name: "Brian Z.", role: "Business Consultant", quote: "The company profile changed the quality of our client presentations immediately. Every detail felt deliberate and premium." },
] as const;

// Strip control characters (incl. CR/LF) so user input can never inject extra
// mail headers or fake lines into the mailto: subject/body.
const clean = (value: string) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
const singleLine = (value: string) => clean(value).replace(/[\r\n]+/g, " ");

const serviceTitles = services.map((service) => service.title) as [string, ...string[]];

const formSchema = z.object({
  name: z.string().transform(singleLine).pipe(z.string().trim().min(2).max(100)),
  email: z.string().transform(singleLine).pipe(z.string().trim().email().max(255)),
  phone: z
    .string()
    .transform(singleLine)
    .pipe(z.string().trim().min(7).max(30).regex(/^[+\d\s()-]+$/, "Invalid phone number")),
  // Must be one of the real options — the <select> value can be tampered with in devtools.
  service: z.enum(serviceTitles),
  budget: z.string().transform(singleLine).pipe(z.string().trim().min(1).max(80)),
  message: z.string().transform(clean).pipe(z.string().trim().min(15).max(1200)),
});

function scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }

export function NorumPortfolio() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [count, setCount] = useState(0);
  const active = useActiveSection(spySections);
  const visibleProjects = useMemo(() => projects.filter((project) => filter === "All" || project.category === filter), [filter]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(
      Array.from(new FormData(form).entries()).filter(([, value]) => typeof value === "string"),
    );
    const parsed = formSchema.safeParse(data);
    if (!parsed.success) { setStatus("Please complete every field with valid project details."); return; }
    const { name, email, phone, service, budget, message } = parsed.data;
    const subject = encodeURIComponent(`Project enquiry: ${service}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nBudget: ${budget}\n\nProject details:\n${message}`);
    setStatus("Your email app is opening with your project brief ready to send.");
    window.location.assign(`mailto:maronnyirongo@gmail.com?subject=${subject}&body=${body}`);
    form.reset();
    setCount(0);
  };

  return (
    <main className="relative overflow-hidden bg-background text-foreground">
      <a href="#top" className="sr-only rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70]">Skip to content</a>
      <ScrollProgress />
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 md:bg-background/80 md:backdrop-blur-xl">
        <div className="section-shell flex h-18 items-center justify-between gap-4">
          <a href="#top" aria-label="Norum'sHub home" className="flex shrink-0 items-center gap-3"><img src={mark} alt="Norum'sHub logo" className="h-9 w-auto" /><span className="font-display text-lg font-bold tracking-tight text-gradient">Norum'sHub</span></a>
          <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
            {nav.map(([label, id]) => <a key={id} href={`#${id}`} aria-current={active === id ? "true" : undefined} className="text-xs font-semibold text-muted-foreground transition-colors hover:text-primary aria-[current=true]:text-primary">{label}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="hero" className="hidden sm:inline-flex" onClick={() => scrollTo("contact")}>Get a Quote <ArrowRight /></Button>
            <Button variant="glass" size="icon" className="lg:hidden" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button>
          </div>
        </div>
        {menuOpen && <nav className="section-shell mb-4 grid gap-1 border-t border-border pt-3 lg:hidden">{nav.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} aria-current={active === id ? "true" : undefined} className="rounded-md px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground aria-[current=true]:bg-accent aria-[current=true]:text-primary">{label}</a>)}</nav>}
      </header>

      <section id="top" className="relative flex min-h-[92svh] items-end overflow-hidden pt-24">
        <img src={heroRender.url} alt="Norum'sHub 3D brand mark on a studio wall" fetchPriority="high" decoding="async" className="hero-zoom absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-background/20" />
        <div className="absolute inset-0 grid-lines opacity-20" />
        <div className="section-shell relative z-10 grid items-end gap-10 pb-16 pt-48 lg:grid-cols-[1fr_20rem] lg:pb-20">
          <div className="max-w-4xl animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold text-primary backdrop-blur-md"><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-primary" /></span>Available for New Projects & Freelance Deals</div>
            <h1 className="font-display text-4xl leading-[1.08] font-bold sm:text-6xl lg:text-7xl">Transforming Ideas into <span className="text-gradient">High-Performance Web Apps</span> & Striking Brand Identities.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">Full-stack programming, modern UI/UX design, and complete visual branding for ambitious businesses.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Button size="xl" variant="hero" onClick={() => scrollTo("portfolio")}>Explore Portfolio <ArrowRight /></Button><Button size="xl" variant="glass" onClick={() => scrollTo("contact")}>Start a Project <Sparkles /></Button></div>
          </div>
          <div className="hidden border-l border-border pl-6 lg:block"><p className="text-3xl font-bold text-foreground">Code. Design.<br/><span className="text-primary">Impact.</span></p><p className="mt-3 text-sm leading-6 text-muted-foreground">One creative partner from first idea to final delivery.</p></div>
        </div>
      </section>

      <section aria-label="Highlights" className="border-b border-border bg-surface/30">
        <div className="section-shell grid grid-cols-2 lg:grid-cols-4">
          {stats.map(([value, label]) => <div key={label} className="px-2 py-7 text-center lg:text-left"><p className="font-display text-3xl font-bold text-gradient sm:text-4xl">{value}</p><p className="mt-1 text-xs font-semibold text-muted-foreground">{label}</p></div>)}
        </div>
      </section>
      <div className="marquee border-b border-border py-4" aria-label="Skills and tools">
        <div className="marquee-track">
          {[0, 1].map((copy) => <ul key={copy} className="marquee-list" aria-hidden={copy === 1}>{tools.map((tool) => <li key={tool} className="marquee-item"><span className="marquee-dot" aria-hidden="true" />{tool}</li>)}</ul>)}
        </div>
      </div>

      <section id="showreel" className="pt-24">
        <div className="section-shell">
          <SectionHead kicker="SHOWREEL" title="See the work in motion." text="A quick tour of the websites, brand systems and print pieces behind the portfolio." />
          <div className="reveal mt-10"><ShowReel /></div>
        </div>
      </section>

      <section id="services" className="py-24">
        <div className="section-shell">
          <SectionHead kicker="WHAT I DO" title="Expertise built for ambitious ideas." text="Strategy, design, and development brought together under one dependable creative process." />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {services.map(({ icon: Icon, title, text, number }) => <div key={title} className="reveal h-full"><article className="cinematic-card group h-full rounded-lg p-7 sm:p-9"><div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon /></span><span className="font-mono text-xs text-muted-foreground">/{number}</span></div><h3 className="mt-8 font-display text-xl font-semibold">{title}</h3><p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{text}</p><ChevronRight className="mt-7 text-primary transition-transform group-hover:translate-x-1" /></article></div>)}
          </div>
        </div>
      </section>

      <section id="portfolio" className="border-y border-border bg-canvas py-24">
        <div className="section-shell">
          <SectionHead kicker="SELECTED WORK" title="Made to perform. Designed to be remembered." text="Explore selected digital products and visual systems across web, brand, print, and corporate communication." />
          <div className="mt-10 flex flex-wrap gap-2" role="tablist" aria-label="Portfolio categories">{filters.map((item) => <Button key={item} size="sm" variant={filter === item ? "hero" : "glass"} onClick={() => setFilter(item)} role="tab" aria-selected={filter === item}>{item}</Button>)}</div>
          <PortfolioCanvas category={filter} hubs={services.map(({ icon: Icon, title, number }, index) => <div key={title} data-service-node={filters[index + 1]} className="canvas-hub cinematic-card rounded-lg"><div className="flex items-center justify-between gap-2"><Icon className="size-5 text-primary" /><span className="font-mono text-[10px] text-muted-foreground">/{number}</span></div><h3 className="mt-4 text-sm font-bold leading-5">{title}</h3><span className="node-port" aria-hidden="true" /></div>)}>
            {visibleProjects.map((project) => <article key={project.title} data-project-node={project.category} className="portfolio-card cinematic-card group rounded-lg p-3"><span className="project-port" aria-hidden="true" /><div className={`mockup-stage ${project.motion} aspect-[4/3] overflow-hidden rounded-lg bg-muted`}><div className="mockup-frame"><img src={project.image} alt={`${project.title} project presentation`} loading="lazy" decoding="async" width={800} height={600} className="mockup-image h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div><span className="mockup-sheen" aria-hidden="true" /><span className="mockup-depth" aria-hidden="true" /></div><div className="px-3 pb-3 pt-5"><div className="flex items-center justify-between gap-4"><p className="text-xs font-bold text-primary">{project.category}</p><Button variant="ghost" size="sm" onClick={() => setLiked((current) => ({ ...current, [project.title]: !current[project.title] }))} aria-label={`Appreciate ${project.title}`} className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-primary"><Heart className={`size-4 transition-transform duration-300 ${liked[project.title] ? "scale-110 fill-primary text-primary" : ""}`} />{project.likes + (liked[project.title] ? 1 : 0)}</Button></div><h3 className="mt-3 font-display text-xl font-semibold">{project.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{project.desc}</p><div className="mt-5 flex flex-wrap gap-2">{project.tags.map((tag) => <span key={tag} className="rounded-sm border border-border bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">{tag}</span>)}</div><Button variant="glass" className="mt-6 w-full" onClick={() => window.open(project.full, "_blank", "noopener,noreferrer")}>{project.action} <ExternalLink /></Button></div></article>)}
          </PortfolioCanvas>
        </div>
      </section>

      <section id="process" className="py-24"><div className="section-shell"><SectionHead kicker="THE PROCESS" title="How we work together." text="A direct, transparent path from first conversation to finished work." /><div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1fr]"><div className="space-y-2">{processSteps.map(([number, title, text]) => <article key={number} className="reveal grid grid-cols-[3rem_1fr] gap-4 border-b border-border py-6 first:pt-0"><span className="font-mono text-sm font-bold text-primary">{number}</span><div><h3 className="font-display text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div></article>)}</div><aside className="glass-panel relative overflow-hidden rounded-lg p-8 sm:p-10"><div className="absolute right-0 top-0 h-36 w-36 bg-primary/10 blur-3xl" /><span className="flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground"><FileText /></span><p className="mt-8 text-xs font-bold text-primary">CLIENT RESOURCE</p><h3 className="mt-3 font-display text-2xl font-bold">Norum'sHub Service Guide & Agreement</h3><p className="mt-4 text-sm leading-6 text-muted-foreground">Review services, project terms, and a clear binding agreement template with dedicated Creative and Client signature spaces.</p><ul className="mt-6 space-y-3 text-sm">{["Service overview", "Project terms & responsibilities", "Dual-signature agreement block"].map((item) => <li key={item} className="flex items-center gap-3"><Check className="size-4 text-primary" />{item}</li>)}</ul><Button variant="hero" size="xl" className="mt-8 w-full" asChild><a href="/norumshub-service-guide-agreement.pdf" download>Download PDF <Download /></a></Button></aside></div></div></section>

      <section id="reviews" className="border-y border-border bg-surface/40 py-24"><div className="section-shell"><SectionHead kicker="TRUST WALL" title="Good work earns real confidence." text="Feedback from clients who trusted the process and saw their ideas become stronger, clearer, and more valuable." /><div className="mt-12 grid gap-4 lg:grid-cols-3">{reviews.map((review) => <article key={review.name} className="reveal glass-panel rounded-lg p-7"><div className="flex items-center justify-between"><div className="flex gap-1 text-primary">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-primary" />)}</div><Quote className="text-primary/40" /></div><blockquote className="mt-6 text-base leading-7 text-foreground">“{review.quote}”</blockquote><div className="mt-7 border-t border-border pt-5"><p className="font-semibold">{review.name}</p><p className="mt-1 text-xs text-muted-foreground">{review.role}</p><span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary"><BadgeCheck className="size-4" /> Verified Deal</span></div></article>)}</div></div></section>

      <section id="faq" className="py-24"><div className="section-shell"><SectionHead kicker="FAQ" title="Questions, answered." text="The essentials about starting a project, agreements, timelines and what you can expect." /><Accordion type="single" collapsible className="reveal mx-auto mt-12 max-w-3xl">{faqs.map(([question, answer], index) => <AccordionItem key={question} value={`faq-${index}`} className="border-border"><AccordionTrigger className="py-5 text-left text-base font-semibold">{question}</AccordionTrigger><AccordionContent className="leading-6 text-muted-foreground">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>

      <section id="contact" className="py-24"><div className="section-shell"><SectionHead kicker="LET'S BUILD" title="Ready to move your idea forward?" text="Share the essentials. I’ll reply with the next practical step for your website, brand, campaign, or document." /><div className="mt-12 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]"><aside className="reveal glass-panel rounded-lg p-7 sm:p-9"><h3 className="font-display text-xl font-semibold">Direct contact</h3><div className="mt-7 space-y-5"><ContactRow icon={Mail} label="Email" value="maronnyirongo@gmail.com" href="mailto:maronnyirongo@gmail.com" /><ContactRow icon={Phone} label="Phone / WhatsApp" value="0972601568 / 0763011947" href="tel:+260972601568" /><ContactRow icon={Instagram} label="Instagram" value="@maronnorum" href="https://instagram.com/maronnorum" /></div><div className="mt-8 grid gap-2"><Button variant="hero" asChild><a href="https://wa.me/260972601568?text=Hello%20Norum%27sHub%2C%20I%27d%20like%20to%20discuss%20a%20project." target="_blank" rel="noopener noreferrer"><MessageCircle /> Message on WhatsApp</a></Button><Button variant="glass" asChild><a href="mailto:maronnyirongo@gmail.com"><Mail /> Send Email</a></Button></div><div className="mt-8 rounded-md border border-primary/20 bg-primary/5 p-4"><p className="text-xs font-bold text-primary">USUALLY REPLIES WITHIN 24 HOURS</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Clear scope. Honest timelines. Professional communication.</p></div></aside><form onSubmit={submit} className="reveal glass-panel rounded-lg p-7 sm:p-9" noValidate><div className="grid gap-5 sm:grid-cols-2"><Field label="Name"><Input name="name" autoComplete="name" placeholder="Your name" maxLength={100} required /></Field><Field label="Email"><Input name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@company.com" maxLength={255} required /></Field><Field label="Phone Number"><Input name="phone" type="tel" autoComplete="tel" placeholder="Your contact number" maxLength={30} required /></Field><Field label="Service Needed"><select name="service" required defaultValue="" className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-base md:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"><option value="" disabled>Select a service</option>{services.map((service) => <option key={service.title}>{service.title}</option>)}</select></Field><Field label="Budget"><Input name="budget" placeholder="e.g. K5,000–K10,000" maxLength={80} required /></Field><div className="hidden sm:block" /><div className="sm:col-span-2"><Field label="Project Message"><Textarea name="message" placeholder="Tell me what you want to create, your goals, and ideal timeline." rows={6} minLength={15} maxLength={1200} required onChange={(event) => setCount(event.target.value.length)} /></Field><p className="mt-1.5 text-right font-mono text-[11px] text-muted-foreground" aria-hidden="true">{count}/1200</p></div></div><Button variant="hero" size="xl" className="mt-6 w-full" type="submit">Send Project Brief <Send /></Button>{status && <p role="status" className={`mt-4 text-sm ${status.startsWith("Please") ? "text-destructive" : "text-primary"}`}>{status}</p>}</form></div></div></section>

      <footer className="border-t border-border bg-surface py-10"><div className="section-shell flex flex-col items-center justify-between gap-6 md:flex-row"><a href="#top" aria-label="Norum'sHub home" className="flex items-center gap-3"><img src={mark} alt="Norum'sHub logo" className="h-11 w-auto" /><span className="font-display text-xl font-bold tracking-tight text-gradient">Norum'sHub</span></a><p className="text-center text-xs text-muted-foreground">© 2026 Norum'sHub. Built with purpose in Zambia.</p><div className="flex items-center gap-2"><Social href="https://instagram.com/maronnorum" label="Instagram"><Instagram /></Social><Social href="https://wa.me/260972601568" label="WhatsApp"><MessageCircle /></Social><Social href="mailto:maronnyirongo@gmail.com" label="Email"><Mail /></Social></div></div><div className="section-shell mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-border pt-6">{nav.map(([label,id]) => <a key={id} href={`#${id}`} className="text-xs text-muted-foreground hover:text-primary">{label}</a>)}</div></footer>
      <FloatingActions />
    </main>
  );
}

function SectionHead({ kicker, title, text }: { kicker: string; title: string; text: string }) { return <div className="reveal grid gap-5 lg:grid-cols-[1fr_0.7fr] lg:items-end"><div><p className="text-xs font-extrabold text-primary">{kicker}</p><h2 className="mt-4 max-w-3xl font-display text-3xl font-bold sm:text-5xl">{title}</h2></div><p className="max-w-xl text-sm leading-6 text-muted-foreground lg:justify-self-end">{text}</p></div>; }
function ContactRow({ icon: Icon, label, value, href }: { icon: typeof Mail; label: string; value: string; href: string }) { return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="group flex items-start gap-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="size-4" /></span><span><span className="block text-[11px] font-bold text-muted-foreground">{label}</span><span className="mt-1 block break-all text-sm font-semibold group-hover:text-primary">{value}</span></span></a>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="grid gap-2 text-xs font-semibold text-muted-foreground"><span>{label}</span>{children}</label>; }
function Social({ href, label, children }: { href: string; label: string; children: ReactNode }) { return <Button variant="glass" size="icon" asChild><a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" aria-label={label}>{children}</a></Button>; }