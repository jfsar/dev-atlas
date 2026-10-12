import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Markdown } from "~/components/markdown";

describe("Markdown", () => {
  it("renders common markdown", () => {
    render(<Markdown content={"# Title\n\nSome **bold** text."} />);
    expect(
      screen.getByRole("heading", { name: "Title", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("bold")).toBeInTheDocument();
  });

  it("sanitizes dangerous markup", () => {
    const { container } = render(
      <Markdown content={"Hello <script>window.__x = 1</script>"} />,
    );
    expect(container.querySelector("script")).toBeNull();
  });

  it("opens external links safely", () => {
    render(<Markdown content={"[Docs](https://example.com)"} />);
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("keeps internal links same-tab", () => {
    render(<Markdown content={"[Home](/roadmaps)"} />);
    const link = screen.getByRole("link", { name: "Home" });
    expect(link).not.toHaveAttribute("target");
  });

  it("does not leak react-markdown's node prop onto the anchor", () => {
    render(<Markdown content={"[Docs](https://example.com)"} />);
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).not.toHaveAttribute("node");
  });
});
