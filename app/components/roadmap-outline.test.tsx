import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { RoadmapOutline } from "~/components/roadmap-outline";
import {
  groupNodesBySection,
  type GraphNodeInput,
  type GraphSectionInput,
} from "~/lib/roadmap-graph";

const sections: GraphSectionInput[] = [
  { id: "s1", title: "Foundations", color: "#333333", order: 0 },
];

const nodes: GraphNodeInput[] = [
  {
    id: "n1",
    title: "HTML",
    summary: "Structure of the web.",
    x: 0,
    y: 0,
    required: true,
    order: 0,
    sectionId: "s1",
    difficulty: "BEGINNER",
    estimatedMinutes: 90,
    topic: { slug: "html", title: "HTML" },
  },
  {
    id: "n2",
    title: "Accessibility",
    x: 0,
    y: 140,
    required: false,
    order: 1,
    sectionId: "s1",
    topic: { slug: "accessibility", title: "Accessibility" },
  },
];

function renderOutline() {
  const groups = groupNodesBySection(sections, nodes);
  return render(
    <MemoryRouter>
      <RoadmapOutline groups={groups} />
    </MemoryRouter>,
  );
}

describe("RoadmapOutline", () => {
  it("groups nodes under section headings", () => {
    renderOutline();
    expect(
      screen.getByRole("heading", { name: /Foundations/ }),
    ).toBeInTheDocument();
  });

  it("links each topic node to its topic page", () => {
    renderOutline();
    expect(screen.getByRole("link", { name: /HTML/ })).toHaveAttribute(
      "href",
      "/topics/html",
    );
  });

  it("marks optional nodes without relying on color alone", () => {
    renderOutline();
    expect(screen.getByText("Optional")).toBeInTheDocument();
  });

  it("shows an empty message when there are no nodes", () => {
    render(
      <MemoryRouter>
        <RoadmapOutline groups={[]} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/no nodes yet/i)).toBeInTheDocument();
  });
});
