import { useCallback, useMemo, type MouseEvent } from "react";
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

type TopicNodeData = {
  title: string;
  summary?: string | null;
  difficultyLabel: string | null;
  durationLabel: string | null;
  required: boolean;
  topicSlug: string | null;
};

type SectionNodeData = {
  title: string;
  color: string | null;
  nodeCount: number;
};

type TopicNode = Node<TopicNodeData, "topic">;
type SectionNode = Node<SectionNodeData, "section">;

function TopicNodeView({ data }: NodeProps<TopicNode>) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col gap-1.5 rounded-xl border bg-card px-3 py-2.5 text-card-foreground shadow-[var(--shadow-neu-sm)] transition-all hover:-translate-y-0.5 hover:border-foreground/30 motion-reduce:hover:translate-y-0",
        data.required
          ? "border-foreground/25"
          : "border-dashed border-muted-foreground/60",
      )}
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
  const color = data.color ?? "#8d8264";
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

function buildModel(layout: GraphLayout) {
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

  const topicNodes: Node[] = layout.nodes.map((node) => ({
    id: node.id,
    type: "topic",
    position: node.position,
    style: { width: node.width, height: node.height },
    data: {
      title: node.title,
      summary: node.summary,
      difficultyLabel: formatDifficulty(node.difficulty),
      durationLabel: formatMinutes(node.estimatedMinutes),
      required: node.required,
      topicSlug: node.topic?.slug ?? null,
    },
    connectable: false,
  }));

  const edges: Edge[] = layout.edges.map((edge) => {
    const meta = relationshipMeta[edge.relationship];
    return {
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      type: "smoothstep",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: meta.stroke,
        width: 18,
        height: 18,
      },
      style: {
        stroke: meta.stroke,
        strokeWidth: 1.6,
        strokeDasharray: meta.dash,
      },
    };
  });

  return { nodes: [...sectionNodes, ...topicNodes], edges };
}

export default function RoadmapCanvas({ layout }: { layout: GraphLayout }) {
  const navigate = useNavigate();
  const { nodes, edges } = useMemo(() => buildModel(layout), [layout]);

  const handleNodeClick = useCallback(
    (_: MouseEvent, node: Node) => {
      const slug = (node.data as TopicNodeData | undefined)?.topicSlug;
      if (slug) navigate(`/topics/${slug}`);
    },
    [navigate],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={handleNodeClick}
      nodesDraggable={false}
      nodesConnectable={false}
      nodesFocusable
      edgesFocusable={false}
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
        nodeColor="#8d8264"
      />
    </ReactFlow>
  );
}
