import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type MouseEvent,
} from "react";
import { useNavigate } from "react-router";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useOnSelectionChange,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Badge } from "~/components/ui/badge";
import { formatDifficulty, formatMinutes } from "~/lib/format";
import { relationshipMeta, type GraphLayout } from "~/lib/roadmap-graph";
import { cn } from "~/lib/utils";

/** Muted stroke used to fade edges that are not part of the focused chain. */
const DIMMED_EDGE_STROKE = "#cfc7b2";
const FALLBACK_SECTION_COLOR = "#8d8264";

/**
 * Visual state of a topic node relative to the node the visitor is hovering or
 * has focused. Exactly one node is ever `focused`; its direct dependencies are
 * `related`, everything else fades to `dimmed`.
 */
type NodeState = "default" | "focused" | "related" | "dimmed";

type TopicNodeData = {
  title: string;
  summary?: string | null;
  difficultyLabel: string | null;
  durationLabel: string | null;
  required: boolean;
  topicSlug: string | null;
  sectionColor: string | null;
};

type SectionNodeData = {
  title: string;
  color: string | null;
  nodeCount: number;
};

type TopicNode = Node<TopicNodeData, "topic">;
type SectionNode = Node<SectionNodeData, "section">;

/**
 * Focus state lives in React context rather than on `node.data`. Updating node
 * data would hand React Flow new node objects on every hover, which drops the
 * internally measured dimensions/handle bounds and makes nodes flicker (and
 * their edges momentarily disappear). Reading context keeps node identities
 * stable while still re-rendering the node components.
 */
type FocusState = {
  activeId: string | null;
  relatedIds: ReadonlySet<string>;
};

const EMPTY_RELATED: ReadonlySet<string> = new Set();

const FocusContext = createContext<FocusState>({
  activeId: null,
  relatedIds: EMPTY_RELATED,
});

function nodeStateFor(
  id: string,
  { activeId, relatedIds }: FocusState,
): NodeState {
  if (!activeId) return "default";
  if (activeId === id) return "focused";
  return relatedIds.has(id) ? "related" : "dimmed";
}

function TopicNodeView({ id, data, selected }: NodeProps<TopicNode>) {
  const state = nodeStateFor(id, useContext(FocusContext));
  const dimmed = state === "dimmed";
  const focused = state === "focused";

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col gap-1.5 rounded-xl border bg-card px-3 py-2.5 text-card-foreground shadow-[var(--shadow-neu-sm)] transition-[transform,opacity,box-shadow,border-color] duration-200",
        data.required
          ? "border-foreground/25"
          : "border-dashed border-muted-foreground/60",
        data.topicSlug ? "cursor-pointer" : "cursor-default",
        dimmed
          ? "opacity-30"
          : "hover:-translate-y-0.5 hover:border-foreground/40 motion-reduce:hover:translate-y-0",
        focused && "border-foreground/50 ring-2 ring-foreground/20",
        selected && !focused && "ring-2 ring-ring",
      )}
      style={
        data.sectionColor
          ? { borderTopColor: data.sectionColor, borderTopWidth: 3 }
          : undefined
      }
      title={data.summary ?? undefined}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!size-2 !border-0 !bg-blueprint"
      />
      <span className="line-clamp-2 text-sm leading-tight font-medium">
        {data.title}
      </span>
      {!data.required ? (
        <Badge variant="outline" className="w-fit text-[0.6rem]">
          Optional
        </Badge>
      ) : null}
      {data.difficultyLabel || data.durationLabel ? (
        <div className="mt-auto flex items-center gap-2 text-[0.7rem] text-muted-foreground">
          {data.difficultyLabel ? <span>{data.difficultyLabel}</span> : null}
          {data.durationLabel ? <span>· {data.durationLabel}</span> : null}
        </div>
      ) : null}
      <Handle
        type="source"
        position={Position.Right}
        className="!size-2 !border-0 !bg-blueprint"
      />
    </div>
  );
}

function SectionNodeView({ data }: NodeProps<SectionNode>) {
  const color = data.color ?? FALLBACK_SECTION_COLOR;
  return (
    <div
      className="h-full w-full rounded-2xl border-2 border-dashed bg-muted/20"
      style={{ borderColor: `${color}66` }}
    >
      <div
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold tracking-wide uppercase"
        style={{ color }}
      >
        <span
          aria-hidden
          className="size-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        {data.title}
        <span className="font-normal text-muted-foreground">
          ({data.nodeCount})
        </span>
      </div>
    </div>
  );
}

const nodeTypes = {
  topic: TopicNodeView,
  section: SectionNodeView,
} satisfies NodeTypes;

function minimapNodeColor(node: Node): string {
  if (node.type === "section") {
    return (node.data as SectionNodeData).color ?? FALLBACK_SECTION_COLOR;
  }
  return "#5d7692";
}

