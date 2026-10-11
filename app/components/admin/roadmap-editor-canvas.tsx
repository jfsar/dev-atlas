import { useCallback, useMemo, useRef, useState } from "react";
import { Form, Link, useBeforeUnload } from "react-router";
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
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
  type NodeTypes,
  type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ExternalLinkIcon,
  LayersIcon,
  MaximizeIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";

import type { Difficulty, EdgeRelationship } from "~/generated/prisma/client";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { formatDifficulty, formatMinutes } from "~/lib/format";
import type {
  AdminGraphEdge,
  AdminGraphNode,
  AdminRoadmapGraph,
} from "~/lib/roadmap-graph-model";
import { RELATIONSHIP_ORDER, relationshipMeta } from "~/lib/roadmap-graph";
import { cn } from "~/lib/utils";

const NODE_WIDTH = 240;
const NODE_HEIGHT = 112;
const NONE = "__none__";

const DIFFICULTY_OPTIONS: Difficulty[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
];

type EditorNodeData = {
  title: string;
  summary: string;
  required: boolean;
  difficulty: Difficulty | "";
  estimatedMinutes: number | null;
  topicId: string | null;
  sectionId: string | null;
  sectionColor: string | null;
};

type EditorNode = Node<EditorNodeData, "editor">;
type EditorEdge = Edge<{ relationship: EdgeRelationship }>;
type EditorSection = { id: string; title: string; color: string };
type Selection = { type: "node" | "edge"; id: string };

function EditorNodeView({ data, selected }: NodeProps<EditorNode>) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col gap-1.5 rounded-xl border bg-card px-3 py-2.5 text-card-foreground shadow-sm",
        data.required
          ? "border-border"
          : "border-dashed border-muted-foreground/50",
        selected && "ring-2 ring-ring",
      )}
      style={
        data.sectionColor
          ? { borderTopColor: data.sectionColor, borderTopWidth: 3 }
          : undefined
      }
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!size-2 !border-0 !bg-muted-foreground"
      />
      <span className="line-clamp-2 text-sm leading-tight font-medium">
        {data.title}
      </span>
      {!data.required ? (
        <Badge variant="outline" className="w-fit text-[0.6rem]">
          Optional
        </Badge>
      ) : null}
      {data.difficulty || data.estimatedMinutes ? (
        <div className="mt-auto flex items-center gap-2 text-[0.7rem] text-muted-foreground">
          {data.difficulty ? (
            <span>{formatDifficulty(data.difficulty)}</span>
          ) : null}
          {data.estimatedMinutes ? (
            <span>· {formatMinutes(data.estimatedMinutes)}</span>
          ) : null}
        </div>
      ) : null}
      <Handle
        type="source"
        position={Position.Right}
        className="!size-2 !border-0 !bg-muted-foreground"
      />
    </div>
  );
}

const nodeTypes = { editor: EditorNodeView } satisfies NodeTypes;

