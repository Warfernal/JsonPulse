import React, { useMemo, useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MiniMap,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import './TreeViewer.css';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 40;

function getTypeInfo(value) {
  if (value === null) return { type: 'null', color: '#6b7280', label: 'null' };
  if (Array.isArray(value)) return { type: 'array', color: '#f59e0b', label: `Array[${value.length}]` };
  switch (typeof value) {
    case 'string': return { type: 'string', color: '#10b981', label: `"${value}"` };
    case 'number': return { type: 'number', color: '#06b6d4', label: String(value) };
    case 'boolean': return { type: 'boolean', color: '#a855f7', label: String(value) };
    case 'object': return { type: 'object', color: '#3b82f6', label: `Object{${Object.keys(value).length}}` };
    default: return { type: 'unknown', color: '#6b7280', label: String(value) };
  }
}

function jsonToGraph(data, key = 'root', parentId = null, nodes = [], edges = []) {
  const id = parentId ? `${parentId}.${key}` : key;
  const info = getTypeInfo(data);

  if (data !== null && typeof data === 'object') {
    nodes.push({
      id,
      data: { label: key, typeLabel: info.label, color: info.color, type: info.type },
      position: { x: 0, y: 0 },
      type: 'jsonNode',
    });

    if (parentId) {
      edges.push({ id: `e-${parentId}-${id}`, source: parentId, target: id, type: 'smoothstep', animated: false });
    }

    const entries = Array.isArray(data) ? data.map((v, i) => [String(i), v]) : Object.entries(data);
    for (const [k, v] of entries) {
      jsonToGraph(v, k, id, nodes, edges);
    }
  } else {
    nodes.push({
      id,
      data: { label: key, typeLabel: info.label, color: info.color, type: info.type, isLeaf: true },
      position: { x: 0, y: 0 },
      type: 'jsonNode',
    });

    if (parentId) {
      edges.push({ id: `e-${parentId}-${id}`, source: parentId, target: id, type: 'smoothstep', animated: false });
    }
  }

  return { nodes, edges };
}

function layoutGraph(nodes, edges) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 30, ranksep: 60 });

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    return { ...node, position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 } };
  });
}

function JsonNodeComponent({ data }) {
  return (
    <div className={`json-graph-node ${data.isLeaf ? 'leaf' : 'branch'}`} style={{ borderColor: data.color }}>
      <Handle type="target" position={Position.Top} style={{ background: data.color, width: 6, height: 6 }} />
      <div className="node-key">{data.label}</div>
      <div className="node-type" style={{ color: data.color }}>{data.typeLabel}</div>
      <Handle type="source" position={Position.Bottom} style={{ background: data.color, width: 6, height: 6 }} />
    </div>
  );
}

const nodeTypes = { jsonNode: JsonNodeComponent };

function TreeViewer({ data }) {
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef(null);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  React.useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const { initialNodes, initialEdges } = useMemo(() => {
    if (!data) return { initialNodes: [], initialEdges: [] };
    const { nodes, edges } = jsonToGraph(data);
    const laidOut = layoutGraph(nodes, edges);
    return { initialNodes: laidOut, initialEdges: edges };
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (!data) {
    return (
      <div className="tree-terminal">
        <div className="panel-header">
          <span className="panel-prompt">▸</span>
          <span className="panel-title">GRAPH_VIEW</span>
          <div className="panel-indicator">
            <span className="idle-dot">◯</span>
          </div>
        </div>
        <div className="tree-empty">
          <div className="empty-icon">◬</div>
          <div className="empty-text">AWAITING_DATA</div>
          <div className="empty-hint">Parse valid JSON to visualize</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`tree-terminal ${fullscreen ? 'fullscreen' : ''}`} ref={containerRef}>
      <div className="panel-header">
        <span className="panel-prompt">▸</span>
        <span className="panel-title">GRAPH_VIEW</span>
        <button className="fullscreen-btn" onClick={toggleFullscreen} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
          {fullscreen ? '⊗' : '⛶'}
        </button>
        <div className="panel-indicator">
          <span className="success-dot">●</span>
        </div>
      </div>
      <div className="graph-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1a1a2e" gap={20} variant="dots" />
          <Controls />
          <MiniMap
            nodeColor={(n) => n.data?.color || '#666'}
            maskColor="rgba(0,0,0,0.7)"
            style={{ background: '#0a0a1a' }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default TreeViewer;
