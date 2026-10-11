import type { SeedRoadmap } from "../types";

export const roadmaps: SeedRoadmap[] = [
  {
    slug: "software-developer",
    title: "Software Developer",
    summary:
      "A broad path from zero to a first developer role, covering the command line, version control, a core language, databases, and the practices professional teams expect.",
    description: `This roadmap is for people who want to become working software developers but are not sure where to start. It covers the shared foundation every developer needs — the terminal, Git, programming fundamentals, and how the web fits together — before branching into a first language and database work.

Work through the foundations first and do not skip them. Every later skill in this roadmap assumes you can comfortably move around a terminal, commit your work with Git, and read documentation. After that, pick up JavaScript and SQL, which together let you build and store data for real applications.

By the end you will be able to plan a small full application, write and test its code, persist data in a relational database, and explain the high-level shape of a system to another developer. That is enough to start contributing to a team or building your own projects with confidence.`,
    audience: "Complete beginners who want their first developer role.",
    prerequisiteNotes: `- A computer you can install developer tools on
- Willingness to type commands in a terminal regularly
- No prior programming knowledge assumed`,
    difficulty: "BEGINNER",
    estimatedHours: 320,
    status: "PUBLISHED",
    featured: true,
    order: 1,
    categories: ["fundamentals"],
    sections: [
      { key: "foundations", title: "Foundations" },
      { key: "core", title: "Core Skills" },
      { key: "practices", title: "Professional Practices" },
    ],
    nodes: [
      {
        key: "command-line",
        title: "Command Line",
        topic: "command-line",
        section: "foundations",
        summary:
          "Navigate your machine, run tools, and manage files from the terminal.",
        difficulty: "BEGINNER",
        estimatedMinutes: 300,
      },
      {
        key: "git",
        title: "Version Control with Git",
        topic: "version-control-git",
        section: "foundations",
        summary: "Track changes, branch, and collaborate on code safely.",
        difficulty: "BEGINNER",
        estimatedMinutes: 360,
      },
      {
        key: "programming-fundamentals",
        title: "Programming Fundamentals",
        topic: "programming-fundamentals",
        section: "foundations",
        summary:
          "Variables, control flow, functions, and the mindset of breaking problems down.",
        difficulty: "BEGINNER",
        estimatedMinutes: 720,
      },
      {
        key: "http",
        title: "HTTP and the Web",
        topic: "http-and-web",
        section: "foundations",
        summary:
          "How browsers and servers talk: requests, responses, status codes, and headers.",
        difficulty: "BEGINNER",
        estimatedMinutes: 300,
      },
      {
        key: "data-structures",
        title: "Data Structures and Algorithms",
        topic: "data-structures-algorithms",
        section: "foundations",
        summary:
          "Arrays, maps, trees, and the complexity basics every developer relies on.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 600,
      },
      {
        key: "javascript",
        title: "JavaScript",
        topic: "javascript",
        section: "core",
        summary: "A first mainstream language used in browsers and on servers.",
        difficulty: "BEGINNER",
        estimatedMinutes: 900,
      },
      {
        key: "sql",
        title: "SQL and Relational Databases",
        topic: "sql",
        section: "core",
        summary:
          "Model data in tables and query it with selects, joins, and aggregates.",
        difficulty: "BEGINNER",
        estimatedMinutes: 600,
      },
      {
        key: "automated-testing",
        title: "Automated Testing",
        topic: "automated-testing",
        section: "practices",
        summary:
          "Write tests that catch regressions and give you confidence to refactor.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 480,
      },
      {
        key: "system-design",
        title: "Introduction to System Design",
        topic: "system-design",
        section: "practices",
        summary:
          "Sketch how the parts of a small application fit together and why.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
      },
    ],
    edges: [
      {
        from: "programming-fundamentals",
        to: "command-line",
        relationship: "PREREQUISITE",
      },
      { from: "command-line", to: "git", relationship: "PREREQUISITE" },
      {
        from: "programming-fundamentals",
        to: "data-structures",
        relationship: "PREREQUISITE",
      },
      {
        from: "programming-fundamentals",
        to: "http",
        relationship: "RECOMMENDED",
      },
      { from: "git", to: "javascript", relationship: "RECOMMENDED" },
      { from: "http", to: "javascript", relationship: "RECOMMENDED" },
      { from: "javascript", to: "sql", relationship: "RECOMMENDED" },
      {
        from: "data-structures",
        to: "automated-testing",
        relationship: "RECOMMENDED",
      },
      { from: "sql", to: "automated-testing", relationship: "RECOMMENDED" },
      { from: "data-structures", to: "system-design", relationship: "RELATED" },
    ],
  },
  {
    slug: "frontend-developer",
    title: "Frontend Developer",
    summary:
      "Build interfaces for the web with HTML, CSS, and JavaScript, then level up with TypeScript, React, accessibility, and performance work.",
    description: `This roadmap is for anyone who wants to specialize in what users actually see and interact with. It starts with the three bedrock technologies of the browser — HTML for structure, CSS for presentation, and JavaScript for behavior — and assumes nothing beyond basic computer literacy.

Once those fundamentals are solid, the path moves into TypeScript for safer code, React for building component-driven interfaces, and the state management patterns that keep larger apps maintainable. The final stretch covers accessibility and performance, the two areas that separate junior work from professional frontend engineering.

You will finish able to build a responsive, accessible single-page application from a design or brief, test it, and ship it knowing it performs well on real devices and for real users, including those using assistive technology.`,
    audience:
      "Beginners and career switchers aiming for their first frontend role.",
    prerequisiteNotes: `- Basic computer literacy and comfort editing text files
- Familiarity with browser dev tools is helpful but not required`,
    difficulty: "BEGINNER",
    estimatedHours: 360,
    status: "PUBLISHED",
    featured: true,
    order: 2,
    categories: ["frontend", "fundamentals"],
    sections: [
      { key: "foundations", title: "Browser Foundations" },
      { key: "core-ui", title: "Modern UI Development" },
      { key: "quality", title: "Quality and Polish" },
    ],
    nodes: [
      {
        key: "html",
        title: "HTML",
        topic: "html",
        section: "foundations",
        summary:
          "Structure pages with semantic markup that assistive technologies can read.",
        difficulty: "BEGINNER",
        estimatedMinutes: 360,
      },
      {
        key: "css",
        title: "CSS",
        topic: "css",
        section: "foundations",
        summary:
          "Lay out and style interfaces, including responsive designs for small screens.",
        difficulty: "BEGINNER",
        estimatedMinutes: 600,
      },
      {
        key: "javascript",
        title: "JavaScript",
        topic: "javascript",
        section: "foundations",
        summary:
          "Add interactivity, handle events, and work with data in the browser.",
        difficulty: "BEGINNER",
        estimatedMinutes: 900,
      },
      {
        key: "typescript",
        title: "TypeScript",
        topic: "typescript",
        section: "core-ui",
        summary:
          "Add static types to JavaScript to catch bugs before they reach users.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 480,
      },
      {
        key: "react",
        title: "React",
        topic: "react",
        section: "core-ui",
        summary:
          "Build interfaces from reusable components driven by state and props.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 900,
      },
      {
        key: "state-management",
        title: "State Management",
        topic: "state-management",
        section: "core-ui",
        summary:
          "Organize application state so data flow stays predictable as apps grow.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
      },
      {
        key: "accessibility",
        title: "Accessibility",
        topic: "accessibility",
        section: "quality",
        summary:
          "Make interfaces usable with keyboards, screen readers, and other assistive tools.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
      },
      {
        key: "web-performance",
        title: "Web Performance",
        topic: "web-performance",
        section: "quality",
        summary:
          "Measure and improve load time, rendering, and runtime responsiveness.",
        difficulty: "ADVANCED",
        estimatedMinutes: 360,
      },
      {
        key: "automated-testing",
        title: "Frontend Testing",
        topic: "automated-testing",
        section: "quality",
        summary: "Cover components and user flows with automated tests.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
      },
    ],
    edges: [
      { from: "html", to: "css", relationship: "PREREQUISITE" },
      { from: "css", to: "javascript", relationship: "PREREQUISITE" },
      { from: "javascript", to: "typescript", relationship: "PREREQUISITE" },
      { from: "typescript", to: "react", relationship: "PREREQUISITE" },
      { from: "react", to: "state-management", relationship: "RECOMMENDED" },
      { from: "javascript", to: "accessibility", relationship: "RECOMMENDED" },
      { from: "react", to: "automated-testing", relationship: "RECOMMENDED" },
      { from: "accessibility", to: "web-performance", relationship: "RELATED" },
      {
        from: "state-management",
        to: "web-performance",
        relationship: "OPTIONAL",
      },
    ],
  },
  {
    slug: "backend-developer",
    title: "Backend Developer",
    summary:
      "Design servers, APIs, and data layers: command line and Git fundamentals through Node.js, SQL, authentication, testing, and containerized delivery.",
    description: `Backend development is about everything that happens away from the browser: accepting requests, applying business rules, talking to a database, and returning responses your clients can trust. This roadmap takes you from terminal basics to a production-minded API stack.

The middle of the path is deliberately concrete. You will learn one server-side language well (Node.js is used here, but the concepts transfer), model data in SQL and PostgreSQL, expose it over REST, and protect it with proper authentication and authorization. Testing is treated as part of the job, not an afterthought.

The final section covers Docker and continuous integration so your work can move from a laptop to a shared pipeline. Finish here and you will be able to build, test, and containerize an API that a frontend or another service can depend on.`,
    audience: "Aspiring backend developers who want to build and ship APIs.",
    prerequisiteNotes: `- Comfort using a computer daily; no server experience needed
- Any prior programming exposure helps but is not required`,
    difficulty: "BEGINNER",
    estimatedHours: 380,
    status: "PUBLISHED",
    featured: true,
    order: 3,
    categories: ["backend"],
    sections: [
      { key: "foundations", title: "Foundations" },
      { key: "core-api", title: "APIs and Data" },
      { key: "delivery", title: "Delivery and Operations" },
    ],
    nodes: [
      {
        key: "command-line",
        title: "Command Line",
        topic: "command-line",
        section: "foundations",
        summary:
          "Run processes, manage files, and configure tools from the terminal.",
        difficulty: "BEGINNER",
        estimatedMinutes: 300,
      },
      {
        key: "git",
        title: "Version Control with Git",
        topic: "version-control-git",
        section: "foundations",
        summary:
          "Track server code changes and collaborate through branches and reviews.",
        difficulty: "BEGINNER",
        estimatedMinutes: 300,
      },
      {
        key: "nodejs",
        title: "Node.js",
        topic: "nodejs",
        section: "foundations",
        summary: "Run JavaScript on the server and build request handlers.",
        difficulty: "BEGINNER",
        estimatedMinutes: 720,
      },
      {
        key: "sql",
        title: "SQL",
        topic: "sql",
        section: "core-api",
        summary:
          "Design tables and query them with joins, indexes, and transactions.",
        difficulty: "BEGINNER",
        estimatedMinutes: 600,
      },
      {
        key: "postgresql",
        title: "PostgreSQL",
        topic: "postgresql",
        section: "core-api",
        summary:
          "A production-grade relational database with rich types and constraints.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 420,
      },
      {
        key: "rest-apis",
        title: "REST APIs",
        topic: "rest-apis",
        section: "core-api",
        summary:
          "Design resource-oriented endpoints with clear status codes and payloads.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 480,
      },
      {
        key: "auth",
        title: "Authentication and Authorization",
        topic: "authentication-authorization",
        section: "core-api",
        summary: "Verify who a caller is and what they are allowed to do.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 420,
      },
      {
        key: "unit-testing",
        title: "Testing Server Code",
        topic: "unit-testing",
        section: "delivery",
        summary:
          "Cover handlers, services, and queries with fast automated tests.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
      },
      {
        key: "docker",
        title: "Docker",
        topic: "docker",
        section: "delivery",
        summary:
          "Package your service and its dependencies into portable containers.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 420,
      },
      {
        key: "ci-cd",
        title: "CI/CD",
        topic: "ci-cd",
        section: "delivery",
        summary:
          "Automate testing and delivery so every change is verified and releasable.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
      },
    ],
    edges: [
      { from: "command-line", to: "git", relationship: "PREREQUISITE" },
      { from: "command-line", to: "nodejs", relationship: "PREREQUISITE" },
      { from: "nodejs", to: "sql", relationship: "PREREQUISITE" },
      { from: "nodejs", to: "rest-apis", relationship: "PREREQUISITE" },
      { from: "rest-apis", to: "auth", relationship: "PREREQUISITE" },
      { from: "docker", to: "ci-cd", relationship: "PREREQUISITE" },
      { from: "sql", to: "postgresql", relationship: "RECOMMENDED" },
      { from: "rest-apis", to: "unit-testing", relationship: "RECOMMENDED" },
      { from: "unit-testing", to: "docker", relationship: "RECOMMENDED" },
      { from: "postgresql", to: "rest-apis", relationship: "RELATED" },
    ],
  },
  {
    slug: "full-stack-developer",
    title: "Full-Stack Developer",
    summary:
      "Combine the frontend and backend essentials into one path: browser fundamentals and React on the front, Node.js, SQL, REST, and auth on the back, plus Docker to ship it all.",
    description: `Full-stack developers are comfortable on both sides of the request boundary. This roadmap blends the frontend and backend paths into a single sequence so you build a complete picture of how a modern web application works end to end.

Start with the browser stack — HTML, CSS, and JavaScript — then move into React and TypeScript for the client. The backend half covers Node.js, SQL, REST APIs, and authentication, which is everything you need to back a real product with data and secure endpoints.

The path closes with Docker so you can run the whole thing the same way locally and in deployment. When you finish, you will be able to take a feature from database table to rendered screen and explain every hop in between — the defining skill of a full-stack developer.`,
    audience: "Developers who want to own features from database to browser.",
    prerequisiteNotes: `- Basic computer literacy
- Some programming exposure is helpful; the path still starts from fundamentals`,
    difficulty: "INTERMEDIATE",
    estimatedHours: 420,
    status: "PUBLISHED",
    featured: true,
    order: 4,
    categories: ["frontend", "backend"],
    sections: [
      { key: "foundations", title: "Foundations" },
      { key: "frontend-core", title: "Frontend Core" },
      { key: "backend-core", title: "Backend Core" },
      { key: "ship-it", title: "Shipping" },
    ],
    nodes: [
      {
        key: "html",
        title: "HTML",
        topic: "html",
        section: "foundations",
        summary: "Semantic structure for the pages you will build and serve.",
        difficulty: "BEGINNER",
        estimatedMinutes: 300,
      },
      {
        key: "css",
        title: "CSS",
        topic: "css",
        section: "foundations",
        summary: "Style and lay out pages, including responsive behavior.",
        difficulty: "BEGINNER",
        estimatedMinutes: 480,
      },
      {
        key: "javascript",
        title: "JavaScript",
        topic: "javascript",
        section: "foundations",
        summary: "The shared language of your client and server code.",
        difficulty: "BEGINNER",
        estimatedMinutes: 900,
      },
      {
        key: "react",
        title: "React",
        topic: "react",
        section: "frontend-core",
        summary:
          "Component-driven interfaces that render from application state.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 840,
      },
      {
        key: "typescript",
        title: "TypeScript",
        topic: "typescript",
        section: "frontend-core",
        summary:
          "Typed JavaScript across client and server for fewer runtime surprises.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 420,
        required: false,
      },
      {
        key: "nodejs",
        title: "Node.js",
        topic: "nodejs",
        section: "backend-core",
        summary:
          "Server-side JavaScript for handling requests and business logic.",
        difficulty: "BEGINNER",
        estimatedMinutes: 720,
      },
      {
        key: "sql",
        title: "SQL",
        topic: "sql",
        section: "backend-core",
        summary: "Persist and retrieve application data in relational tables.",
        difficulty: "BEGINNER",
        estimatedMinutes: 540,
      },
      {
        key: "rest-apis",
        title: "REST APIs",
        topic: "rest-apis",
        section: "backend-core",
        summary: "The contract between your frontend and backend.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 420,
      },
      {
        key: "auth",
        title: "Authentication and Authorization",
        topic: "authentication-authorization",
        section: "backend-core",
        summary: "Sign users in and gate features on who they are.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 420,
      },
      {
        key: "docker",
        title: "Docker",
        topic: "docker",
        section: "ship-it",
        summary:
          "Run the whole stack in containers that behave the same everywhere.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
      },
    ],
    edges: [
      { from: "html", to: "css", relationship: "PREREQUISITE" },
      { from: "css", to: "javascript", relationship: "PREREQUISITE" },
      { from: "javascript", to: "react", relationship: "PREREQUISITE" },
      { from: "javascript", to: "nodejs", relationship: "PREREQUISITE" },
      { from: "nodejs", to: "sql", relationship: "PREREQUISITE" },
      { from: "rest-apis", to: "auth", relationship: "PREREQUISITE" },
      { from: "react", to: "typescript", relationship: "RECOMMENDED" },
      { from: "sql", to: "rest-apis", relationship: "RECOMMENDED" },
      { from: "auth", to: "docker", relationship: "RECOMMENDED" },
      { from: "react", to: "rest-apis", relationship: "OPTIONAL" },
      { from: "typescript", to: "auth", relationship: "RELATED" },
    ],
  },
  {
    slug: "javascript-developer",
    title: "JavaScript Developer",
    summary:
      "A focused ladder into JavaScript: programming fundamentals, the language itself, the browser and Node runtimes, data structures, and testing.",
    description: `This roadmap is for people who want to get genuinely good at JavaScript rather than sampling a bit of everything. It assumes you are new to programming and builds up from first principles: how programs think, how JavaScript expresses those ideas, and where the language runs.

The core of the path is the language itself — values, functions, objects, and asynchronous behavior — followed by the two environments that matter, the browser and Node.js. Along the way you will study data structures in a JavaScript context and finish with automated testing, so the code you write stays reliable as it grows.

JavaScript is one of the few languages that works everywhere, and this path is designed so you can move into frontend, backend, or full-stack work afterwards without relearning the basics.`,
    audience:
      "Beginners who want deep JavaScript skills as their first language.",
    prerequisiteNotes: `- No programming experience required
- A computer with Node.js installed for practice`,
    difficulty: "BEGINNER",
    estimatedHours: 300,
    status: "PUBLISHED",
    featured: false,
    order: 5,
    categories: ["languages"],
    sections: [
      { key: "fundamentals", title: "Fundamentals" },
      { key: "language", title: "The Language" },
      { key: "ecosystem", title: "Runtime and Ecosystem" },
    ],
    nodes: [
      {
        key: "programming-fundamentals",
        title: "Programming Fundamentals",
        topic: "programming-fundamentals",
        section: "fundamentals",
        summary:
          "Variables, control flow, functions, and decomposing problems.",
        difficulty: "BEGINNER",
        estimatedMinutes: 600,
      },
      {
        key: "command-line",
        title: "Command Line",
        topic: "command-line",
        section: "fundamentals",
        summary: "Run scripts and manage projects from the terminal.",
        difficulty: "BEGINNER",
        estimatedMinutes: 240,
      },
      {
        key: "git",
        title: "Version Control with Git",
        topic: "version-control-git",
        section: "fundamentals",
        summary:
          "Save points for your code and the basis of team collaboration.",
        difficulty: "BEGINNER",
        estimatedMinutes: 240,
      },
      {
        key: "javascript",
        title: "JavaScript",
        topic: "javascript",
        section: "language",
        summary:
          "The language in depth: types, functions, objects, and async patterns.",
        difficulty: "BEGINNER",
        estimatedMinutes: 1080,
      },
      {
        key: "http",
        title: "HTTP and the Web",
        topic: "http-and-web",
        section: "language",
        summary:
          "How JavaScript code sends and receives data across the network.",
        difficulty: "BEGINNER",
        estimatedMinutes: 240,
      },
      {
        key: "data-structures",
        title: "Data Structures in JavaScript",
        topic: "data-structures-algorithms",
        section: "language",
        summary:
          "Arrays, maps, and sets used idiomatically, plus complexity basics.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 420,
      },
      {
        key: "nodejs",
        title: "Node.js",
        topic: "nodejs",
        section: "ecosystem",
        summary:
          "Run JavaScript outside the browser and build servers and tools.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 540,
        required: false,
      },
      {
        key: "automated-testing",
        title: "Testing JavaScript",
        topic: "automated-testing",
        section: "ecosystem",
        summary: "Write and run automated tests for the code you ship.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
      },
    ],
    edges: [
      {
        from: "programming-fundamentals",
        to: "command-line",
        relationship: "PREREQUISITE",
      },
      {
        from: "programming-fundamentals",
        to: "javascript",
        relationship: "PREREQUISITE",
      },
      { from: "command-line", to: "git", relationship: "PREREQUISITE" },
      { from: "javascript", to: "nodejs", relationship: "PREREQUISITE" },
      { from: "javascript", to: "http", relationship: "RECOMMENDED" },
      {
        from: "javascript",
        to: "data-structures",
        relationship: "RECOMMENDED",
      },
      { from: "http", to: "nodejs", relationship: "RECOMMENDED" },
      { from: "nodejs", to: "automated-testing", relationship: "RECOMMENDED" },
      { from: "javascript", to: "automated-testing", relationship: "OPTIONAL" },
    ],
  },
  {
    slug: "typescript-developer",
    title: "TypeScript Developer",
    summary:
      "Move from JavaScript to TypeScript and apply typed code across Node.js services, React apps, testing, and design patterns.",
    description: `TypeScript adds a type system to JavaScript, catching whole classes of bugs before the code ever runs. This roadmap assumes you already write basic JavaScript and shows you how to think in types, then apply that discipline in real application code.

The first section rebuilds your mental model: how types, interfaces, generics, and the inference engine work together. From there you apply TypeScript on a server with Node.js and REST APIs, and optionally on the client with React, so you see the same tooling in both places.

The final stretch covers testing typed code and the design patterns that TypeScript makes safer to express. When you finish, you will reach for types deliberately, design clearer module boundaries, and maintain larger codebases with far more confidence.`,
    audience:
      "JavaScript developers who want type safety in professional codebases.",
    prerequisiteNotes: `- Working JavaScript: functions, objects, arrays, and async/await
- Comfort with a code editor and the command line`,
    difficulty: "INTERMEDIATE",
    estimatedHours: 240,
    status: "PUBLISHED",
    featured: false,
    order: 6,
    categories: ["languages", "frontend"],
    sections: [
      { key: "language-fundamentals", title: "Type System Fundamentals" },
      { key: "typing-in-practice", title: "Types in Practice" },
      { key: "application-development", title: "Application Development" },
    ],
    nodes: [
      {
        key: "javascript",
        title: "JavaScript",
        topic: "javascript",
        section: "language-fundamentals",
        summary:
          "The untyped language TypeScript builds on; solid fluency is assumed.",
        difficulty: "BEGINNER",
        estimatedMinutes: 900,
      },
      {
        key: "typescript",
        title: "TypeScript",
        topic: "typescript",
        section: "language-fundamentals",
        summary:
          "Annotations, interfaces, generics, narrowing, and the inference model.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 720,
      },
      {
        key: "data-structures",
        title: "Data Structures with Types",
        topic: "data-structures-algorithms",
        section: "typing-in-practice",
        summary:
          "Model collections and algorithms in a way the type checker can verify.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
      },
      {
        key: "nodejs",
        title: "Node.js with TypeScript",
        topic: "nodejs",
        section: "application-development",
        summary: "Run and structure typed server-side projects.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 480,
      },
      {
        key: "rest-apis",
        title: "Typed REST APIs",
        topic: "rest-apis",
        section: "application-development",
        summary: "Share request and response types across an API boundary.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
      },
      {
        key: "react",
        title: "React with TypeScript",
        topic: "react",
        section: "application-development",
        summary: "Type props, state, and hooks in component-driven apps.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 540,
        required: false,
      },
      {
        key: "unit-testing",
        title: "Testing Typed Code",
        topic: "unit-testing",
        section: "application-development",
        summary: "Write unit tests that lean on types for safer refactors.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 300,
      },
      {
        key: "design-patterns",
        title: "Design Patterns",
        topic: "design-patterns",
        section: "application-development",
        summary: "Common structures expressed clearly and type-safely.",
        difficulty: "ADVANCED",
        estimatedMinutes: 360,
      },
    ],
    edges: [
      { from: "javascript", to: "typescript", relationship: "PREREQUISITE" },
      { from: "typescript", to: "nodejs", relationship: "PREREQUISITE" },
      {
        from: "typescript",
        to: "data-structures",
        relationship: "RECOMMENDED",
      },
      { from: "nodejs", to: "rest-apis", relationship: "RECOMMENDED" },
      { from: "rest-apis", to: "unit-testing", relationship: "RECOMMENDED" },
      { from: "rest-apis", to: "design-patterns", relationship: "RECOMMENDED" },
      { from: "typescript", to: "react", relationship: "OPTIONAL" },
      {
        from: "data-structures",
        to: "design-patterns",
        relationship: "RELATED",
      },
    ],
  },
  {
    slug: "react-developer",
    title: "React Developer",
    summary:
      "A React-specific ladder from browser basics through components, state management, TypeScript, accessibility, testing, and performance.",
    description: `React rewards developers who understand what is happening underneath the framework. This roadmap starts with the browser fundamentals React assumes — HTML, CSS, and JavaScript — before introducing the component model itself.

The middle of the path covers React in earnest: composing components, managing state as applications grow, and optionally adopting TypeScript for safer props and hooks. The final section is what separates competent React code from production React code: accessibility so everyone can use your app, automated tests so refactors stay safe, and performance work so interfaces stay responsive.

By the end you will be able to build and maintain a realistic single-page application with disciplined state, tested components, and the habits of a professional frontend engineer.`,
    audience:
      "Developers who know some JavaScript and want to specialize in React.",
    prerequisiteNotes: `- Basic JavaScript, including functions and array methods
- Familiarity with HTML and CSS at a beginner level helps`,
    difficulty: "INTERMEDIATE",
    estimatedHours: 320,
    status: "PUBLISHED",
    featured: false,
    order: 7,
    categories: ["frontend"],
    sections: [
      { key: "foundations", title: "Browser Foundations" },
      { key: "core-react", title: "Core React" },
      { key: "quality-scale", title: "Quality at Scale" },
    ],
    nodes: [
      {
        key: "html",
        title: "HTML",
        topic: "html",
        section: "foundations",
        summary:
          "Semantic structure that React components will ultimately render.",
        difficulty: "BEGINNER",
        estimatedMinutes: 240,
      },
      {
        key: "css",
        title: "CSS",
        topic: "css",
        section: "foundations",
        summary: "Styling approaches used with component-based interfaces.",
        difficulty: "BEGINNER",
        estimatedMinutes: 360,
      },
      {
        key: "javascript",
        title: "JavaScript",
        topic: "javascript",
        section: "foundations",
        summary: "The language fundamentals React components are written in.",
        difficulty: "BEGINNER",
        estimatedMinutes: 720,
      },
      {
        key: "react",
        title: "React",
        topic: "react",
        section: "core-react",
        summary: "Components, props, state, effects, and the rendering model.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 960,
      },
      {
        key: "typescript",
        title: "TypeScript for React",
        topic: "typescript",
        section: "core-react",
        summary:
          "Typed props, state, and hooks to catch mistakes at compile time.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
        required: false,
      },
      {
        key: "state-management",
        title: "State Management",
        topic: "state-management",
        section: "core-react",
        summary: "Patterns for shared and server state as the app grows.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 420,
      },
      {
        key: "accessibility",
        title: "Accessibility",
        topic: "accessibility",
        section: "quality-scale",
        summary:
          "Keyboard support, semantics, and ARIA in component libraries.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 300,
      },
      {
        key: "unit-testing",
        title: "Testing React Components",
        topic: "unit-testing",
        section: "quality-scale",
        summary:
          "Test components and hooks the way users actually interact with them.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
      },
      {
        key: "web-performance",
        title: "React Performance",
        topic: "web-performance",
        section: "quality-scale",
        summary:
          "Measure renders, cut wasted work, and keep interfaces snappy.",
        difficulty: "ADVANCED",
        estimatedMinutes: 360,
      },
    ],
    edges: [
      { from: "html", to: "css", relationship: "PREREQUISITE" },
      { from: "css", to: "javascript", relationship: "PREREQUISITE" },
      { from: "javascript", to: "react", relationship: "PREREQUISITE" },
      { from: "react", to: "state-management", relationship: "PREREQUISITE" },
      { from: "react", to: "typescript", relationship: "RECOMMENDED" },
      { from: "react", to: "accessibility", relationship: "RECOMMENDED" },
      { from: "react", to: "unit-testing", relationship: "RECOMMENDED" },
      {
        from: "accessibility",
        to: "web-performance",
        relationship: "RECOMMENDED",
      },
      {
        from: "state-management",
        to: "web-performance",
        relationship: "RELATED",
      },
      { from: "typescript", to: "unit-testing", relationship: "OPTIONAL" },
    ],
  },
  {
    slug: "php-developer",
    title: "PHP Developer",
    summary:
      "Learn PHP from the ground up — syntax, the web request lifecycle, SQL persistence, REST endpoints, and an optional path into Laravel.",
    description: `PHP still powers a huge share of the web, and it remains one of the friendliest languages for getting a real application online quickly. This roadmap starts with terminal and programming fundamentals, then goes deep on PHP itself: syntax, functions, arrays, and how a PHP script fits into the request lifecycle of a web server.

The middle sections connect PHP to the data layer and the outside world. You will learn SQL to store application data, design REST endpoints over HTTP, and follow the well-trodden path from plain PHP into Laravel, the framework most professional PHP teams use.

Testing closes the path, so the code you write stays dependable. Finish here and you can either continue deepening Laravel skills or take your PHP foundations into another framework with ease.`,
    audience:
      "Beginners who want to build and maintain PHP applications for the web.",
    prerequisiteNotes: `- Basic computer literacy
- No prior programming experience assumed, though any exposure helps`,
    difficulty: "BEGINNER",
    estimatedHours: 280,
    status: "PUBLISHED",
    featured: false,
    order: 8,
    categories: ["languages", "backend"],
    sections: [
      { key: "foundations", title: "Foundations" },
      { key: "php-language", title: "PHP and the Web" },
      { key: "web-applications", title: "Web Applications" },
    ],
    nodes: [
      {
        key: "programming-fundamentals",
        title: "Programming Fundamentals",
        topic: "programming-fundamentals",
        section: "foundations",
        summary: "Core problem-solving ideas that transfer into any language.",
        difficulty: "BEGINNER",
        estimatedMinutes: 480,
      },
      {
        key: "command-line",
        title: "Command Line",
        topic: "command-line",
        section: "foundations",
        summary: "Run PHP scripts and manage dependencies from the terminal.",
        difficulty: "BEGINNER",
        estimatedMinutes: 240,
      },
      {
        key: "http",
        title: "HTTP and the Web",
        topic: "http-and-web",
        section: "foundations",
        summary:
          "Requests, responses, and how PHP scripts plug into that cycle.",
        difficulty: "BEGINNER",
        estimatedMinutes: 240,
      },
      {
        key: "php",
        title: "PHP",
        topic: "php",
        section: "php-language",
        summary:
          "Language syntax, functions, arrays, and common built-in tools.",
        difficulty: "BEGINNER",
        estimatedMinutes: 840,
      },
      {
        key: "sql",
        title: "SQL",
        topic: "sql",
        section: "php-language",
        summary: "Query and model the data your PHP applications store.",
        difficulty: "BEGINNER",
        estimatedMinutes: 480,
      },
      {
        key: "rest-apis",
        title: "REST APIs in PHP",
        topic: "rest-apis",
        section: "web-applications",
        summary:
          "Expose JSON endpoints that browsers and mobile apps can consume.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
      },
      {
        key: "laravel",
        title: "Laravel",
        topic: "laravel",
        section: "web-applications",
        summary:
          "The dominant PHP framework: routing, Eloquent, and the ecosystem.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 720,
      },
      {
        key: "unit-testing",
        title: "Testing PHP Code",
        topic: "unit-testing",
        section: "web-applications",
        summary: "Automated tests for your application logic and endpoints.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 300,
      },
    ],
    edges: [
      {
        from: "programming-fundamentals",
        to: "command-line",
        relationship: "PREREQUISITE",
      },
      {
        from: "programming-fundamentals",
        to: "php",
        relationship: "PREREQUISITE",
      },
      { from: "command-line", to: "php", relationship: "PREREQUISITE" },
      { from: "php", to: "sql", relationship: "PREREQUISITE" },
      { from: "http", to: "php", relationship: "RECOMMENDED" },
      { from: "sql", to: "rest-apis", relationship: "RECOMMENDED" },
      { from: "php", to: "laravel", relationship: "RECOMMENDED" },
      { from: "laravel", to: "unit-testing", relationship: "RECOMMENDED" },
      { from: "rest-apis", to: "unit-testing", relationship: "OPTIONAL" },
    ],
  },
  {
    slug: "laravel-developer",
    title: "Laravel Developer",
    summary:
      "Go from PHP fluency to professional Laravel work: routing and Eloquent, REST APIs, authentication, PostgreSQL, testing, and containerized delivery.",
    description: `Laravel is the framework behind a large share of modern PHP applications. This roadmap assumes you already know PHP and takes you through the framework the way working teams use it: routing and controllers, Eloquent for data access, and the conventions that make Laravel projects legible to any new team member.

The core section covers the skills every Laravel production app needs — REST-style endpoints, authentication and authorization, and a serious PostgreSQL setup rather than the defaults. These are the pieces that turn a tutorial project into something you can deploy.

The final section is about delivery confidence: automated tests, Docker, and CI so changes ship safely. Completing this path means you can join a Laravel team and contribute to real codebases from day one.`,
    audience:
      "PHP developers who want to build production applications with Laravel.",
    prerequisiteNotes: `- Solid PHP: syntax, classes, and Composer basics
- Basic SQL knowledge strongly recommended`,
    difficulty: "INTERMEDIATE",
    estimatedHours: 300,
    status: "PUBLISHED",
    featured: false,
    order: 9,
    categories: ["backend", "languages"],
    sections: [
      { key: "php-foundations", title: "PHP Foundations" },
      { key: "laravel-core", title: "Laravel Core" },
      { key: "production-practices", title: "Production Practices" },
    ],
    nodes: [
      {
        key: "php",
        title: "PHP",
        topic: "php",
        section: "php-foundations",
        summary:
          "Modern PHP, including Composer and the ecosystem Laravel builds on.",
        difficulty: "BEGINNER",
        estimatedMinutes: 720,
      },
      {
        key: "sql",
        title: "SQL",
        topic: "sql",
        section: "php-foundations",
        summary: "Relational modeling and querying underpinning Eloquent.",
        difficulty: "BEGINNER",
        estimatedMinutes: 420,
      },
      {
        key: "laravel",
        title: "Laravel",
        topic: "laravel",
        section: "laravel-core",
        summary: "Routing, controllers, Eloquent, validation, and Blade views.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 960,
      },
      {
        key: "rest-apis",
        title: "REST APIs with Laravel",
        topic: "rest-apis",
        section: "laravel-core",
        summary:
          "Build JSON APIs with resources, pagination, and consistent errors.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
      },
      {
        key: "auth",
        title: "Authentication and Authorization",
        topic: "authentication-authorization",
        section: "laravel-core",
        summary: "Sessions, tokens, policies, and gates for real user models.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
      },
      {
        key: "postgresql",
        title: "PostgreSQL",
        topic: "postgresql",
        section: "laravel-core",
        summary: "Run Laravel against a production-grade relational database.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 300,
      },
      {
        key: "automated-testing",
        title: "Testing Laravel Apps",
        topic: "automated-testing",
        section: "production-practices",
        summary: "Feature and unit tests with the framework's testing tools.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
      },
      {
        key: "docker",
        title: "Docker",
        topic: "docker",
        section: "production-practices",
        summary:
          "Containerize a Laravel app and its database for consistent environments.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 300,
        required: false,
      },
      {
        key: "ci-cd",
        title: "CI/CD",
        topic: "ci-cd",
        section: "production-practices",
        summary: "Automate tests and deploys for Laravel projects.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 300,
      },
    ],
    edges: [
      { from: "php", to: "laravel", relationship: "PREREQUISITE" },
      { from: "php", to: "sql", relationship: "PREREQUISITE" },
      { from: "laravel", to: "rest-apis", relationship: "PREREQUISITE" },
      { from: "laravel", to: "auth", relationship: "PREREQUISITE" },
      { from: "docker", to: "ci-cd", relationship: "PREREQUISITE" },
      { from: "sql", to: "postgresql", relationship: "RECOMMENDED" },
      {
        from: "rest-apis",
        to: "automated-testing",
        relationship: "RECOMMENDED",
      },
      { from: "automated-testing", to: "ci-cd", relationship: "RECOMMENDED" },
      { from: "rest-apis", to: "docker", relationship: "OPTIONAL" },
    ],
  },
  {
    slug: "devops-engineer",
    title: "DevOps Engineer",
    summary:
      "An operations-focused path: Linux and the command line, Git, Docker, CI/CD pipelines, cloud fundamentals, and monitoring production systems.",
    description: `DevOps engineers sit between development and operations, making sure software gets built, shipped, and kept running reliably. This roadmap is for developers or sysadmins moving in that direction, and it starts where all operations work starts: Linux and a strong command line.

The middle of the path covers the delivery toolchain. You will containerize applications with Docker, wire builds and tests into CI/CD pipelines, and learn how cloud platforms provide the compute, networking, and storage those pipelines deploy into. Git appears early because infrastructure and application code are increasingly managed the same way.

The final section is monitoring and observability — knowing whether the systems you shipped are healthy, and diagnosing them when they are not. Finish this path and you will be able to take a codebase from commit to a monitored deployment on a cloud platform.`,
    audience: "Developers and sysadmins moving into DevOps and platform roles.",
    prerequisiteNotes: `- Comfort with developer machines and installing tools
- Some scripting or programming exposure recommended
- Access to a Linux environment (local VM or cloud instance) for practice`,
    difficulty: "ADVANCED",
    estimatedHours: 360,
    status: "PUBLISHED",
    featured: false,
    order: 10,
    categories: ["devops"],
    sections: [
      { key: "foundations", title: "Systems Foundations" },
      { key: "containers-delivery", title: "Containers and Delivery" },
      { key: "operations", title: "Running in Production" },
    ],
    nodes: [
      {
        key: "linux-basics",
        title: "Linux Basics",
        topic: "linux-basics",
        section: "foundations",
        summary:
          "Filesystem, permissions, services, and processes on Linux systems.",
        difficulty: "BEGINNER",
        estimatedMinutes: 600,
      },
      {
        key: "command-line",
        title: "Command Line",
        topic: "command-line",
        section: "foundations",
        summary:
          "Shell fluency: pipes, redirection, and scripting everyday tasks.",
        difficulty: "BEGINNER",
        estimatedMinutes: 420,
      },
      {
        key: "git",
        title: "Version Control with Git",
        topic: "version-control-git",
        section: "foundations",
        summary:
          "Manage infrastructure and application code with the same discipline as developers.",
        difficulty: "BEGINNER",
        estimatedMinutes: 240,
      },
      {
        key: "docker",
        title: "Docker",
        topic: "docker",
        section: "containers-delivery",
        summary:
          "Build images, run containers, and manage volumes and networks.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 600,
      },
      {
        key: "ci-cd",
        title: "CI/CD",
        topic: "ci-cd",
        section: "containers-delivery",
        summary:
          "Automated pipelines that build, test, and deploy on every change.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 480,
      },
      {
        key: "cloud-fundamentals",
        title: "Cloud Fundamentals",
        topic: "cloud-fundamentals",
        section: "containers-delivery",
        summary:
          "Compute, storage, and networking abstractions across major providers.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 540,
      },
      {
        key: "monitoring-observability",
        title: "Monitoring and Observability",
        topic: "monitoring-observability",
        section: "operations",
        summary:
          "Metrics, logs, and traces that tell you what production is doing.",
        difficulty: "ADVANCED",
        estimatedMinutes: 480,
      },
      {
        key: "system-design",
        title: "System Design for Operators",
        topic: "system-design",
        section: "operations",
        summary:
          "Reason about reliability, scaling, and failure domains of hosted systems.",
        difficulty: "ADVANCED",
        estimatedMinutes: 360,
        required: false,
      },
    ],
    edges: [
      {
        from: "linux-basics",
        to: "command-line",
        relationship: "PREREQUISITE",
      },
      { from: "command-line", to: "git", relationship: "PREREQUISITE" },
      { from: "command-line", to: "docker", relationship: "PREREQUISITE" },
      { from: "git", to: "ci-cd", relationship: "PREREQUISITE" },
      { from: "docker", to: "ci-cd", relationship: "PREREQUISITE" },
      {
        from: "cloud-fundamentals",
        to: "monitoring-observability",
        relationship: "PREREQUISITE",
      },
      { from: "ci-cd", to: "cloud-fundamentals", relationship: "RECOMMENDED" },
      {
        from: "docker",
        to: "monitoring-observability",
        relationship: "RELATED",
      },
      {
        from: "cloud-fundamentals",
        to: "system-design",
        relationship: "OPTIONAL",
      },
    ],
  },
  {
    slug: "qa-test-engineer",
    title: "QA / Test Engineer",
    summary:
      "A draft path into quality engineering: testing theory, unit and end-to-end automation, and the scripting and CI skills to run tests on every change.",
    description: `Quality engineers protect users from broken software and give teams the confidence to ship. This roadmap is for people moving into QA from development, support, or adjacent roles, and it builds from testing fundamentals toward real automation.

The core sections cover the testing landscape: what automated testing is good for, how unit tests verify logic in isolation, and how end-to-end tests exercise complete user journeys in the browser or against APIs. You will also pick up enough JavaScript and command-line skill to write and run that automation yourself.

The path closes with CI integration so test suites run on every change instead of on someone's laptop. Note that this roadmap is still being drafted; the sequence and topics are solid, but individual topic guides are being expanded.`,
    audience:
      "Career switchers and developers moving into dedicated QA and test engineering.",
    prerequisiteNotes: `- Basic computer literacy
- Willingness to write small amounts of code (JavaScript is used throughout)
- Familiarity with web applications from a user's perspective helps`,
    difficulty: "BEGINNER",
    estimatedHours: 260,
    status: "DRAFT",
    featured: false,
    order: 11,
    categories: ["testing"],
    sections: [
      { key: "foundations", title: "Testing Foundations" },
      { key: "test-types", title: "Test Types" },
      { key: "automation-delivery", title: "Automation and Delivery" },
    ],
    nodes: [
      {
        key: "programming-fundamentals",
        title: "Programming Fundamentals",
        topic: "programming-fundamentals",
        section: "foundations",
        summary: "Enough programming to read, write, and debug test code.",
        difficulty: "BEGINNER",
        estimatedMinutes: 480,
      },
      {
        key: "command-line",
        title: "Command Line",
        topic: "command-line",
        section: "foundations",
        summary: "Run test runners and scripts from the terminal.",
        difficulty: "BEGINNER",
        estimatedMinutes: 240,
      },
      {
        key: "git",
        title: "Version Control with Git",
        topic: "version-control-git",
        section: "foundations",
        summary:
          "Collaborate on test code the same way developers collaborate on features.",
        difficulty: "BEGINNER",
        estimatedMinutes: 240,
      },
      {
        key: "automated-testing",
        title: "Automated Testing",
        topic: "automated-testing",
        section: "test-types",
        summary:
          "Test strategy, the testing pyramid, and when automation pays off.",
        difficulty: "BEGINNER",
        estimatedMinutes: 420,
      },
      {
        key: "unit-testing",
        title: "Unit Testing",
        topic: "unit-testing",
        section: "test-types",
        summary: "Fast, isolated tests for functions and modules.",
        difficulty: "BEGINNER",
        estimatedMinutes: 360,
      },
      {
        key: "end-to-end-testing",
        title: "End-to-End Testing",
        topic: "end-to-end-testing",
        section: "test-types",
        summary: "Browser-driven tests that verify complete user journeys.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 480,
      },
      {
        key: "javascript",
        title: "JavaScript for Test Automation",
        topic: "javascript",
        section: "automation-delivery",
        summary: "The language most modern test tooling is built around.",
        difficulty: "BEGINNER",
        estimatedMinutes: 540,
      },
      {
        key: "ci-cd",
        title: "CI for Test Suites",
        topic: "ci-cd",
        section: "automation-delivery",
        summary:
          "Run automated suites on every change and report results clearly.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 300,
      },
    ],
    edges: [
      {
        from: "programming-fundamentals",
        to: "automated-testing",
        relationship: "PREREQUISITE",
      },
      { from: "command-line", to: "git", relationship: "PREREQUISITE" },
      {
        from: "automated-testing",
        to: "unit-testing",
        relationship: "PREREQUISITE",
      },
      {
        from: "automated-testing",
        to: "end-to-end-testing",
        relationship: "PREREQUISITE",
      },
      { from: "javascript", to: "unit-testing", relationship: "RECOMMENDED" },
      {
        from: "javascript",
        to: "end-to-end-testing",
        relationship: "RECOMMENDED",
      },
      { from: "unit-testing", to: "ci-cd", relationship: "RECOMMENDED" },
      { from: "end-to-end-testing", to: "ci-cd", relationship: "RECOMMENDED" },
      { from: "git", to: "ci-cd", relationship: "RELATED" },
    ],
  },
  {
    slug: "software-architect",
    title: "Software Architect",
    summary:
      "An advanced path into structural decision-making: design patterns, data modeling, system design, integration patterns, and the requirements work that frames them.",
    description: `Software architects decide how systems are shaped: where boundaries go, how data is modeled, and which trade-offs a team is willing to live with. This roadmap is for experienced developers moving toward those decisions, and it starts by refreshing the fundamentals that architecture rests on.

The design section is the heart of the path. You will study classic design patterns, learn to model data deliberately, and work through system design — decomposition, reliability, and scaling — until you can justify structural choices rather than just make them. Integration patterns and REST round out how independent systems talk to each other.

The remaining skills are the human half of architecture: gathering requirements well enough that the right system gets built, and relating technical structure back to business goals. When you finish, you will be able to lead technical design discussions and produce designs other engineers can implement.`,
    audience:
      "Senior developers stepping into system design and technical leadership.",
    prerequisiteNotes: `- Several years of hands-on development experience
- Comfort designing and querying relational databases
- Familiarity with at least one web stack (frontend or backend)`,
    difficulty: "ADVANCED",
    estimatedHours: 340,
    status: "PUBLISHED",
    featured: false,
    order: 12,
    categories: ["architecture", "fundamentals"],
    sections: [
      { key: "foundations", title: "Refresher Foundations" },
      { key: "design", title: "Design Skills" },
      { key: "architecture-in-practice", title: "Architecture in Practice" },
    ],
    nodes: [
      {
        key: "programming-fundamentals",
        title: "Programming Fundamentals",
        topic: "programming-fundamentals",
        section: "foundations",
        summary:
          "Revisit core problem-solving ideas that all design work builds on.",
        difficulty: "BEGINNER",
        estimatedMinutes: 360,
      },
      {
        key: "data-structures",
        title: "Data Structures and Algorithms",
        topic: "data-structures-algorithms",
        section: "foundations",
        summary:
          "Complexity and structure choices that shape system performance.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 420,
      },
      {
        key: "http",
        title: "HTTP and the Web",
        topic: "http-and-web",
        section: "foundations",
        summary: "The protocol vocabulary most distributed systems speak.",
        difficulty: "BEGINNER",
        estimatedMinutes: 240,
      },
      {
        key: "design-patterns",
        title: "Design Patterns",
        topic: "design-patterns",
        section: "design",
        summary:
          "Reusable solutions to recurring object and module design problems.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 480,
      },
      {
        key: "data-modeling",
        title: "Data Modeling",
        topic: "data-modeling",
        section: "design",
        summary:
          "Shape schemas around invariants, access patterns, and change.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 420,
      },
      {
        key: "system-design",
        title: "System Design",
        topic: "system-design",
        section: "design",
        summary: "Decompose systems, reason about failure, and plan for scale.",
        difficulty: "ADVANCED",
        estimatedMinutes: 720,
      },
      {
        key: "rest-apis",
        title: "REST API Design",
        topic: "rest-apis",
        section: "architecture-in-practice",
        summary:
          "Contract design for services that must outlive their implementations.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 300,
      },
      {
        key: "integration-patterns",
        title: "Integration Patterns",
        topic: "integration-patterns",
        section: "architecture-in-practice",
        summary:
          "Queues, events, and other ways independent systems stay in sync.",
        difficulty: "ADVANCED",
        estimatedMinutes: 420,
      },
      {
        key: "requirements-gathering",
        title: "Requirements Gathering",
        topic: "requirements-gathering",
        section: "architecture-in-practice",
        summary: "Elicit and refine what a system must do before designing it.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 240,
        required: false,
      },
    ],
    edges: [
      {
        from: "programming-fundamentals",
        to: "data-structures",
        relationship: "PREREQUISITE",
      },
      {
        from: "programming-fundamentals",
        to: "design-patterns",
        relationship: "PREREQUISITE",
      },
      {
        from: "design-patterns",
        to: "system-design",
        relationship: "PREREQUISITE",
      },
      {
        from: "data-modeling",
        to: "system-design",
        relationship: "PREREQUISITE",
      },
      { from: "http", to: "rest-apis", relationship: "PREREQUISITE" },
      {
        from: "rest-apis",
        to: "integration-patterns",
        relationship: "RECOMMENDED",
      },
      {
        from: "system-design",
        to: "integration-patterns",
        relationship: "RECOMMENDED",
      },
      {
        from: "data-structures",
        to: "data-modeling",
        relationship: "RECOMMENDED",
      },
      {
        from: "requirements-gathering",
        to: "system-design",
        relationship: "RELATED",
      },
      {
        from: "design-patterns",
        to: "data-modeling",
        relationship: "OPTIONAL",
      },
    ],
  },
  {
    slug: "business-systems-developer",
    title: "Business Systems Developer",
    summary:
      "Build software that mirrors how companies actually work: requirements gathering, process modeling, data modeling, SQL, REST integration, and reporting.",
    description: `Business systems developers translate how an organization runs into software that supports it. This roadmap is for developers who want to work on internal tools, line-of-business applications, and the integrations that connect them, and it starts on the business side rather than the code.

The first section covers eliciting requirements and modeling business processes, so you understand the work a system must support. The middle section turns those models into data: SQL and data modeling for the core store, REST APIs for access, and integration patterns for talking to the other systems a company already owns.

The path ends with reporting and analytics, because business systems are judged by the decisions they enable. When you complete it, you will be able to take a messy real-world process from interview notes to a working, integrated application with useful reporting.`,
    audience:
      "Developers building internal tools and line-of-business applications.",
    prerequisiteNotes: `- Basic programming ability in any language
- Access to (or willingness to invent) a realistic business process to practice against`,
    difficulty: "INTERMEDIATE",
    estimatedHours: 300,
    status: "PUBLISHED",
    featured: false,
    order: 13,
    categories: ["business", "backend"],
    sections: [
      { key: "business-foundations", title: "Business Foundations" },
      { key: "data-and-integration", title: "Data and Integration" },
      { key: "delivery", title: "Insights and Delivery" },
    ],
    nodes: [
      {
        key: "requirements-gathering",
        title: "Requirements Gathering",
        topic: "requirements-gathering",
        section: "business-foundations",
        summary:
          "Interview stakeholders and turn fuzzy asks into testable requirements.",
        difficulty: "BEGINNER",
        estimatedMinutes: 300,
      },
      {
        key: "business-process-modeling",
        title: "Business Process Modeling",
        topic: "business-process-modeling",
        section: "business-foundations",
        summary: "Map how work actually flows through an organization today.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
      },
      {
        key: "data-modeling",
        title: "Data Modeling",
        topic: "data-modeling",
        section: "data-and-integration",
        summary:
          "Translate processes into entities, relationships, and invariants.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 420,
      },
      {
        key: "sql",
        title: "SQL",
        topic: "sql",
        section: "data-and-integration",
        summary:
          "Implement and query the relational core of a business system.",
        difficulty: "BEGINNER",
        estimatedMinutes: 540,
      },
      {
        key: "postgresql",
        title: "PostgreSQL",
        topic: "postgresql",
        section: "data-and-integration",
        summary:
          "Constraints, transactions, and reporting-friendly features in practice.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 300,
      },
      {
        key: "rest-apis",
        title: "REST APIs",
        topic: "rest-apis",
        section: "data-and-integration",
        summary:
          "Expose system capabilities to other apps and user interfaces.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
      },
      {
        key: "integration-patterns",
        title: "Integration Patterns",
        topic: "integration-patterns",
        section: "data-and-integration",
        summary:
          "Connect to ERPs, CRMs, and legacy systems without fragile point-to-point glue.",
        difficulty: "ADVANCED",
        estimatedMinutes: 420,
      },
      {
        key: "reporting-analytics",
        title: "Reporting and Analytics",
        topic: "reporting-analytics",
        section: "delivery",
        summary: "Turn system data into reports that drive business decisions.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 360,
      },
      {
        key: "unit-testing",
        title: "Testing Business Logic",
        topic: "unit-testing",
        section: "delivery",
        summary: "Protect rules and calculations with automated tests.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 240,
        required: false,
      },
    ],
    edges: [
      {
        from: "requirements-gathering",
        to: "business-process-modeling",
        relationship: "PREREQUISITE",
      },
      {
        from: "business-process-modeling",
        to: "data-modeling",
        relationship: "PREREQUISITE",
      },
      { from: "data-modeling", to: "sql", relationship: "PREREQUISITE" },
      {
        from: "rest-apis",
        to: "integration-patterns",
        relationship: "PREREQUISITE",
      },
      { from: "sql", to: "postgresql", relationship: "RECOMMENDED" },
      { from: "sql", to: "rest-apis", relationship: "RECOMMENDED" },
      {
        from: "integration-patterns",
        to: "reporting-analytics",
        relationship: "RECOMMENDED",
      },
      {
        from: "data-modeling",
        to: "reporting-analytics",
        relationship: "RECOMMENDED",
      },
      {
        from: "postgresql",
        to: "integration-patterns",
        relationship: "RELATED",
      },
      { from: "rest-apis", to: "unit-testing", relationship: "OPTIONAL" },
    ],
  },
];
