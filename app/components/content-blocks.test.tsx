import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ContentBlocks,
  buildToc,
  type TopicBlock,
} from "~/components/content-blocks";

function block(partial: Partial<TopicBlock> & { id: string }): TopicBlock {
  return {
    type: "MARKDOWN",
    title: null,
    body: null,
    language: null,
    data: null,
    order: 0,
    ...partial,
  };
}

describe("buildToc", () => {
  it("includes only blocks with a heading, in order", () => {
    const toc = buildToc([
      block({ id: "a", title: "Intro" }),
      block({ id: "b" }),
      block({ id: "c", title: "  Details  " }),
    ]);
    expect(toc).toEqual([
      { id: "block-a", title: "Intro" },
      { id: "block-c", title: "Details" },
    ]);
  });
});

describe("ContentBlocks", () => {
  it("renders markdown content through the sanitizer", () => {
    render(
      <ContentBlocks
        blocks={[block({ id: "md", body: "## Hello **world**" })]}
      />,
    );
    expect(screen.getByRole("heading", { name: /Hello/ })).toBeInTheDocument();
  });

  it("renders checklist items", () => {
    render(
      <ContentBlocks
        blocks={[
          block({
            id: "cl",
            title: "Checklist",
            type: "CHECKLIST",
            data: { items: [{ text: "Write a test" }, { text: "Ship it" }] },
          }),
        ]}
      />,
    );
    expect(screen.getByText("Write a test")).toBeInTheDocument();
    expect(screen.getByText("Ship it")).toBeInTheDocument();
  });

  it("renders FAQ questions and answers", () => {
    render(
      <ContentBlocks
        blocks={[
          block({
            id: "faq",
            type: "FAQ",
            data: {
              items: [{ question: "Why?", answer: "Because." }],
            },
          }),
        ]}
      />,
    );
    expect(screen.getByText("Why?")).toBeInTheDocument();
    expect(screen.getByText("Because.")).toBeInTheDocument();
  });

  it("renders a table with headers and rows", () => {
    render(
      <ContentBlocks
        blocks={[
          block({
            id: "tbl",
            type: "TABLE",
            data: {
              headers: ["Name", "Kind"],
              rows: [["Postgres", "Database"]],
            },
          }),
        ]}
      />,
    );
    expect(
      screen.getByRole("columnheader", { name: "Name" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Postgres" })).toBeInTheDocument();
  });

  it("renders external resource list links safely", () => {
    render(
      <ContentBlocks
        blocks={[
          block({
            id: "res",
            type: "RESOURCE_LIST",
            data: { items: [{ title: "MDN", url: "https://mdn.io" }] },
          }),
        ]}
      />,
    );
    const link = screen.getByRole("link", { name: /MDN/ });
    expect(link).toHaveAttribute("href", "https://mdn.io");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders code with its language", () => {
    render(
      <ContentBlocks
        blocks={[
          block({
            id: "code",
            type: "CODE",
            body: "const x = 1;",
            language: "ts",
          }),
        ]}
      />,
    );
    expect(screen.getByText("const x = 1;")).toBeInTheDocument();
    expect(screen.getByText("ts")).toBeInTheDocument();
  });

  it("shows an empty message when there are no blocks", () => {
    render(<ContentBlocks blocks={[]} />);
    expect(
      screen.getByText(/doesn’t have content blocks/i),
    ).toBeInTheDocument();
  });
});
