import type { SeedCategory } from "../types";

export const categories: SeedCategory[] = [
  {
    slug: "fundamentals",
    name: "Fundamentals",
    description: "Core concepts every developer needs regardless of stack.",
    order: 1,
  },
  {
    slug: "languages",
    name: "Languages",
    description: "Programming languages and their ecosystems.",
    order: 2,
  },
  {
    slug: "frontend",
    name: "Frontend",
    description: "Browser-side interfaces, styling, and user experience.",
    order: 3,
  },
  {
    slug: "backend",
    name: "Backend",
    description: "Servers, APIs, data persistence, and application logic.",
    order: 4,
  },
  {
    slug: "devops",
    name: "DevOps",
    description: "Delivery, infrastructure, containers, and operations.",
    order: 5,
  },
  {
    slug: "testing",
    name: "Testing & Quality",
    description: "Test strategy, automation, and quality engineering.",
    order: 6,
  },
  {
    slug: "architecture",
    name: "Architecture",
    description: "System design, patterns, and structural decisions.",
    order: 7,
  },
  {
    slug: "business",
    name: "Business & Domains",
    description: "Business processes and domain knowledge for software teams.",
    order: 8,
  },
  {
    slug: "security",
    name: "Security",
    description: "Application security, threats, and defensive practices.",
    order: 9,
  },
];
