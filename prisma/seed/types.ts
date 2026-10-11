import type {
  BlockType,
  ContentPointKind,
  Difficulty,
  EdgeRelationship,
  PublicationStatus,
  ResourceKind,
} from "~/generated/prisma/client";

export type {
  BlockType,
  ContentPointKind,
  Difficulty,
  EdgeRelationship,
  PublicationStatus,
  ResourceKind,
};

/** Optional SEO overrides; public services fall back to title/summary. */
export interface SeedSeo {
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: string;
}

export interface SeedCategory {
  slug: string;
  name: string;
  description?: string;
  order?: number;
}

export interface SeedResource {
  url: string;
  title: string;
  summary?: string;
  kind: ResourceKind;
  status: PublicationStatus;
  categories: string[];
}

/** Structured payload stored in TopicContentBlock.data (Json). */
export type SeedBlockData =
  | { items: { text: string }[] }
  | { items: { question: string; answer: string }[] }
  | { headers: string[]; rows: string[][] }
  | { items: { title: string; url: string }[] };

export interface SeedBlock {
  type: BlockType;
  title?: string;
  /** Markdown (or code text when type is CODE). */
  body?: string;
  /** Language tag for CODE blocks. */
  language?: string;
  data?: SeedBlockData;
}

export interface SeedTopicResource {
  url: string;
  note?: string;
}

export interface SeedTopic extends SeedSeo {
  slug: string;
  title: string;
  summary: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  status: PublicationStatus;
  categories: string[];
  resources: SeedTopicResource[];
  /** Topic slugs shown as "related content" on the topic page. */
  related: string[];
  blocks: SeedBlock[];
}

export interface SeedDomainPoint {
  kind: ContentPointKind;
  title: string;
  body: string;
}

export interface SeedBusinessDomain extends SeedSeo {
  slug: string;
  title: string;
  summary: string;
  definition?: string;
  developerRelevance?: string;
  status: PublicationStatus;
  categories: string[];
  /** Topic slugs related to this domain. */
  topics: string[];
  /** Resource URLs related to this domain. */
  resources: string[];
  /** Project slugs related to this domain (must exist in projects data). */
  projects: string[];
  points: SeedDomainPoint[];
}

export interface SeedMilestone {
  title: string;
  body?: string;
}

export interface SeedProject extends SeedSeo {
  slug: string;
  title: string;
  summary: string;
  scenario: string;
  difficulty: Difficulty;
  estimatedHours: number;
  learningGoals?: string;
  requirements?: string;
  features?: string;
  architectureNotes?: string;
  databaseNotes?: string;
  apiNotes?: string;
  testingNotes?: string;
  status: PublicationStatus;
  categories: string[];
  topics: string[];
  domains: string[];
  resources: SeedTopicResource[];
  milestones: SeedMilestone[];
}

export interface SeedSection {
  key: string;
  title: string;
  color?: string;
}

export interface SeedNode {
  /** Stable key used by edges within this roadmap. */
  key: string;
  title: string;
  /** Topic slug this node links to (omit for orientation/grouping nodes). */
  topic?: string;
  /** Section key from the roadmap's sections. */
  section?: string;
  summary?: string;
  required?: boolean;
  difficulty?: Difficulty;
  estimatedMinutes?: number;
}

export interface SeedEdge {
  from: string;
  to: string;
  relationship: EdgeRelationship;
}

export interface SeedRoadmap extends SeedSeo {
  slug: string;
  title: string;
  summary: string;
  description?: string;
  audience?: string;
  prerequisiteNotes?: string;
  difficulty?: Difficulty;
  estimatedHours?: number;
  icon?: string;
  featured?: boolean;
  order?: number;
  status: PublicationStatus;
  categories: string[];
  sections: SeedSection[];
  nodes: SeedNode[];
  edges: SeedEdge[];
}
