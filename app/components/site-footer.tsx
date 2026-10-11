import { Link } from "react-router";
import { RouteIcon } from "lucide-react";

import { footerNav, siteConfig } from "~/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-foreground/15 bg-secondary/60">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2">
          <Link
            to="/"
            className="flex items-center gap-2 font-heading font-semibold tracking-tight transition-colors hover:text-rust"
          >
            <RouteIcon className="size-5" aria-hidden />
            <span>{siteConfig.name}</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            {siteConfig.tagline}
          </p>
        </div>

        {footerNav.map((group) => (
          <nav key={group.heading} aria-label={group.heading}>
            <h2 className="font-heading text-xs font-semibold tracking-[0.12em] uppercase">
              {group.heading}
            </h2>
            <ul className="mt-3 space-y-2">
              {group.items.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-foreground/10 bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground">
          <span>
            © {year} {siteConfig.name}. Built for developers.
          </span>
          <span aria-hidden className="tracking-[0.12em] uppercase opacity-70">
            Drafting room · A-101
          </span>
        </div>
      </div>
    </footer>
  );
}
