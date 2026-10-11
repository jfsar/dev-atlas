import { useState } from "react";
import { Link, NavLink } from "react-router";
import { MenuIcon, RouteIcon, SearchIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { primaryNav, siteConfig } from "~/lib/site";
import { cn } from "~/lib/utils";

function navLinkClasses({ isActive }: { isActive: boolean }) {
  return cn(
    "relative rounded-md px-3 py-1.5 text-xs font-medium tracking-[0.12em] uppercase transition-all",
    "hover:bg-secondary/70",
    isActive
      ? "text-foreground after:absolute after:inset-x-3 after:-bottom-0.5 after:h-px after:bg-foreground"
      : "text-muted-foreground hover:text-foreground",
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/15 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4">
        <Link
          to="/"
          className="mr-2 flex items-center gap-2 font-heading text-base font-semibold tracking-tight transition-colors hover:text-rust"
        >
          <RouteIcon className="size-5" aria-hidden />
          <span>{siteConfig.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {primaryNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClasses}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link to="/search">
              <SearchIcon aria-hidden />
              <span className="hidden sm:inline">Search</span>
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                aria-label="Open navigation menu"
              >
                <MenuIcon aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" aria-describedby={undefined}>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
                {primaryNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(navLinkClasses({ isActive }), "px-3 py-2 text-base")
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <NavLink
                  to="/search"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(navLinkClasses({ isActive }), "px-3 py-2 text-base")
                  }
                >
                  Search
                </NavLink>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
