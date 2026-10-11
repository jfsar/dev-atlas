import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { CategoryFilter } from "~/components/category-filter";

const categories = [
  { slug: "frontend", name: "Frontend", count: 4 },
  { slug: "backend", name: "Backend", count: 3 },
];

function renderFilter(activeCategory: string | null) {
  return render(
    <MemoryRouter>
      <CategoryFilter
        basePath="/projects"
        categories={categories}
        activeCategory={activeCategory}
      />
    </MemoryRouter>,
  );
}

describe("CategoryFilter", () => {
  it("renders an All link plus one link per category", () => {
    renderFilter(null);
    expect(screen.getByRole("link", { name: "All" })).toHaveAttribute(
      "href",
      "/projects",
    );
    expect(screen.getByRole("link", { name: /Frontend/ })).toHaveAttribute(
      "href",
      "/projects?category=frontend",
    );
  });

  it("links the active category to its filter query", () => {
    renderFilter("backend");
    expect(screen.getByRole("link", { name: /Backend/ })).toHaveAttribute(
      "href",
      "/projects?category=backend",
    );
    expect(
      screen.getByRole("navigation", { name: /filter by category/i }),
    ).toBeInTheDocument();
  });

  it("renders nothing when there are no categories", () => {
    const { container } = render(
      <MemoryRouter>
        <CategoryFilter basePath="/projects" categories={[]} />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
