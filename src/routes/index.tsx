import { createFileRoute } from "@tanstack/react-router";
import { NorumPortfolio } from "@/components/NorumPortfolio";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Norum'sHub | Web Development & Brand Design" },
      { name: "description", content: "Norum'sHub creates high-performance web apps, visual identities, graphics, and corporate documents for ambitious businesses." },
      { property: "og:title", content: "Norum'sHub | Programmer, Designer & Creative" },
      { property: "og:description", content: "Web development, UI/UX, branding, graphics, and corporate documents built to move ambitious businesses forward." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
// Structured data helps search engines show the business (name, services, contact) correctly.
// Static content only; "<" is escaped so the JSON can never close the script tag early.
const structuredData = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Norum'sHub",
  description: "Web development, UI/UX, branding, graphics, and corporate documents for ambitious businesses.",
  email: "maronnyirongo@gmail.com",
  telephone: "+260972601568",
  address: { "@type": "PostalAddress", addressCountry: "ZM" },
  sameAs: ["https://instagram.com/maronnorum"],
  makesOffer: ["Web & Software Development", "Brand & Logo Design", "Print & Digital Graphics", "Corporate Documents"].map((name) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name },
  })),
}).replace(/</g, "\\u003c");

function Index() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <NorumPortfolio />
    </>
  );
}
