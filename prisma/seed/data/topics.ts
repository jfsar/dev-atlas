import type { SeedTopic } from "../types";

export const topics: SeedTopic[] = [
  {
    slug: "programming-fundamentals",
    title: "Programming Fundamentals",
    summary:
      "Covers core logic concepts like variables, control flow, and problem decomposition. These building blocks apply across any language or platform.",
    difficulty: "BEGINNER",
    estimatedMinutes: 120,
    status: "PUBLISHED",
    categories: ["fundamentals"],
    resources: [
      { url: "https://www.theodinproject.com/", note: "Odin Project" },
      { url: "https://www.freecodecamp.org/learn/", note: "freeCodeCamp" },
    ],
    related: [
      "command-line",
      "version-control-git",
      "debugging",
      "http-and-web",
    ],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Programming is about breaking real problems into precise steps a machine can follow. Focus on clarity and predictable outcomes over clever tricks.",
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Solve tiny problems repeatedly rather than reading theory in bulk. Small, consistent practice builds durable intuition.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Understand variables and data types" },
            { text: "Use loops and conditionals correctly" },
            { text: "Write simple functions with clear inputs/outputs" },
            { text: "Trace code mentally with sample values" },
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "Should I learn syntax or logic first?",
              answer:
                "Learn just enough syntax to practice logic. Logic transfers; syntax is easy to look up.",
            },
            {
              question: "How much should I code daily?",
              answer:
                "Even 20 focused minutes daily beats sporadic long sessions for retention.",
            },
          ],
        },
      },
      {
        type: "RESOURCE_LIST",
        data: {
          items: [
            { title: "MDN Web Docs", url: "https://developer.mozilla.org/" },
            {
              title: "The Odin Project",
              url: "https://www.theodinproject.com/",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "command-line",
    title: "Command Line",
    summary:
      "Teaches efficient shell workflows for navigating files, running tools, and automating small tasks. Mastering the CLI speeds up every development workflow.",
    difficulty: "BEGINNER",
    estimatedMinutes: 90,
    status: "PUBLISHED",
    categories: ["fundamentals"],
    resources: [
      { url: "https://developer.mozilla.org/", note: "CLI context" },
      { url: "https://git-scm.com/book/en/v2", note: "Git workflows" },
    ],
    related: [
      "programming-fundamentals",
      "version-control-git",
      "linux-basics",
      "docker",
    ],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Introduction",
        body: "The command line gives direct control over your filesystem and tools. Precise commands help you avoid repetitive GUI actions and script repeatable tasks.",
      },
      {
        type: "CODE",
        language: "bash",
        body: `# Navigate and inspect
pwd
ls -la
cd ~/projects
find . -name "*.ts" | head -5
mkdir -p new-folder && touch new-folder/README.md`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Tab completion and history are your best friends. Learn them early to avoid typos and save keystrokes.",
      },
      {
        type: "TABLE",
        data: {
          headers: ["Command", "Purpose", "Example"],
          rows: [
            ["cd", "Change directory", "cd app/src"],
            ["ls", "List files", "ls -la"],
            ["cp/mv/rm", "Manage files", "cp file.ts backup.ts"],
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "Which shell should I use?",
              answer:
                "Use bash or zsh on Unix-like systems. PowerShell is common on Windows for cross-tool workflows.",
            },
            {
              question: "Is it safe to rm -rf?",
              answer:
                "Only when you are certain of the path. Always double-check and avoid running as root unnecessarily.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "version-control-git",
    title: "Version Control with Git",
    summary:
      "Covers commits, branches, merges, and collaboration workflows. Git preserves history and enables safe, parallel development across teams.",
    difficulty: "BEGINNER",
    estimatedMinutes: 120,
    status: "PUBLISHED",
    categories: ["fundamentals", "devops"],
    resources: [
      { url: "https://git-scm.com/book/en/v2", note: "Pro Git Book" },
      { url: "https://developer.mozilla.org/", note: "General reference" },
    ],
    related: [
      "command-line",
      "programming-fundamentals",
      "ci-cd",
      "automated-testing",
    ],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Version control tracks changes over time and lets you experiment safely. Branches isolate work while history remains traceable and reversible.",
      },
      {
        type: "CODE",
        language: "bash",
        body: `# Basic Git workflow
git init
git add .
git commit -m "Initial commit"
git branch feature/login
git checkout feature/login
git push -u origin feature/login`,
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Understand staging area and commits" },
            { text: "Use meaningful commit messages" },
            { text: "Resolve simple merge conflicts" },
            { text: "Work with remotes and pull requests" },
          ],
        },
      },
      {
        type: "CALLOUT",
        title: "Common mistake",
        body: "Committing secrets or large binaries is hard to undo. Use .gitignore and secret managers instead.",
      },
      {
        type: "TABLE",
        data: {
          headers: ["Concept", "Purpose", "When to use"],
          rows: [
            ["Branch", "Isolate changes", "New features or fixes"],
            ["Rebase", "Linear history", "Local cleanup before sharing"],
            ["Tag", "Mark releases", "Stable version snapshots"],
          ],
        },
      },
    ],
  },
  {
    slug: "http-and-web",
    title: "HTTP & the Web",
    summary:
      "Explains how browsers, servers, and protocols interact to deliver web content. Understanding requests, responses, and status codes is essential for building reliable web apps.",
    difficulty: "BEGINNER",
    estimatedMinutes: 120,
    status: "PUBLISHED",
    categories: ["fundamentals", "frontend"],
    resources: [
      { url: "https://developer.mozilla.org/", note: "MDN Web Docs" },
      { url: "https://web.dev/learn/", note: "web.dev Learn" },
    ],
    related: ["html", "css", "javascript", "rest-apis"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "HTTP is the request-response protocol powering the web. Clients send requests to servers, which return structured responses with headers, bodies, and status codes.",
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Use browser DevTools Network tab to inspect real requests. It's the fastest way to learn headers, caching, and timing.",
      },
      {
        type: "TABLE",
        data: {
          headers: ["Method", "Idempotent", "Use case"],
          rows: [
            ["GET", "Yes", "Fetch resources"],
            ["POST", "No", "Create new resource"],
            ["PUT/PATCH", "Usually", "Update resources"],
            ["DELETE", "Yes", "Remove resources"],
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "What is CORS?",
              answer:
                "Cross-Origin Resource Sharing controls which origins can read responses. It's enforced by browsers for security.",
            },
            {
              question: "How does caching work?",
              answer:
                "Cache-Control and ETag headers let clients reuse responses to reduce latency and bandwidth.",
            },
          ],
        },
      },
      {
        type: "RESOURCE_LIST",
        data: {
          items: [
            { title: "MDN Web Docs", url: "https://developer.mozilla.org/" },
            { title: "web.dev Learn", url: "https://web.dev/learn/" },
          ],
        },
      },
    ],
  },
  {
    slug: "data-structures-algorithms",
    title: "Data Structures & Algorithms",
    summary:
      "Focuses on organizing data and choosing efficient algorithms for common tasks. Strong fundamentals here improve performance and problem-solving skills.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 240,
    status: "PUBLISHED",
    categories: ["fundamentals"],
    resources: [
      {
        url: "https://www.grc.nasa.gov/www/K-12/airplane/algs.html",
        note: "NASA reference",
      },
      {
        url: "https://github.com/donnemartin/system-design-primer",
        note: "System Design Primer",
      },
    ],
    related: [
      "programming-fundamentals",
      "javascript",
      "typescript",
      "system-design",
    ],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Data structures define how data is stored and accessed. Algorithms define how to transform it efficiently. Together they let you reason about time and space trade-offs.",
      },
      {
        type: "TABLE",
        data: {
          headers: ["Structure", "Strength", "Weakness"],
          rows: [
            ["Array", "O(1) access", "Fixed size shifts"],
            ["Linked List", "O(1) insert/delete", "O(n) access"],
            ["Hash Map", "O(1) average lookup", "Unordered"],
            ["Tree", "Hierarchical queries", "Balancing complexity"],
          ],
        },
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Analyze complexity with Big O before optimizing. Premature optimization often creates unnecessary complexity.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Know arrays, stacks, queues, maps, sets" },
            { text: "Understand recursion and iteration trade-offs" },
            { text: "Practice searching and sorting" },
            { text: "Reason about space/time complexity" },
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "Do I need to memorize every algorithm?",
              answer:
                "Focus on recognizing patterns. Knowing when to use each structure is more important than rote implementation.",
            },
            {
              question: "How do I practice effectively?",
              answer:
                "Solve small, targeted problems and review solutions to learn alternative approaches.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "debugging",
    title: "Debugging",
    summary:
      "Teaches systematic approaches to finding and fixing bugs. Using logs, breakpoints, and reproduction steps reduces time spent guessing.",
    difficulty: "BEGINNER",
    estimatedMinutes: 90,
    status: "ARCHIVED",
    categories: ["fundamentals"],
    resources: [
      { url: "https://developer.mozilla.org/", note: "MDN Web Docs" },
      { url: "https://web.dev/learn/", note: "web.dev Learn" },
    ],
    related: [
      "programming-fundamentals",
      "javascript",
      "automated-testing",
      "monitoring-observability",
    ],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Debugging is a scientific process: reproduce, isolate, hypothesize, test, and verify. Good debugging prevents regressions and clarifies assumptions.",
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Write a minimal reproduction before diving into code. It saves time and helps others verify fixes.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Reproduce the bug consistently" },
            { text: "Read error messages carefully" },
            { text: "Use breakpoints and step-through debugging" },
            { text: "Add targeted logging without overlogging" },
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "When should I add logs vs breakpoints?",
              answer:
                "Use breakpoints for local inspection. Use logs for async flows and production-safe diagnostics.",
            },
            {
              question: "How do I avoid rubber-ducking aimlessly?",
              answer:
                "Form a testable hypothesis and change one thing at a time to see clear results.",
            },
          ],
        },
      },
      {
        type: "RESOURCE_LIST",
        data: {
          items: [
            { title: "MDN Web Docs", url: "https://developer.mozilla.org/" },
            { title: "web.dev Learn", url: "https://web.dev/learn/" },
          ],
        },
      },
    ],
  },
  {
    slug: "html",
    title: "HTML",
    summary:
      "Covers semantic markup, forms, accessibility, and document structure. Proper HTML improves usability, SEO, and compatibility across devices.",
    difficulty: "BEGINNER",
    estimatedMinutes: 120,
    status: "PUBLISHED",
    categories: ["frontend"],
    resources: [
      { url: "https://developer.mozilla.org/", note: "MDN Web Docs" },
      { url: "https://web.dev/learn/", note: "web.dev Learn" },
    ],
    related: ["css", "javascript", "accessibility", "http-and-web"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "HTML defines the meaning and structure of content. Using semantic elements helps assistive tech understand pages and improves long-term maintainability.",
      },
      {
        type: "CODE",
        language: "html",
        body: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Example</title>
  </head>
  <body>
    <main>
      <h1>Page Title</h1>
      <p>Content goes here.</p>
    </main>
  </body>
</html>`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Prefer semantic elements like header, nav, main, section over generic divs. They convey intent with no extra cost.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Use valid document structure" },
            { text: "Write accessible forms with labels" },
            { text: "Include alt text for images" },
            { text: "Ensure keyboard-navigable content" },
          ],
        },
      },
      {
        type: "TABLE",
        data: {
          headers: ["Element", "Purpose", "Notes"],
          rows: [
            ["<header>", "Intro/navigation", "Top of page/section"],
            ["<main>", "Primary content", "One per page"],
            ["<article>", "Self-contained", "Blog posts, news"],
            ["<footer>", "Metadata/links", "Bottom content"],
          ],
        },
      },
    ],
  },
  {
    slug: "css",
    title: "CSS",
    summary:
      "Covers layout, styling, responsive design, and modern CSS features. Well-structured styles create consistent, maintainable user interfaces.",
    difficulty: "BEGINNER",
    estimatedMinutes: 120,
    status: "PUBLISHED",
    categories: ["frontend"],
    resources: [
      { url: "https://developer.mozilla.org/", note: "MDN Web Docs" },
      { url: "https://web.dev/learn/", note: "web.dev Learn" },
    ],
    related: ["html", "javascript", "web-performance", "accessibility"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "CSS separates presentation from structure. Modern features like flexbox, grid, and custom properties help build responsive layouts with less code.",
      },
      {
        type: "CODE",
        language: "css",
        body: `/* Flexbox centering */
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
}

.card {
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Use mobile-first breakpoints and relative units (rem, %) for scalable, accessible layouts.",
      },
      {
        type: "TABLE",
        data: {
          headers: ["Feature", "Use case", "Notes"],
          rows: [
            ["Flexbox", "1D layouts", "Alignment and distribution"],
            ["Grid", "2D layouts", "Rows and columns together"],
            ["Custom props", "Theming", "Cascade and inheritance"],
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "When should I use Grid vs Flexbox?",
              answer:
                "Use Flexbox for linear flows. Use Grid when you need precise 2D control of rows and columns.",
            },
            {
              question: "How do I avoid specificity wars?",
              answer:
                "Favor class selectors, use consistent naming, and avoid !important unless absolutely necessary.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "javascript",
    title: "JavaScript",
    summary:
      "Covers language fundamentals, async patterns, DOM manipulation, and modern ES features. JavaScript powers interactive behavior across the web.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 240,
    status: "PUBLISHED",
    categories: ["frontend", "languages"],
    resources: [
      { url: "https://developer.mozilla.org/", note: "MDN Web Docs" },
      { url: "https://web.dev/learn/", note: "web.dev Learn" },
    ],
    related: ["typescript", "react", "http-and-web", "nodejs"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "JavaScript is event-driven and single-threaded with async primitives. Understanding closures, promises, and modules helps write predictable, testable code.",
      },
      {
        type: "CODE",
        language: "js",
        body: `// Async example
async function fetchData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Request failed");
    return await res.json();
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}

// Module usage
export { fetchData };`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Prefer const/let, strict equality (===), and early returns to keep code readable and safe.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Master scope, closures, and hoisting" },
            { text: "Handle async with Promises/async-await" },
            { text: "Manipulate DOM safely" },
            { text: "Use ES modules and modern syntax" },
          ],
        },
      },
      {
        type: "TABLE",
        data: {
          headers: ["Feature", "Use case", "Notes"],
          rows: [
            ["Closure", "Data encapsulation", "Preserves lexical scope"],
            ["Promise", "Async values", "Chainable, composable"],
            ["Event loop", "Concurrency model", "Micro/macro task queues"],
          ],
        },
      },
    ],
  },
  {
    slug: "typescript",
    title: "TypeScript",
    summary:
      "Adds static types to JavaScript for safer refactoring and clearer contracts. TypeScript catches errors at compile time without sacrificing runtime flexibility.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 180,
    status: "PUBLISHED",
    categories: ["frontend", "languages"],
    resources: [
      {
        url: "https://www.typescriptlang.org/docs/handbook/intro.html",
        note: "TypeScript Handbook",
      },
      { url: "https://developer.mozilla.org/", note: "MDN Web Docs" },
    ],
    related: ["javascript", "react", "nodejs", "rest-apis"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Types act as documentation and guardrails. Focus on defining precise interfaces for data boundaries like API responses and component props.",
      },
      {
        type: "CODE",
        language: "ts",
        body: `// Type-safe function
interface User {
  id: string;
  name: string;
  email: string;
}

async function getUser(id: string): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

// Union types
type Status = "idle" | "loading" | "error";
let state: Status = "idle";`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Let TypeScript infer types where obvious. Write explicit types at API boundaries to catch integration errors.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Understand primitives, unions, intersections" },
            { text: "Use interfaces vs types appropriately" },
            { text: "Leverage generics for reusable logic" },
            { text: "Configure strict mode for safety" },
          ],
        },
      },
      {
        type: "TABLE",
        data: {
          headers: ["Feature", "Use case", "Notes"],
          rows: [
            ["Union", "Narrowed values", "Discriminated unions powerful"],
            ["Generic", "Type-safe utilities", "Reusable without losing types"],
            ["Utility types", "Transform types", "Partial, Pick, Omit, etc."],
          ],
        },
      },
    ],
  },
  {
    slug: "react",
    title: "React",
    summary:
      "Covers components, hooks, state, and rendering patterns for building declarative UIs. React emphasizes composition and predictable data flow.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 240,
    status: "PUBLISHED",
    categories: ["frontend"],
    resources: [
      { url: "https://react.dev/", note: "React docs" },
      { url: "https://web.dev/learn/", note: "web.dev Learn" },
    ],
    related: ["javascript", "typescript", "state-management", "accessibility"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "React lets you build UIs as a function of state. Composition, unidirectional data flow, and hooks help manage complexity in interactive apps.",
      },
      {
        type: "CODE",
        language: "tsx",
        body: `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}

export default Counter;`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Keep components small and pure where possible. Lift state up only when multiple components need it.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Understand JSX and component composition" },
            { text: "Use useState, useEffect, useContext effectively" },
            { text: "Handle events and forms" },
            { text: "Optimize with memoization when needed" },
          ],
        },
      },
      {
        type: "TABLE",
        data: {
          headers: ["Hook", "Purpose", "Notes"],
          rows: [
            ["useState", "Local state", "Triggers re-render on update"],
            ["useEffect", "Side effects", "Clean up subscriptions"],
            ["useContext", "Avoid prop drilling", "Good for global state"],
          ],
        },
      },
    ],
  },
  {
    slug: "state-management",
    title: "State Management",
    summary:
      "Explores patterns for sharing and synchronizing state across components. Choosing the right approach prevents prop drilling and inconsistent UI.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 150,
    status: "PUBLISHED",
    categories: ["frontend"],
    resources: [
      { url: "https://react.dev/", note: "React docs" },
      { url: "https://developer.mozilla.org/", note: "MDN Web Docs" },
    ],
    related: ["react", "javascript", "rest-apis", "graphql"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "State can be local, server, or global. Each type has trade-offs. Start simple (useState/context) and scale only when complexity demands it.",
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Treat server state separately from UI state. Caching, retries, and stale-while-revalidate behaviors matter for data freshness.",
      },
      {
        type: "TABLE",
        data: {
          headers: ["Approach", "Scope", "When to use"],
          rows: [
            ["useState", "Component", "Local UI state"],
            ["Context", "Subtree", "Theme, auth, small global state"],
            ["URL state", "Global", "Filters, pagination, shareable views"],
          ],
        },
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Distinguish UI vs server state" },
            { text: "Avoid duplicating remote data" },
            { text: "Normalize complex state" },
            { text: "Handle loading/error states" },
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "When is Context enough?",
              answer:
                "For low-frequency updates and small trees. High-frequency updates can cause unnecessary re-renders.",
            },
            {
              question: "Should I sync state to URL?",
              answer:
                "Yes for filterable/list views. It improves shareability, back/forward navigation, and persistence.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "accessibility",
    title: "Accessibility",
    summary:
      "Covers inclusive design practices to make apps usable by everyone. Following accessibility guidelines improves UX and meets legal/ethical obligations.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 120,
    status: "PUBLISHED",
    categories: ["frontend"],
    resources: [
      { url: "https://web.dev/learn/", note: "web.dev Learn" },
      { url: "https://developer.mozilla.org/", note: "MDN Web Docs" },
    ],
    related: ["html", "css", "react", "web-performance"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Accessibility means designing for diverse abilities and input methods. Semantic HTML, keyboard support, and ARIA are tools—not substitutes for good structure.",
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Test with keyboard navigation and a screen reader early. Catching issues late is expensive and often unnecessary.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Use semantic elements and landmarks" },
            { text: "Ensure sufficient color contrast" },
            { text: "Support full keyboard navigation" },
            { text: "Provide meaningful alt text and labels" },
          ],
        },
      },
      {
        type: "TABLE",
        data: {
          headers: ["Principle", "Goal", "Example"],
          rows: [
            ["Perceivable", "Info available to senses", "Alt text, captions"],
            ["Operable", "All actions via keyboard", "Focus management"],
            ["Understandable", "Clear UI/feedback", "Error messages"],
            ["Robust", "Works across tech", "Valid HTML/ARIA"],
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "When should I use ARIA?",
              answer:
                "Only when native semantics are insufficient. Prefer semantic HTML first.",
            },
            {
              question: "How much contrast is enough?",
              answer:
                "Follow WCAG guidelines for text and UI components based on size and weight.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "web-performance",
    title: "Web Performance",
    summary:
      "Teaches techniques to reduce load times and improve responsiveness. Optimizing assets, rendering, and data fetching creates faster, smoother experiences.",
    difficulty: "ADVANCED",
    estimatedMinutes: 180,
    status: "PUBLISHED",
    categories: ["frontend", "architecture"],
    resources: [
      { url: "https://web.dev/learn/", note: "web.dev Learn" },
      { url: "https://developer.mozilla.org/", note: "MDN Web Docs" },
    ],
    related: ["css", "javascript", "react", "http-and-web"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Performance is about perceived speed and resource efficiency. Measure first with real metrics like LCP, FID, and CLS before making changes.",
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Optimize the critical rendering path. Deliver minimal CSS/JS needed for above-the-fold content first.",
      },
      {
        type: "TABLE",
        data: {
          headers: ["Metric", "What it measures", "Goal"],
          rows: [
            ["LCP", "Largest contentful paint", "Fast visual load"],
            ["FID", "First input delay", "Responsive interaction"],
            ["CLS", "Cumulative layout shift", "Visual stability"],
          ],
        },
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Compress and lazy-load images" },
            { text: "Minify and code-split bundles" },
            { text: "Use effective caching headers" },
            { text: "Preload critical resources" },
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "Should I optimize for 90th percentile?",
              answer:
                "Yes. Focus on real-user conditions across devices and networks, not just lab scores.",
            },
            {
              question: "Is code splitting always worth it?",
              answer:
                "Usually for larger apps. Measure impact on TTI and bundle size to be sure.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "php",
    title: "PHP",
    summary:
      "Covers PHP syntax, request handling, and server-side logic. PHP remains widely used for building dynamic, database-driven web applications.",
    difficulty: "BEGINNER",
    estimatedMinutes: 180,
    status: "PUBLISHED",
    categories: ["languages", "backend"],
    resources: [
      { url: "https://www.php.net/docs.php", note: "PHP Documentation" },
      { url: "https://laravel.com/docs", note: "Laravel Documentation" },
    ],
    related: ["laravel", "sql", "rest-apis", "http-and-web"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "PHP runs on the server and integrates tightly with web servers. Understanding superglobals, sessions, and input handling is key for secure apps.",
      },
      {
        type: "CODE",
        language: "php",
        body: `<?php
// Basic request handling
$name = htmlspecialchars($_POST['name'] ?? 'Guest');
echo "Hello, " . $name . "!";

// Simple function
function sum(int $a, int $b): int {
  return $a + $b;
}
echo sum(2, 3);
?>`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Always validate and sanitize user input. Never trust $_GET/$_POST directly—use whitelists and parameterized queries.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Understand types, arrays, functions" },
            { text: "Handle forms and file uploads safely" },
            { text: "Use sessions/cookies appropriately" },
            { text: "Connect to databases with prepared statements" },
          ],
        },
      },
      {
        type: "TABLE",
        data: {
          headers: ["Superglobal", "Purpose", "Notes"],
          rows: [
            ["$_GET", "URL params", "Read-only, visible"],
            ["$_POST", "Form data", "Hidden, for writes"],
            ["$_SESSION", "User session", "Server-side state"],
            ["$_SERVER", "Request metadata", "Headers, paths, etc."],
          ],
        },
      },
    ],
  },
  {
    slug: "laravel",
    title: "Laravel",
    summary:
      "Covers routing, Eloquent ORM, middleware, and testing in Laravel. The framework provides conventions that speed up building robust backend apps.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 240,
    status: "PUBLISHED",
    categories: ["backend"],
    resources: [
      { url: "https://laravel.com/docs", note: "Laravel Documentation" },
      { url: "https://www.php.net/docs.php", note: "PHP Documentation" },
    ],
    related: ["php", "sql", "rest-apis", "authentication-authorization"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Laravel emphasizes convention over configuration. Its tools for routing, validation, and database access help teams stay consistent and productive.",
      },
      {
        type: "CODE",
        language: "php",
        body: `// Route definition
Route::get('/users/{user}', function (User $user) {
  return view('users.show', ['user' => $user]);
})->middleware('auth');

// Eloquent query
$users = User::where('active', true)
  ->orderBy('created_at', 'desc')
  ->take(10)
  ->get();`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Use route model binding and form requests to keep controllers thin and validation centralized.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Define RESTful routes" },
            { text: "Use Eloquent relationships" },
            { text: "Implement middleware for cross-cutting concerns" },
            { text: "Write feature tests for critical flows" },
          ],
        },
      },
      {
        type: "TABLE",
        data: {
          headers: ["Component", "Purpose", "Notes"],
          rows: [
            ["Route", "URL mapping", "Web/API route files"],
            ["Controller", "Request handling", "Keep thin with services"],
            ["Eloquent", "ORM", "Active record pattern"],
            ["Migration", "Schema versioning", "Track DB changes"],
          ],
        },
      },
    ],
  },
  {
    slug: "nodejs",
    title: "Node.js",
    summary:
      "Covers the Node.js runtime, event loop, modules, and building server-side apps. Node excels at I/O-heavy workloads and JavaScript full-stack development.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 180,
    status: "PUBLISHED",
    categories: ["backend", "languages"],
    resources: [
      {
        url: "https://nodejs.org/docs/latest/api/",
        note: "Node.js API Reference",
      },
      { url: "https://developer.mozilla.org/", note: "MDN Web Docs" },
    ],
    related: ["javascript", "typescript", "rest-apis", "docker"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Node uses an event-driven, non-blocking I/O model. Understanding the event loop helps you write efficient, scalable network applications.",
      },
      {
        type: "CODE",
        language: "js",
        body: `const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello from Node.js");
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Prefer async I/O and avoid blocking the event loop with CPU-heavy sync operations.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Understand CommonJS vs ES modules" },
            { text: "Use streams for large data" },
            { text: "Handle errors in async code" },
            { text: "Manage dependencies with npm" },
          ],
        },
      },
      {
        type: "TABLE",
        data: {
          headers: ["Concept", "Purpose", "Notes"],
          rows: [
            ["Event loop", "Async execution", "Phases and task queues"],
            ["Stream", "Incremental I/O", "Readable/Writable/Duplex"],
            ["Buffer", "Binary data", "Raw bytes handling"],
          ],
        },
      },
    ],
  },
  {
    slug: "sql",
    title: "SQL",
    summary:
      "Covers relational data modeling, queries, joins, and transactions. SQL is the foundation for working with structured data in most backend systems.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 150,
    status: "PUBLISHED",
    categories: ["backend"],
    resources: [
      { url: "https://www.postgresql.org/docs/", note: "PostgreSQL Docs" },
      { url: "https://www.prisma.io/docs", note: "Prisma Docs" },
    ],
    related: [
      "postgresql",
      "data-modeling",
      "rest-apis",
      "reporting-analytics",
    ],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Relational databases use tables with keys and constraints. Writing precise queries with proper joins and indexes ensures correctness and performance.",
      },
      {
        type: "CODE",
        language: "sql",
        body: `-- Basic queries
SELECT id, name, email
FROM users
WHERE active = true
ORDER BY created_at DESC
LIMIT 10;

-- Join example
SELECT posts.title, users.name
FROM posts
JOIN users ON posts.user_id = users.id
WHERE posts.published = true;`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Use parameterized queries to prevent SQL injection. Index columns used in filters, joins, and sorts.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Model tables with PKs, FKs, constraints" },
            { text: "Write CRUD queries" },
            { text: "Use joins, grouping, aggregation" },
            { text: "Understand transactions and isolation" },
          ],
        },
      },
      {
        type: "TABLE",
        data: {
          headers: ["Clause", "Purpose", "Example"],
          rows: [
            ["SELECT", "Choose columns", "SELECT name FROM users"],
            ["WHERE", "Filter rows", "WHERE age > 18"],
            [
              "JOIN",
              "Combine tables",
              "JOIN orders ON users.id=orders.user_id",
            ],
            ["GROUP BY", "Aggregate", "GROUP BY department"],
          ],
        },
      },
    ],
  },
  {
    slug: "postgresql",
    title: "PostgreSQL",
    summary:
      "Covers PostgreSQL-specific features like advanced types, indexing, and performance tuning. Postgres is a powerful, standards-compliant open-source database.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 180,
    status: "PUBLISHED",
    categories: ["backend"],
    resources: [
      { url: "https://www.postgresql.org/docs/", note: "PostgreSQL Docs" },
      { url: "https://www.prisma.io/docs", note: "Prisma Docs" },
    ],
    related: ["sql", "data-modeling", "docker", "monitoring-observability"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Postgres supports rich data types, extensions, and robust transactions. Knowing its indexing and query planning helps you scale queries safely.",
      },
      {
        type: "CODE",
        language: "sql",
        body: `-- Create table with constraints
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price NUMERIC(10,2) CHECK (price >= 0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_products_name ON products(name);

-- Explain query
EXPLAIN ANALYZE SELECT * FROM products WHERE name LIKE 'A%';`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Use EXPLAIN ANALYZE to identify slow queries. Add indexes selectively based on actual query patterns.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Use schemas and constraints" },
            { text: "Leverage JSON/JSONB when appropriate" },
            { text: "Understand VACUUM and bloat" },
            { text: "Secure with roles and permissions" },
          ],
        },
      },
      {
        type: "TABLE",
        data: {
          headers: ["Feature", "Purpose", "Notes"],
          rows: [
            ["B-tree index", "Equality/range", "Default and most common"],
            ["GIN index", "Full text/JSONB", "Good for containment queries"],
            ["Transaction", "ACID", "Supports savepoints"],
          ],
        },
      },
    ],
  },
  {
    slug: "rest-apis",
    title: "REST APIs",
    summary:
      "Covers designing resource-oriented APIs with proper HTTP semantics. Well-designed REST APIs are predictable, cacheable, and easy to consume.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 150,
    status: "PUBLISHED",
    categories: ["backend"],
    resources: [
      { url: "https://developer.mozilla.org/", note: "MDN Web Docs" },
      { url: "https://www.prisma.io/docs", note: "Prisma Docs" },
    ],
    related: [
      "http-and-web",
      "authentication-authorization",
      "nodejs",
      "laravel",
    ],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "REST models business entities as resources with unique URIs. Use HTTP methods and status codes to express operations clearly and consistently.",
      },
      {
        type: "CODE",
        language: "json",
        body: `{
  "data": {
    "id": "123",
    "type": "users",
    "attributes": {
      "name": "Alice",
      "email": "alice@example.com"
    }
  },
  "links": {
    "self": "/api/users/123"
  }
}`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Version your API (e.g., /api/v1/). It prevents breaking changes for existing consumers.",
      },
      {
        type: "TABLE",
        data: {
          headers: ["Method", "Endpoint", "Action"],
          rows: [
            ["GET", "/users", "List users"],
            ["POST", "/users", "Create user"],
            ["GET", "/users/:id", "Get user"],
            ["PATCH", "/users/:id", "Update user"],
            ["DELETE", "/users/:id", "Delete user"],
          ],
        },
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Use nouns for resources, not verbs" },
            { text: "Return appropriate status codes" },
            { text: "Implement pagination for lists" },
            { text: "Validate and sanitize inputs" },
          ],
        },
      },
    ],
  },
  {
    slug: "authentication-authorization",
    title: "Authentication & Authorization",
    summary:
      "Covers verifying identity and enforcing permissions. Secure auth flows protect user data and prevent unauthorized access.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 150,
    status: "PUBLISHED",
    categories: ["backend", "security"],
    resources: [
      { url: "https://owasp.org/www-project-top-ten/", note: "OWASP Top Ten" },
      { url: "https://developer.mozilla.org/", note: "MDN Web Docs" },
    ],
    related: ["rest-apis", "security-fundamentals", "laravel", "nodejs"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Authentication confirms who you are; authorization determines what you can do. Use established patterns like sessions or tokens with secure storage.",
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Never store tokens in localStorage for high-risk apps. Use httpOnly secure cookies or secure storage with short-lived access tokens.",
      },
      {
        type: "TABLE",
        data: {
          headers: ["Method", "Type", "Notes"],
          rows: [
            ["Session", "Stateful", "Server stores session ID"],
            ["JWT", "Stateless", "Self-contained, verify signature"],
            ["OAuth", "Delegated", "Third-party identity"],
          ],
        },
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Hash passwords with strong algorithms" },
            { text: "Enforce MFA where appropriate" },
            { text: "Use RBAC or ABAC for permissions" },
            { text: "Protect against brute force and CSRF" },
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "Should I use JWTs for sessions?",
              answer:
                "JWTs are fine for short-lived tokens. For traditional sessions, server-side storage is often simpler and more revocable.",
            },
            {
              question: "How do I handle token rotation?",
              answer:
                "Use refresh tokens with rotation and reuse detection to limit token theft impact.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "graphql",
    title: "GraphQL",
    summary:
      "Covers schema design, queries, mutations, and resolvers. GraphQL lets clients request exactly the data they need with a strongly typed schema.",
    difficulty: "ADVANCED",
    estimatedMinutes: 180,
    status: "DRAFT",
    categories: ["backend", "architecture"],
    resources: [
      { url: "https://developer.mozilla.org/", note: "MDN Web Docs" },
      { url: "https://www.prisma.io/docs", note: "Prisma Docs" },
    ],
    related: ["rest-apis", "nodejs", "typescript", "data-modeling"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "GraphQL uses a single endpoint and a schema to define operations. Resolvers fetch data from sources while the type system enforces contracts.",
      },
      {
        type: "CODE",
        language: "graphql",
        body: `type Query {
  user(id: ID!): User
  users: [User!]!
}

type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Mutation {
  createUser(name: String!, email: String!): User!
}`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Avoid N+1 queries in resolvers. Use batching (DataLoader) or join data at the data layer.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Design a clear, evolvable schema" },
            { text: "Implement queries, mutations, subscriptions" },
            { text: "Handle errors and validation" },
            { text: "Secure with auth and depth limiting" },
          ],
        },
      },
      {
        type: "TABLE",
        data: {
          headers: ["Operation", "Purpose", "Notes"],
          rows: [
            ["Query", "Read data", "Idempotent, parallelizable"],
            ["Mutation", "Write data", "Sequential semantics"],
            ["Subscription", "Real-time", "WebSocket-based"],
          ],
        },
      },
    ],
  },
  {
    slug: "design-patterns",
    title: "Design Patterns",
    summary:
      "Covers reusable solutions to common software design problems. Patterns improve maintainability, testability, and communication across teams.",
    difficulty: "ADVANCED",
    estimatedMinutes: 180,
    status: "PUBLISHED",
    categories: ["architecture"],
    resources: [
      { url: "https://martinfowler.com/", note: "Martin Fowler's Bliki" },
      {
        url: "https://github.com/donnemartin/system-design-primer",
        note: "System Design Primer",
      },
    ],
    related: ["system-design", "integration-patterns", "automated-testing"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Patterns are proven blueprints, not rules. Choose them to solve specific problems while keeping code simple and flexible.",
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Prefer composition over inheritance. Overusing patterns can create unnecessary abstraction and complexity.",
      },
      {
        type: "TABLE",
        data: {
          headers: ["Category", "Pattern", "Use case"],
          rows: [
            [
              "Creational",
              "Factory",
              "Create objects without specifying classes",
            ],
            ["Structural", "Adapter", "Bridge incompatible interfaces"],
            ["Behavioral", "Observer", "Publish/subscribe notifications"],
          ],
        },
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Understand SOLID principles" },
            { text: "Know common creational patterns" },
            { text: "Apply structural patterns judiciously" },
            { text: "Use behavioral patterns for decoupling" },
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "Are patterns language-specific?",
              answer:
                "Conceptually no. Implementation details vary by language features and paradigms.",
            },
            {
              question: "When should I introduce a pattern?",
              answer:
                "When you see a recurring problem and the pattern reduces coupling or improves clarity.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "system-design",
    title: "System Design",
    summary:
      "Covers scaling, reliability, and architectural trade-offs for large systems. System design balances performance, cost, and complexity.",
    difficulty: "ADVANCED",
    estimatedMinutes: 300,
    status: "PUBLISHED",
    categories: ["architecture"],
    resources: [
      {
        url: "https://github.com/donnemartin/system-design-primer",
        note: "System Design Primer",
      },
      { url: "https://martinfowler.com/", note: "Martin Fowler's Bliki" },
    ],
    related: [
      "design-patterns",
      "data-structures-algorithms",
      "monitoring-observability",
      "security-fundamentals",
    ],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Designing systems means making trade-offs under constraints. Clarify requirements, estimate scale, then choose components that meet SLAs.",
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Start with a minimal design and evolve. Avoid over-engineering for hypothetical scale.",
      },
      {
        type: "TABLE",
        data: {
          headers: ["Concept", "Purpose", "Notes"],
          rows: [
            ["Load balancer", "Distribute traffic", "Horizontal scaling"],
            ["Cache", "Reduce latency", "Redis/Memcached common"],
            ["Queue", "Async processing", "Decouples producers/consumers"],
            ["CDN", "Static delivery", "Geographic edge caching"],
          ],
        },
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Define functional/non-functional requirements" },
            { text: "Estimate capacity and constraints" },
            { text: "Design data model and APIs" },
            { text: "Plan for failure and monitoring" },
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "How do I approach interviews?",
              answer:
                "Clarify, scope, design high-level, dive deep, then discuss trade-offs and edge cases.",
            },
            {
              question: "What about CAP theorem?",
              answer:
                "Understand consistency/availability/partition tolerance trade-offs for distributed data.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "automated-testing",
    title: "Automated Testing",
    summary:
      "Covers test strategy, types of tests, and automation in CI. Automated tests catch regressions and enable safe, confident refactoring.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 150,
    status: "PUBLISHED",
    categories: ["testing"],
    resources: [
      {
        url: "https://testing-library.com/docs/",
        note: "Testing Library Docs",
      },
      { url: "https://playwright.dev/", note: "Playwright Docs" },
    ],
    related: ["unit-testing", "end-to-end-testing", "ci-cd", "debugging"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Effective testing balances speed, confidence, and maintenance cost. Follow the testing pyramid: many unit tests, fewer integration, few E2E.",
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Test behavior, not implementation details. This keeps tests resilient to refactoring.",
      },
      {
        type: "TABLE",
        data: {
          headers: ["Test type", "Speed", "Scope"],
          rows: [
            ["Unit", "Fast", "Single function/module"],
            ["Integration", "Medium", "Multiple modules together"],
            ["E2E", "Slow", "Full user flows"],
          ],
        },
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Write deterministic, isolated tests" },
            { text: "Use factories/mocks appropriately" },
            { text: "Run tests in CI on every change" },
            { text: "Track coverage meaningfully" },
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "What is a good coverage target?",
              answer:
                "Focus on critical paths and business logic. High coverage doesn't guarantee quality.",
            },
            {
              question: "Should I mock everything?",
              answer:
                "Mock external dependencies (APIs, DB). Avoid mocking internals of the unit under test.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "unit-testing",
    title: "Unit Testing",
    summary:
      "Focuses on testing individual functions and components in isolation. Unit tests are fast, precise, and ideal for TDD workflows.",
    difficulty: "BEGINNER",
    estimatedMinutes: 120,
    status: "PUBLISHED",
    categories: ["testing"],
    resources: [
      {
        url: "https://testing-library.com/docs/",
        note: "Testing Library Docs",
      },
      { url: "https://playwright.dev/", note: "Playwright Docs" },
    ],
    related: ["automated-testing", "javascript", "typescript", "debugging"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Unit tests verify small units behave correctly. Keep them simple, focused, and independent of external systems.",
      },
      {
        type: "CODE",
        language: "ts",
        body: `import { describe, it, expect } from "vitest";

function add(a: number, b: number): number {
  return a + b;
}

describe("add", () => {
  it("adds two numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("handles negative numbers", () => {
    expect(add(-1, -2)).toBe(-3);
  });
});`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Use Arrange-Act-Assert structure for clarity. Name tests to describe behavior, not implementation.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Test edge cases and invalid inputs" },
            { text: "Avoid shared mutable state" },
            { text: "Keep tests fast and deterministic" },
            { text: "Use descriptive assertions" },
          ],
        },
      },
      {
        type: "TABLE",
        data: {
          headers: ["Tool", "Use case", "Notes"],
          rows: [
            ["Vitest", "Unit/integration", "Fast, Vite-native"],
            ["Jest", "General testing", "Broad ecosystem"],
            ["Testing Library", "Component testing", "User-centric queries"],
          ],
        },
      },
    ],
  },
  {
    slug: "end-to-end-testing",
    title: "End-to-End Testing",
    summary:
      "Covers testing full user flows in real browsers. E2E tests validate the entire stack from UI to backend and data layer.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 150,
    status: "PUBLISHED",
    categories: ["testing"],
    resources: [
      { url: "https://playwright.dev/", note: "Playwright Docs" },
      {
        url: "https://testing-library.com/docs/",
        note: "Testing Library Docs",
      },
    ],
    related: ["automated-testing", "react", "rest-apis", "ci-cd"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "E2E tests simulate real user actions. They catch integration issues but are slower and more brittle than unit tests, so use them sparingly.",
      },
      {
        type: "CODE",
        language: "ts",
        body: `import { test, expect } from "@playwright/test";

test("user can log in", async ({ page }) => {
  await page.goto("/login");
  await page.fill("#email", "user@example.com");
  await page.fill("#password", "password");
  await page.click("button[type=submit]");
  await expect(page).toHaveURL("/dashboard");
  await expect(page.locator("h1")).toContainText("Dashboard");
});`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Use data-testids or stable selectors. Avoid relying on CSS classes that may change with styling.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Test critical user journeys" },
            { text: "Use fixtures for test data" },
            { text: "Handle flakiness with retries/waits" },
            { text: "Run in parallel where safe" },
          ],
        },
      },
      {
        type: "TABLE",
        data: {
          headers: ["Tool", "Browser support", "Notes"],
          rows: [
            [
              "Playwright",
              "Chromium, Firefox, WebKit",
              "Modern, fast, reliable",
            ],
            ["Cypress", "Chromium-based", "Great DX, limited multi-tab"],
          ],
        },
      },
    ],
  },
  {
    slug: "linux-basics",
    title: "Linux Basics",
    summary:
      "Covers file permissions, processes, users, and basic networking on Linux. These skills are essential for deployment and server management.",
    difficulty: "BEGINNER",
    estimatedMinutes: 120,
    status: "PUBLISHED",
    categories: ["devops"],
    resources: [
      { url: "https://docs.docker.com/", note: "Docker Docs" },
      { url: "https://git-scm.com/book/en/v2", note: "Pro Git Book" },
    ],
    related: ["command-line", "docker", "ci-cd", "cloud-fundamentals"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Linux is the foundation for most cloud and container workloads. Knowing how to navigate, manage permissions, and monitor processes is critical.",
      },
      {
        type: "CODE",
        language: "bash",
        body: `# Permissions and processes
ls -la file.txt
chmod 644 file.txt
chown user:group file.txt
ps aux | grep node
kill -9 1234

# Networking basics
curl -I https://example.com
netstat -tuln | head -10`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Use sudo sparingly and understand file permissions (read/write/execute). Least privilege reduces risk.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Navigate filesystem and manage files" },
            { text: "Understand users, groups, permissions" },
            { text: "Monitor and kill processes" },
            { text: "Use basic networking tools" },
          ],
        },
      },
      {
        type: "TABLE",
        data: {
          headers: ["Command", "Purpose", "Example"],
          rows: [
            ["chmod", "Change permissions", "chmod +x script.sh"],
            ["ps", "List processes", "ps aux"],
            ["top/htop", "Monitor resources", "htop"],
            ["systemctl", "Manage services", "systemctl status nginx"],
          ],
        },
      },
    ],
  },
  {
    slug: "docker",
    title: "Docker",
    summary:
      "Covers containerization, images, volumes, and Docker Compose. Docker ensures consistent environments from dev to production.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 150,
    status: "PUBLISHED",
    categories: ["devops"],
    resources: [
      { url: "https://docs.docker.com/", note: "Docker Documentation" },
      { url: "https://kubernetes.io/docs/home/", note: "Kubernetes Docs" },
    ],
    related: ["linux-basics", "ci-cd", "nodejs", "postgresql"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Containers package apps with dependencies for portability. Images are immutable templates; containers are running instances with isolated filesystems.",
      },
      {
        type: "CODE",
        language: "dockerfile",
        body: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Use multi-stage builds and .dockerignore to keep images small and secure.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Build and run containers" },
            { text: "Use volumes for persistent data" },
            { text: "Orchestrate with Docker Compose" },
            { text: "Scan images for vulnerabilities" },
          ],
        },
      },
      {
        type: "TABLE",
        data: {
          headers: ["Concept", "Purpose", "Notes"],
          rows: [
            ["Image", "Blueprint", "Read-only layers"],
            ["Container", "Running instance", "Ephemeral by default"],
            ["Volume", "Persistent storage", "Outside container lifecycle"],
            ["Network", "Connectivity", "Isolated or bridged"],
          ],
        },
      },
    ],
  },
  {
    slug: "ci-cd",
    title: "CI/CD",
    summary:
      "Covers continuous integration and deployment pipelines. Automated pipelines improve quality, speed, and reliability of releases.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 120,
    status: "PUBLISHED",
    categories: ["devops", "testing"],
    resources: [
      { url: "https://docs.docker.com/", note: "Docker Docs" },
      { url: "https://git-scm.com/book/en/v2", note: "Pro Git Book" },
    ],
    related: [
      "automated-testing",
      "docker",
      "version-control-git",
      "cloud-fundamentals",
    ],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "CI validates changes on every push; CD automates delivery/deployment. Together they enable fast, safe, and predictable releases.",
      },
      {
        type: "CODE",
        language: "yaml",
        body: `name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --run
      - run: npm run build`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Fail fast. Run linters, type checks, and unit tests before slower E2E tests.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Automate build, test, lint" },
            { text: "Use secrets safely" },
            { text: "Cache dependencies" },
            { text: "Implement rollback strategy" },
          ],
        },
      },
      {
        type: "TABLE",
        data: {
          headers: ["Stage", "Purpose", "Trigger"],
          rows: [
            ["CI", "Validate changes", "Push/PR"],
            ["CD (staging)", "Deploy to staging", "Merge to main"],
            ["CD (prod)", "Deploy to prod", "Release/tag"],
          ],
        },
      },
    ],
  },
  {
    slug: "cloud-fundamentals",
    title: "Cloud Fundamentals",
    summary:
      "Covers IaaS/PaaS/SaaS, compute, storage, networking, and basic security. Cloud knowledge is essential for modern deployments.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 150,
    status: "PUBLISHED",
    categories: ["devops"],
    resources: [
      { url: "https://12factor.net/", note: "12-Factor App" },
      { url: "https://docs.docker.com/", note: "Docker Docs" },
    ],
    related: ["docker", "ci-cd", "linux-basics", "monitoring-observability"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Cloud providers abstract infrastructure. Understand core services, pricing models, and trade-offs between managed and self-managed options.",
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Design for failure. Use managed services where they reduce operational burden, but understand their limits.",
      },
      {
        type: "TABLE",
        data: {
          headers: ["Model", "Control", "Examples"],
          rows: [
            ["IaaS", "High", "VMs, networks, storage"],
            ["PaaS", "Medium", "App runtime, DB managed"],
            ["SaaS", "Low", "Third-party apps"],
          ],
        },
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Understand regions/zones" },
            { text: "Secure with IAM and VPCs" },
            { text: "Use environment variables for config" },
            { text: "Plan for backups and recovery" },
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "What is the 12-factor app?",
              answer:
                "A methodology for building portable, scalable apps. Key points: config in env, stateless processes, logs as streams.",
            },
            {
              question: "IaaS vs PaaS for startups?",
              answer:
                "PaaS reduces ops early. Move to IaaS only if you need deep customization or cost control.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "monitoring-observability",
    title: "Monitoring & Observability",
    summary:
      "Covers logs, metrics, traces, and alerting. Observability helps you understand system behavior and resolve incidents quickly.",
    difficulty: "ADVANCED",
    estimatedMinutes: 150,
    status: "PUBLISHED",
    categories: ["devops", "architecture"],
    resources: [
      { url: "https://12factor.net/", note: "12-Factor App" },
      { url: "https://kubernetes.io/docs/home/", note: "Kubernetes Docs" },
    ],
    related: ["cloud-fundamentals", "docker", "ci-cd", "security-fundamentals"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Monitoring tells you if something is wrong. Observability helps you understand why. Combine logs, metrics, and traces for full visibility.",
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Instrument what matters: user-facing SLIs, error rates, latency, and saturation.",
      },
      {
        type: "TABLE",
        data: {
          headers: ["Signal", "Purpose", "Example"],
          rows: [
            ["Logs", "Event records", "Request details, errors"],
            ["Metrics", "Numeric time-series", "CPU, memory, req/sec"],
            ["Traces", "Request flow", "Distributed call chains"],
          ],
        },
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Define SLIs, SLOs, SLAs" },
            { text: "Centralize logging" },
            { text: "Set actionable alerts" },
            { text: "Create runbooks for incidents" },
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "Logs vs traces?",
              answer:
                "Logs are discrete events. Traces show end-to-end request context across services.",
            },
            {
              question: "How many alerts should I have?",
              answer:
                "Few, high-signal alerts. Avoid alert fatigue with proper thresholds and deduplication.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "security-fundamentals",
    title: "Security Fundamentals",
    summary:
      "Covers secure coding, threat modeling, and common vulnerabilities. Security must be built in from design through deployment.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 150,
    status: "DRAFT",
    categories: ["security", "backend"],
    resources: [
      { url: "https://owasp.org/www-project-top-ten/", note: "OWASP Top Ten" },
      { url: "https://12factor.net/", note: "12-Factor App" },
    ],
    related: [
      "authentication-authorization",
      "rest-apis",
      "http-and-web",
      "ci-cd",
    ],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Security is defense in depth. Validate inputs, encrypt data in transit/at rest, and apply least privilege across systems.",
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Treat all user input as untrusted. Validate server-side, encode outputs, and use parameterized queries.",
      },
      {
        type: "TABLE",
        data: {
          headers: ["Risk", "Mitigation", "Notes"],
          rows: [
            ["Injection", "Parameterized queries", "SQL, NoSQL, command"],
            ["XSS", "Output encoding/CSP", "Prevent script injection"],
            ["CSRF", "Tokens/headers", "State-changing requests"],
            ["Broken auth", "Secure sessions/tokens", "MFA, rotation"],
          ],
        },
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Follow OWASP Top Ten" },
            { text: "Use HTTPS everywhere" },
            { text: "Manage secrets securely" },
            { text: "Keep dependencies updated" },
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "What is threat modeling?",
              answer:
                "Identify assets, threats, and mitigations early. It prioritizes security work by risk.",
            },
            {
              question: "How often should I scan dependencies?",
              answer:
                "In CI on every build and on a schedule. Automate fixes where possible.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "business-process-modeling",
    title: "Business Process Modeling",
    summary:
      "Covers mapping and analyzing business workflows. Clear models align technical solutions with real business needs.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 120,
    status: "PUBLISHED",
    categories: ["business"],
    resources: [
      { url: "https://martinfowler.com/", note: "Martin Fowler's Bliki" },
      { url: "https://docs.stripe.com/", note: "Stripe Docs" },
    ],
    related: [
      "requirements-gathering",
      "data-modeling",
      "integration-patterns",
      "system-design",
    ],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Process models visualize steps, actors, and decisions. They reveal bottlenecks and clarify what software must automate or support.",
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Model the as-is process before designing to-be. Avoid jumping to solutions without understanding current workflows.",
      },
      {
        type: "TABLE",
        data: {
          headers: ["Notation", "Focus", "Use case"],
          rows: [
            ["BPMN", "End-to-end flows", "Standard, cross-team"],
            ["Flowchart", "Simple logic", "Quick sketches"],
            ["Swimlanes", "Actors/responsibilities", "Clarify handoffs"],
          ],
        },
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Identify actors and boundaries" },
            { text: "Map steps and decision points" },
            { text: "Find pain points and exceptions" },
            { text: "Validate with stakeholders" },
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "How detailed should models be?",
              answer:
                "Detailed enough to inform implementation, but not so detailed they become hard to maintain.",
            },
            {
              question: "Who should participate?",
              answer:
                "Include domain experts, users, and engineers to avoid blind spots.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "data-modeling",
    title: "Data Modeling",
    summary:
      "Covers conceptual, logical, and physical data models. Good models ensure data integrity, performance, and clarity.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 150,
    status: "PUBLISHED",
    categories: ["backend", "business"],
    resources: [
      { url: "https://www.prisma.io/docs", note: "Prisma Docs" },
      { url: "https://www.postgresql.org/docs/", note: "PostgreSQL Docs" },
    ],
    related: [
      "sql",
      "postgresql",
      "business-process-modeling",
      "reporting-analytics",
    ],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Data modeling translates business concepts into relational structures. Normalize to reduce redundancy, denormalize only when necessary for performance.",
      },
      {
        type: "CODE",
        language: "sql",
        body: `-- Example schema
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  total NUMERIC(10,2) NOT NULL,
  order_date TIMESTAMP NOT NULL
);`,
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Name tables/columns clearly and consistently. Use constraints to enforce business rules at the database level.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Identify entities and relationships" },
            { text: "Define keys and constraints" },
            { text: "Consider indexing strategy" },
            { text: "Plan for evolution/migrations" },
          ],
        },
      },
      {
        type: "TABLE",
        data: {
          headers: ["Model type", "Audience", "Purpose"],
          rows: [
            ["Conceptual", "Business", "Entities and relationships"],
            ["Logical", "Data architects", "Attributes, keys, normalization"],
            ["Physical", "DBAs/devs", "Tables, types, indexes"],
          ],
        },
      },
    ],
  },
  {
    slug: "reporting-analytics",
    title: "Reporting & Analytics",
    summary:
      "Covers collecting, transforming, and visualizing data for insights. Good reporting supports decisions without overloading operational systems.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 120,
    status: "PUBLISHED",
    categories: ["business"],
    resources: [
      { url: "https://www.postgresql.org/docs/", note: "PostgreSQL Docs" },
      { url: "https://www.prisma.io/docs", note: "Prisma Docs" },
    ],
    related: [
      "sql",
      "data-modeling",
      "postgresql",
      "business-process-modeling",
    ],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Separate operational and analytical workloads when scale grows. Use read replicas, materialized views, or data warehouses for heavy queries.",
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Define clear metrics and dimensions. Avoid raw table dumps; provide curated reports with filters and permissions.",
      },
      {
        type: "TABLE",
        data: {
          headers: ["Approach", "Latency", "Use case"],
          rows: [
            ["Live queries", "Low", "Real-time dashboards"],
            ["Materialized views", "Medium", "Pre-aggregated reports"],
            ["ETL/warehouse", "Higher", "Historical analysis"],
          ],
        },
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Identify KPIs and stakeholders" },
            { text: "Model facts and dimensions" },
            { text: "Ensure data freshness" },
            { text: "Secure sensitive data" },
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "When to use materialized views?",
              answer:
                "When complex aggregations are slow and data updates are infrequent relative to reads.",
            },
            {
              question: "OLTP vs OLAP?",
              answer:
                "OLTP is for transactions (writes). OLAP is for analysis (reads/aggregations).",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "integration-patterns",
    title: "Integration Patterns",
    summary:
      "Covers connecting systems via APIs, messaging, and events. Good integration balances reliability, coupling, and observability.",
    difficulty: "ADVANCED",
    estimatedMinutes: 150,
    status: "PUBLISHED",
    categories: ["architecture", "business"],
    resources: [
      { url: "https://martinfowler.com/", note: "Martin Fowler's Bliki" },
      { url: "https://docs.stripe.com/", note: "Stripe Docs" },
    ],
    related: ["rest-apis", "system-design", "design-patterns"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Integrations can be synchronous (request/response) or asynchronous (events/messages). Choose based on consistency needs and failure tolerance.",
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Design for idempotency and retries. Network failures are inevitable in distributed systems.",
      },
      {
        type: "TABLE",
        data: {
          headers: ["Pattern", "Type", "Notes"],
          rows: [
            ["REST API", "Sync", "Direct, simple"],
            ["Webhook", "Async push", "Event notifications"],
            ["Message queue", "Async", "Buffer and decouple"],
            ["Event bus", "Pub/sub", "Loose coupling"],
          ],
        },
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Define contracts and schemas" },
            { text: "Handle failures with retries/DLQ" },
            { text: "Ensure idempotent consumers" },
            { text: "Log and trace requests" },
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "Sync vs async trade-offs?",
              answer:
                "Sync is simple but couples systems. Async is resilient but adds complexity in ordering and consistency.",
            },
            {
              question: "What is eventual consistency?",
              answer:
                "Data becomes consistent over time in async systems. Acceptable when immediate consistency isn't required.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "requirements-gathering",
    title: "Requirements Gathering",
    summary:
      "Covers eliciting, documenting, and validating requirements. Clear requirements prevent scope creep and misaligned solutions.",
    difficulty: "BEGINNER",
    estimatedMinutes: 90,
    status: "PUBLISHED",
    categories: ["business"],
    resources: [
      { url: "https://martinfowler.com/", note: "Martin Fowler's Bliki" },
      { url: "https://docs.stripe.com/", note: "Stripe Docs" },
    ],
    related: ["business-process-modeling", "data-modeling", "system-design"],
    blocks: [
      {
        type: "MARKDOWN",
        title: "Overview",
        body: "Requirements gathering bridges business needs and technical implementation. Focus on user goals, constraints, and success criteria.",
      },
      {
        type: "CALLOUT",
        title: "Practical tip",
        body: "Ask 'why' repeatedly to uncover root needs. Users often describe solutions, not problems.",
      },
      {
        type: "CHECKLIST",
        data: {
          items: [
            { text: "Interview stakeholders" },
            { text: "Define functional/non-functional reqs" },
            { text: "Write acceptance criteria" },
            { text: "Prioritize with MoSCoW or value" },
          ],
        },
      },
      {
        type: "TABLE",
        data: {
          headers: ["Type", "Description", "Example"],
          rows: [
            ["Functional", "What system does", "User can reset password"],
            ["Non-functional", "Quality attributes", "Response < 200ms"],
            ["Business", "Goals/constraints", "Comply with regulations"],
          ],
        },
      },
      {
        type: "FAQ",
        data: {
          items: [
            {
              question: "What are user stories?",
              answer:
                "Short, user-focused descriptions: 'As a user, I want X so that Y' with clear acceptance criteria.",
            },
            {
              question: "How do I handle changing requirements?",
              answer:
                "Embrace iterative discovery. Document decisions and trade-offs transparently.",
            },
          ],
        },
      },
    ],
  },
];
