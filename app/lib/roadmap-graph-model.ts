import type {
  Difficulty,
  EdgeRelationship,
  PublicationStatus,
} from "~/generated/prisma/client";

/**
 * Serialisable shape of a roadmap graph used by the admin visual editor. Kept
 * free of Prisma runtime imports (types only) so the editor client bundle can
 * consume it, while the server service and routes share the same contract.
 */

export interface AdminGraphSection {
  id: string;
  title: string;
  color: string | null;
  order: number;
}

export interface AdminGraphNode {
  id: string;
  sectionId: string | null;
  topicId: string | null;
  title: string;
  summary: string;
  x: number;
  y: number;
  width: number | null;
  height: number | null;
  difficulty: Difficulty | null;
  estimatedMinutes: number | null;
  required: boolean;
  order: number;
}

export interface AdminGraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: EdgeRelationship;
  order: number;
}

export interface AdminGraphTopicOption {
  id: string;
  slug: string;
  title: string;
}

export interface AdminRoadmapGraphMeta {
  id: string;
  slug: string;
  title: string;
  status: PublicationStatus;
  /** Bumped on every graph save so the editor remounts with fresh ids. */
  revision: number;
}

export interface AdminRoadmapGraph {
  roadmap: AdminRoadmapGraphMeta;
  sections: AdminGraphSection[];
  nodes: AdminGraphNode[];
  edges: AdminGraphEdge[];
  topics: AdminGraphTopicOption[];
}
