/**
 * Central brand + navigation config. Kept in one place so the public shell,
 * SEO helpers, and structured data all agree on the site identity.
 */
export const siteConfig = {
  name: "DevAtlas",
  tagline: "Interactive developer roadmaps, domains, and projects",
  description:
    "DevAtlas is an open learning platform with interactive developer roadmaps, business-domain explainers, and hands-on project briefs.",
  url:
    (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ??
    "http://localhost:5173",
  locale: "en_US",
  twitter: "@devatlas",
  ogImage: "/og-image.png",
} as const;

export interface NavItem {
  label: string;
  to: string;
}

export const primaryNav: NavItem[] = [
  { label: "Roadmaps", to: "/roadmaps" },
  { label: "Business Domains", to: "/business-domains" },
  { label: "Projects", to: "/projects" },
];

export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Learn",
    items: [
      { label: "Roadmaps", to: "/roadmaps" },
      { label: "Business Domains", to: "/business-domains" },
      { label: "Projects", to: "/projects" },
    ],
  },
  {
    heading: "Discover",
    items: [
      { label: "Search", to: "/search" },
      { label: "All Topics", to: "/search?type=topic" },
    ],
  },
];