function styledEdge(edge: EditorEdge): EditorEdge {
  const meta = relationshipMeta[edge.data?.relationship ?? "RECOMMENDED"];
  return {
    ...edge,
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
}

function buildNode(
  node: AdminGraphNode,
  colorById: Map<string, string | null>,
): EditorNode {
  return {
    id: node.id,
    type: "editor",
    position: { x: node.x, y: node.y },
    style: {
      width: node.width ?? NODE_WIDTH,
      height: node.height ?? NODE_HEIGHT,
    },
    data: {
      title: node.title,
      summary: node.summary,
      required: node.required,
      difficulty: node.difficulty ?? "",
      estimatedMinutes: node.estimatedMinutes,
      topicId: node.topicId,
      sectionId: node.sectionId,
      sectionColor: node.sectionId
        ? (colorById.get(node.sectionId) ?? null)
        : null,
    },
  };
}

function buildEdge(edge: AdminGraphEdge): EditorEdge {
  return styledEdge({
    id: edge.id,
    source: edge.sourceId,
    target: edge.targetId,
    data: { relationship: edge.relationship },
  });
}

function Editor({ graph }: { graph: AdminRoadmapGraph }) {
  const { fitView } = useReactFlow();
  const idCounter = useRef(0);
  const nextId = useCallback((prefix: string) => {
    idCounter.current += 1;
    return `${prefix}-${Date.now().toString(36)}-${idCounter.current}`;
  }, []);

  const [sections, setSections] = useState<EditorSection[]>(() =>
    graph.sections.map((section) => ({
      id: section.id,
      title: section.title,
      color: section.color ?? "",
    })),
  );
  const [nodes, setNodes] = useState<EditorNode[]>(() => {
    const colorById = new Map(
      graph.sections.map((section) => [section.id, section.color]),
    );
    return graph.nodes.map((node) => buildNode(node, colorById));
  });
  const [edges, setEdges] = useState<EditorEdge[]>(() =>
    graph.edges.map(buildEdge),
  );
  const [selected, setSelected] = useState<Selection | null>(null);
  const [dirty, setDirty] = useState(false);

  useBeforeUnload(
    useCallback(
      (event) => {
        if (!dirty) return;
        event.preventDefault();
        event.returnValue = "";
      },
      [dirty],
    ),
  );

  const topicById = useMemo(
    () => new Map(graph.topics.map((topic) => [topic.id, topic])),
    [graph.topics],
  );

  const onNodesChange = useCallback((changes: NodeChange<EditorNode>[]) => {
    if (
      changes.some(
        (change) => change.type === "position" || change.type === "remove",
      )
    ) {
      setDirty(true);
    }
    setNodes((current) => applyNodeChanges(changes, current));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<EditorEdge>[]) => {
    if (changes.some((change) => change.type === "remove")) {
      setDirty(true);
    }
    setEdges((current) => applyEdgeChanges(changes, current));
  }, []);

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      if (!connection.source || !connection.target) return false;
      if (connection.source === connection.target) return false;
      return !edges.some(
        (edge) =>
          edge.source === connection.source &&
          edge.target === connection.target,
      );
    },
    [edges],
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      setDirty(true);
      setEdges((current) =>
        addEdge(
          {
            id: nextId("e"),
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
            data: { relationship: "RECOMMENDED" as EdgeRelationship },
          },
          current,
        ),
      );
    },
    [nextId],
  );

  const selectedNode =
    selected?.type === "node"
      ? (nodes.find((node) => node.id === selected.id) ?? null)
      : null;
  const selectedEdge =
    selected?.type === "edge"
      ? (edges.find((edge) => edge.id === selected.id) ?? null)
      : null;

  const updateSelectedNode = useCallback(
    (patch: Partial<EditorNodeData>) => {
      if (!selected || selected.type !== "node") return;
      setDirty(true);
      setNodes((current) =>
        current.map((node) =>
          node.id === selected.id
            ? { ...node, data: { ...node.data, ...patch } }
            : node,
        ),
      );
    },
    [selected],
  );

  const addNode = useCallback(() => {
    const id = nextId("n");
    setDirty(true);
    setNodes((current) => {
      const offset = current.length * 24;
      return [
        ...current,
        {
          id,
          type: "editor" as const,
          position: { x: 80 + offset, y: 80 + offset },
          style: { width: NODE_WIDTH, height: NODE_HEIGHT },
          data: {
            title: "New node",
            summary: "",
            required: true,
            difficulty: "" as const,
            estimatedMinutes: null,
            topicId: null,
            sectionId: null,
            sectionColor: null,
          },
        },
      ];
    });
    setSelected({ type: "node", id });
  }, [nextId]);

  const deleteSelectedNode = useCallback(() => {
    if (!selected || selected.type !== "node") return;
    const id = selected.id;
    setDirty(true);
    setNodes((current) => current.filter((node) => node.id !== id));
    setEdges((current) =>
      current.filter((edge) => edge.source !== id && edge.target !== id),
    );
    setSelected(null);
  }, [selected]);

  const updateSelectedEdgeRelationship = useCallback(
    (relationship: EdgeRelationship) => {
      if (!selected || selected.type !== "edge") return;
      setDirty(true);
      setEdges((current) =>
        current.map((edge) =>
          edge.id === selected.id ? { ...edge, data: { relationship } } : edge,
        ),
      );
    },
    [selected],
  );

  const deleteSelectedEdge = useCallback(() => {
    if (!selected || selected.type !== "edge") return;
    setDirty(true);
    setEdges((current) => current.filter((edge) => edge.id !== selected.id));
    setSelected(null);
  }, [selected]);

  const applySections = useCallback((next: EditorSection[]) => {
    setDirty(true);
    setSections(next);
    const colorById = new Map(
      next.map((section) => [section.id, section.color || null]),
    );
    setNodes((current) =>
      current.map((node) => {
        if (!node.data.sectionId) return node;
        if (!colorById.has(node.data.sectionId)) {
          return {
            ...node,
            data: { ...node.data, sectionId: null, sectionColor: null },
          };
        }
        return {
          ...node,
          data: {
            ...node.data,
            sectionColor: colorById.get(node.data.sectionId) ?? null,
          },
        };
      }),
    );
  }, []);

  const addSection = useCallback(() => {
    const id = nextId("s");
    applySections([
      ...sections,
      { id, title: "New section", color: "#8d8264" },
    ]);
  }, [applySections, sections, nextId]);

  const updateSection = useCallback(
    (id: string, patch: Partial<EditorSection>) => {
      applySections(
        sections.map((section) =>
          section.id === id ? { ...section, ...patch } : section,
        ),
      );
    },
    [applySections, sections],
  );

  const removeSection = useCallback(
    (id: string) => {
      applySections(sections.filter((section) => section.id !== id));
    },
    [applySections, sections],
  );

  const assignSection = useCallback(
    (sectionId: string) => {
      const color = sections.find((section) => section.id === sectionId)?.color;
      updateSelectedNode({
        sectionId: sectionId || null,
        sectionColor: color || null,
      });
    },
    [sections, updateSelectedNode],
  );

  const renderEdges = useMemo(
    () =>
      edges.map((edge) => {
        const styled = styledEdge(edge);
        if (selected?.type === "edge" && selected.id === edge.id) {
          return {
            ...styled,
            style: { ...styled.style, strokeWidth: 3 },
          };
        }
        return styled;
      }),
    [edges, selected],
  );

  const payload = useMemo(
    () => ({
      roadmapId: graph.roadmap.id,
      revision: graph.roadmap.revision,
      sections: sections.map((section, index) => ({
        ...(section.id ? { id: section.id } : {}),
        title: section.title,
        ...(section.color ? { color: section.color } : {}),
        order: index,
      })),
      nodes: nodes.map((node, index) => ({
        id: node.id,
        ...(node.data.sectionId ? { sectionId: node.data.sectionId } : {}),
        ...(node.data.topicId ? { topicId: node.data.topicId } : {}),
        title: node.data.title,
        ...(node.data.summary ? { summary: node.data.summary } : {}),
        x: Math.round(node.position.x),
        y: Math.round(node.position.y),
        ...(node.width ? { width: node.width } : {}),
        ...(node.height ? { height: node.height } : {}),
        ...(node.data.difficulty ? { difficulty: node.data.difficulty } : {}),
        ...(node.data.estimatedMinutes
          ? { estimatedMinutes: node.data.estimatedMinutes }
          : {}),
        required: node.data.required,
        order: index,
      })),
      edges: edges.map((edge, index) => ({
        id: edge.id,
        sourceId: edge.source,
        targetId: edge.target,
        relationship: edge.data?.relationship ?? "RECOMMENDED",
        order: index,
      })),
    }),
    [graph.roadmap.id, graph.roadmap.revision, sections, nodes, edges],
  );

  const selectedEdgeSource = selectedEdge
    ? nodes.find((node) => node.id === selectedEdge.source)
    : null;
  const selectedEdgeTarget = selectedEdge
    ? nodes.find((node) => node.id === selectedEdge.target)
    : null;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col gap-3">
        <Form
          method="post"
          className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-2"
        >
          <input type="hidden" name="intent" value="save-graph" />
          <input type="hidden" name="graph" value={JSON.stringify(payload)} />
          <Button type="button" variant="outline" size="sm" onClick={addNode}>
            <PlusIcon aria-hidden />
            Add node
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSection}
          >
            <LayersIcon aria-hidden />
            Add section
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fitView({ padding: 0.2, duration: 300 })}
          >
            <MaximizeIcon aria-hidden />
            Fit
          </Button>
          <div className="ml-auto flex items-center gap-3">
            {dirty ? (
              <span className="text-xs font-medium text-rust">
                Unsaved changes
              </span>
            ) : null}
            <span className="text-xs text-muted-foreground">
              {nodes.length} nodes · {edges.length} connections
            </span>
            <Button type="submit" size="sm">
              <SaveIcon aria-hidden />
              Save graph
            </Button>
          </div>
        </Form>

        <div className="h-[70vh] min-h-[560px] w-full overflow-hidden rounded-xl border bg-muted/10">
          <ReactFlow
            nodes={nodes}
            edges={renderEdges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            onNodeClick={(_, node) =>
              setSelected({ type: "node", id: node.id })
            }
            onEdgeClick={(_, edge) =>
              setSelected({ type: "edge", id: edge.id })
            }
            onPaneClick={() => setSelected(null)}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.15}
            maxZoom={1.75}
            deleteKeyCode={["Backspace", "Delete"]}
            proOptions={{ hideAttribution: false }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable className="hidden sm:block" />
          </ReactFlow>
        </div>

        <p className="text-xs text-muted-foreground">
          Drag a node to move it, drag from the right handle to the left handle
          to connect nodes, and select an element to edit it. Keyboard delete
          removes the selected node or connection.
        </p>
      </div>

      <aside className="space-y-4">
        {selectedNode ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Node</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="node-title">Title</Label>
                <Input
                  id="node-title"
                  value={selectedNode.data.title}
                  onChange={(event) =>
                    updateSelectedNode({ title: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="node-summary">Summary</Label>
                <Textarea
                  id="node-summary"
                  rows={3}
                  value={selectedNode.data.summary}
                  onChange={(event) =>
                    updateSelectedNode({ summary: event.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="node-required"
                  checked={selectedNode.data.required}
                  onCheckedChange={(checked) =>
                    updateSelectedNode({ required: checked === true })
                  }
                />
                <Label htmlFor="node-required">Required step</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="node-difficulty">Difficulty</Label>
                <Select
                  value={selectedNode.data.difficulty || NONE}
                  onValueChange={(value) =>
                    updateSelectedNode({
                      difficulty: value === NONE ? "" : (value as Difficulty),
                    })
                  }
                >
                  <SelectTrigger id="node-difficulty" className="w-full">
                    <SelectValue placeholder="No difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>No difficulty</SelectItem>
                    {DIFFICULTY_OPTIONS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {formatDifficulty(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="node-minutes">Estimated minutes</Label>
                <Input
                  id="node-minutes"
                  type="number"
                  min={1}
                  value={selectedNode.data.estimatedMinutes ?? ""}
                  onChange={(event) => {
                    const next =
                      event.target.value === ""
                        ? null
                        : Math.floor(Number(event.target.value));
                    updateSelectedNode({
                      estimatedMinutes: next && next > 0 ? next : null,
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="node-section">Section</Label>
                <Select
                  value={selectedNode.data.sectionId ?? NONE}
                  onValueChange={(value) =>
                    assignSection(value === NONE ? "" : value)
                  }
                >
                  <SelectTrigger id="node-section" className="w-full">
                    <SelectValue placeholder="No section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>No section</SelectItem>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="node-topic">Linked topic</Label>
                <Select
                  value={selectedNode.data.topicId ?? NONE}
                  onValueChange={(value) =>
                    updateSelectedNode({
                      topicId: value === NONE ? null : value,
                    })
                  }
                >
                  <SelectTrigger id="node-topic" className="w-full">
                    <SelectValue placeholder="No topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>No topic</SelectItem>
                    {graph.topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedNode.data.topicId &&
                topicById.get(selectedNode.data.topicId) ? (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      to={`/topics/${topicById.get(selectedNode.data.topicId)!.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLinkIcon aria-hidden />
                      Open topic
                    </Link>
                  </Button>
                ) : null}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={deleteSelectedNode}
              >
                <Trash2Icon aria-hidden />
                Delete node
              </Button>
            </CardContent>
          </Card>
        ) : selectedEdge ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Connection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {selectedEdgeSource?.data.title ?? "Unknown"} →{" "}
                {selectedEdgeTarget?.data.title ?? "Unknown"}
              </p>
              <div className="space-y-2">
                <Label htmlFor="edge-relationship">Relationship</Label>
                <Select
                  value={selectedEdge.data?.relationship ?? "RECOMMENDED"}
                  onValueChange={(value) =>
                    updateSelectedEdgeRelationship(value as EdgeRelationship)
                  }
                >
                  <SelectTrigger id="edge-relationship" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_ORDER.map((value) => (
                      <SelectItem key={value} value={value}>
                        {relationshipMeta[value].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {
                    relationshipMeta[
                      selectedEdge.data?.relationship ?? "RECOMMENDED"
                    ].description
                  }
                </p>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={deleteSelectedEdge}
              >
                <Trash2Icon aria-hidden />
                Delete connection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Editor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Select a node or connection to edit it.</p>
              <p>
                Use <span className="font-medium">Add node</span> to place a new
                node, then link it to a topic so it appears on the published
                roadmap.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sections.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No sections yet. Add one to group related nodes.
              </p>
            ) : null}
            {sections.map((section) => (
              <div key={section.id} className="flex items-center gap-2">
                <Input
                  aria-label={`Section title: ${section.title}`}
                  value={section.title}
                  onChange={(event) =>
                    updateSection(section.id, { title: event.target.value })
                  }
                  className="h-8 flex-1"
                />
                <input
                  type="color"
                  aria-label={`Color for ${section.title}`}
                  value={section.color || "#8d8264"}
                  onChange={(event) =>
                    updateSection(section.id, { color: event.target.value })
                  }
                  className="h-8 w-8 shrink-0 cursor-pointer rounded-md border bg-transparent"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove section ${section.title}`}
                  onClick={() => removeSection(section.id)}
                >
                  <Trash2Icon aria-hidden />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

export default function RoadmapEditorCanvas({
  graph,
}: {
  graph: AdminRoadmapGraph;
}) {
  return (
    <ReactFlowProvider>
      <Editor graph={graph} />
    </ReactFlowProvider>
  );
}