function Canvas({ layout }: { layout: GraphLayout }) {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeId = hoveredId ?? selectedId;

  const handleSelectionChange = useCallback(
    ({ nodes: selected }: { nodes: Array<{ id: string }> }) => {
      setSelectedId(selected[0]?.id ?? null);
    },
    [],
  );
  useOnSelectionChange({ onChange: handleSelectionChange });

  const colorBySection = useMemo(
    () =>
      new Map(layout.sections.map((section) => [section.id, section.color])),
    [layout.sections],
  );

  const active = useMemo(() => {
    if (!activeId) return null;
    const ids = new Set<string>([activeId]);
    const edges = new Set<string>();
    for (const edge of layout.edges) {
      if (edge.sourceId === activeId || edge.targetId === activeId) {
        edges.add(edge.id);
        ids.add(edge.sourceId);
        ids.add(edge.targetId);
      }
    }
    return { ids, edges };
  }, [activeId, layout.edges]);

  const focusValue = useMemo<FocusState>(
    () => ({ activeId, relatedIds: active?.ids ?? EMPTY_RELATED }),
    [activeId, active],
  );

  const nodes = useMemo<Node[]>(() => {
    const sectionNodes: Node[] = layout.sections.map((section) => ({
      id: `section-${section.id}`,
      type: "section",
      position: section.position,
      data: {
        title: section.title,
        color: section.color,
        nodeCount: section.nodeCount,
      },
      style: { width: section.width, height: section.height },
      draggable: false,
      selectable: false,
      focusable: false,
      connectable: false,
      className: "pointer-events-none",
    }));

    const topicNodes: Node[] = layout.nodes.map((node) => {
      return {
        id: node.id,
        type: "topic",
        position: node.position,
        style: { width: node.width, height: node.height },
        ariaLabel: [
          node.title,
          node.required ? "required" : "optional",
          node.topic ? "opens topic" : null,
        ]
          .filter(Boolean)
          .join(", "),
        data: {
          title: node.title,
          summary: node.summary,
          difficultyLabel: formatDifficulty(node.difficulty),
          durationLabel: formatMinutes(node.estimatedMinutes),
          required: node.required,
          topicSlug: node.topic?.slug ?? null,
          sectionColor: node.sectionId
            ? (colorBySection.get(node.sectionId) ?? null)
            : null,
        },
        connectable: false,
      };
    });

    return [...sectionNodes, ...topicNodes];
  }, [layout.sections, layout.nodes, colorBySection]);

  const edges = useMemo<Edge[]>(
    () =>
      layout.edges.map((edge) => {
        const meta = relationshipMeta[edge.relationship];
        const isActive = active?.edges.has(edge.id) ?? false;
        const isDimmed = active !== null && !isActive;
        const stroke = isDimmed ? DIMMED_EDGE_STROKE : meta.stroke;

        return {
          id: edge.id,
          source: edge.sourceId,
          target: edge.targetId,
          type: "smoothstep",
          zIndex: isActive ? 1000 : 0,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: stroke,
            width: 16,
            height: 16,
          },
          style: {
            stroke,
            strokeWidth: isActive ? 2.4 : 1.6,
            strokeDasharray: meta.dash,
            opacity: isDimmed ? 0.4 : 1,
            transition: "stroke-width 150ms ease, opacity 150ms ease",
          },
        };
      }),
    [layout.edges, active],
  );

  const handleNodeClick = useCallback(
    (_: MouseEvent, node: Node) => {
      const slug = (node.data as Partial<TopicNodeData>).topicSlug;
      if (slug) navigate(`/topics/${slug}`);
    },
    [navigate],
  );

  const handleNodeMouseEnter = useCallback((_: MouseEvent, node: Node) => {
    if (node.type === "topic") setHoveredId(node.id);
  }, []);

  const handleNodeMouseLeave = useCallback(() => setHoveredId(null), []);

  return (
    <FocusContext.Provider value={focusValue}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onPaneClick={() => setSelectedId(null)}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable
        edgesFocusable={false}
        elementsSelectable
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.15}
        maxZoom={1.75}
        proOptions={{ hideAttribution: false }}
      >
        <Background
          variant={BackgroundVariant.Lines}
          gap={24}
          size={1}
          color="rgba(93, 118, 146, 0.16)"
        />
        <Controls
          showInteractive={false}
          className="overflow-hidden rounded-lg border border-foreground/20 shadow-[var(--shadow-neu-sm)] [&_button]:border-foreground/15 [&_button]:bg-background [&_button]:text-foreground [&_button:hover]:bg-secondary"
        />
        <MiniMap
          pannable
          zoomable
          className="hidden rounded-lg border border-foreground/20 sm:block"
          maskColor="rgba(243, 236, 217, 0.65)"
          nodeColor={minimapNodeColor}
        />
      </ReactFlow>
    </FocusContext.Provider>
  );
}

/**
 * Client-only wrapper around the @xyflow/react canvas. React Flow measures the
 * DOM and touches browser APIs, so it is never rendered during SSR: the
 * interactive graph mounts after hydration and shows a skeleton until then.
 * The roadmap outline is always available as the non-graph alternative.
 */
export default function RoadmapCanvas({ layout }: { layout: GraphLayout }) {
  return (
    <ReactFlowProvider>
      <Canvas layout={layout} />
    </ReactFlowProvider>
  );
}
