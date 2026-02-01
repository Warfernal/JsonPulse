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
import {
  Stack,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Popover,
  MenuList,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
} from '@mui/material';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import '@xyflow/react/dist/style.css';
import './TreeViewer.css';
import dagre from 'dagre';

const NODE_WIDTH = 210;
const NODE_HEIGHT = 44;

function getTypeInfo(value) {
  if (value === null) return { type: 'null', color: 'var(--type-null)', label: 'null' };
  if (Array.isArray(value)) return { type: 'array', color: 'var(--type-object)', label: `Array[${value.length}]` };
  switch (typeof value) {
    case 'string': return { type: 'string', color: 'var(--type-string)', label: `"${value}"` };
    case 'number': return { type: 'number', color: 'var(--type-number)', label: String(value) };
    case 'boolean': return { type: 'boolean', color: 'var(--type-boolean)', label: String(value) };
    case 'object': return { type: 'object', color: 'var(--type-object)', label: `Object{${Object.keys(value).length}}` };
    default: return { type: 'unknown', color: 'var(--type-null)', label: String(value) };
  }
}

function jsonToGraph(data, key = 'root', parentId = null, nodes = [], edges = [], path = ['root']) {
  const id = parentId ? `${parentId}.${key}` : key;
  const info = getTypeInfo(data);
  const nextPath = parentId ? [...path, key] : ['root'];

  if (data !== null && typeof data === 'object') {
    nodes.push({
      id,
      data: {
        label: key,
        typeLabel: info.label,
        color: info.color,
        type: info.type,
        path: nextPath,
        rawValue: data,
      },
      position: { x: 0, y: 0 },
      type: 'jsonNode',
    });

    if (parentId) {
      edges.push({ id: `e-${parentId}-${id}`, source: parentId, target: id, type: 'smoothstep', animated: false });
    }

    const entries = Array.isArray(data) ? data.map((v, i) => [String(i), v]) : Object.entries(data);
    for (const [k, v] of entries) {
      jsonToGraph(v, k, id, nodes, edges, nextPath);
    }
  } else {
    nodes.push({
      id,
      data: {
        label: key,
        typeLabel: info.label,
        color: info.color,
        type: info.type,
        isLeaf: true,
        path: nextPath,
        rawValue: data,
      },
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
  const matchClass = data.isMatch ? 'match' : data.isDim ? 'dim' : '';
  const focusClass = data.isFocus ? 'focus' : '';
  return (
    <div className={`json-graph-node ${data.isLeaf ? 'leaf' : 'branch'} ${matchClass} ${focusClass}`} style={{ borderColor: data.color }}>
      <Handle type="target" position={Position.Top} style={{ background: data.color, width: 6, height: 6 }} />
      <div className="node-key">{data.label}</div>
      <div className="node-type" style={{ color: data.color }}>{data.typeLabel}</div>
      <Handle type="source" position={Position.Bottom} style={{ background: data.color, width: 6, height: 6 }} />
    </div>
  );
}

const nodeTypes = { jsonNode: JsonNodeComponent };

function TreeViewer({ data, searchQuery = '', focusPath = '', onOpenEditor, onUpdateValue }) {
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef(null);
  const [flowInstance, setFlowInstance] = useState(null);
  const [fullscreenSearch, setFullscreenSearch] = useState('');
  const [anchorPosition, setAnchorPosition] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editValue, setEditValue] = useState('');

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

  React.useEffect(() => {
    if (fullscreen) {
      setFullscreenSearch(searchQuery);
    }
  }, [fullscreen, searchQuery]);

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

  const effectiveSearch = fullscreen ? fullscreenSearch : searchQuery;
  const normalizedQuery = effectiveSearch.trim().toLowerCase();
  const matchIds = useMemo(() => {
    if (!normalizedQuery) return new Set();
    const ids = nodes
      .filter((node) => {
        const keyText = String(node.data?.label || '').toLowerCase();
        const valueText = String(node.data?.typeLabel || '').toLowerCase();
        return keyText.includes(normalizedQuery) || valueText.includes(normalizedQuery);
      })
      .map((node) => node.id);
    return new Set(ids);
  }, [nodes, normalizedQuery]);

  const displayNodes = useMemo(() => {
    const focusId = focusPath || '';
    if (!normalizedQuery && !focusId) return nodes;
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        isMatch: matchIds.has(node.id),
        isDim: normalizedQuery ? !matchIds.has(node.id) : false,
        isFocus: focusId && node.id === focusId,
      },
    }));
  }, [nodes, normalizedQuery, matchIds, focusPath]);

  React.useEffect(() => {
    if (!initialNodes.length || !flowInstance) return;
    const id = requestAnimationFrame(() => {
      flowInstance.fitView({ padding: 0.18, duration: 350 });
      const zoom = flowInstance.getZoom?.() ?? 1;
      if (zoom < 0.6) {
        flowInstance.zoomTo?.(0.8, { duration: 250 });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [initialNodes, flowInstance]);

  React.useEffect(() => {
    if (!flowInstance || !matchIds.size) return;
    const matchedNodes = nodes.filter((node) => matchIds.has(node.id));
    if (!matchedNodes.length) return;
    const id = requestAnimationFrame(() => {
      flowInstance.fitView({ nodes: matchedNodes, padding: 0.35, duration: 450 });
    });
    return () => cancelAnimationFrame(id);
  }, [matchIds, nodes, flowInstance]);

  React.useEffect(() => {
    if (!flowInstance || !focusPath) return;
    const focusNode = nodes.find((node) => node.id === focusPath);
    if (!focusNode) return;
    const id = requestAnimationFrame(() => {
      flowInstance.fitView({ nodes: [focusNode], padding: 0.4, duration: 450 });
      const zoom = flowInstance.getZoom?.() ?? 1;
      if (zoom < 0.9) {
        flowInstance.zoomTo?.(1.1, { duration: 250 });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [focusPath, nodes, flowInstance]);

  const handleNodeClick = useCallback((event, node) => {
    if (!node) return;
    setSelectedNode(node);
    setAnchorPosition({ top: event.clientY, left: event.clientX });
  }, []);

  const handleNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    if (!node) return;
    setSelectedNode(node);
    setAnchorPosition({ top: event.clientY, left: event.clientX });
  }, []);

  const closeNodeMenu = () => {
    setAnchorPosition(null);
  };

  const handleCopyPath = async () => {
    if (!selectedNode?.data?.path) return;
    try {
      await navigator.clipboard.writeText(selectedNode.data.path.join('.'));
    } finally {
      closeNodeMenu();
    }
  };

  const handleCopyValue = async () => {
    if (!selectedNode) return;
    const value = selectedNode.data?.rawValue;
    if (typeof value === 'undefined') return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    } finally {
      closeNodeMenu();
    }
  };

  const handleOpenEditor = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
    onOpenEditor?.();
    closeNodeMenu();
  };

  const handleEditValue = () => {
    if (!selectedNode) return;
    const value = selectedNode.data?.rawValue;
    if (typeof value === 'undefined') return;
    setEditValue(JSON.stringify(value, null, 2));
    setEditOpen(true);
    closeNodeMenu();
  };

  const handleEditSave = () => {
    if (!selectedNode?.data?.path) return;
    onUpdateValue?.(selectedNode.data.path, editValue);
    setEditOpen(false);
  };

  if (!data) {
    return (
      <div className="graph-view">
        <div className="viewer-header">
          <div className="viewer-title">
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Graph view
            </Typography>
            <Typography variant="caption" className="viewer-subtitle">
              Awaiting data
            </Typography>
          </div>
          <Stack direction="row" alignItems="center" spacing={1} className="viewer-actions">
            <span className="viewer-status idle"></span>
          </Stack>
        </div>
        <div className="graph-empty">
          <div className="graph-empty-icon">◈</div>
          <div className="graph-empty-title">Paste valid JSON to start</div>
          <div className="graph-empty-text">Your graph will render instantly.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`graph-view ${fullscreen ? 'fullscreen' : ''}`} ref={containerRef}>
      <div className="viewer-header">
        <div className="viewer-title">
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Graph view
          </Typography>
          <Typography variant="caption" className="viewer-subtitle">
            Interactive map
          </Typography>
        </div>
        <Stack direction="row" alignItems="center" spacing={1} className="viewer-actions">
          <Tooltip title="Center graph">
            <Button
              size="small"
              variant="outlined"
              onClick={() => flowInstance?.fitView({ padding: 0.2, duration: 400 })}
              startIcon={<CenterFocusStrongIcon fontSize="small" />}
              sx={{ textTransform: 'none' }}
            >
              Center
            </Button>
          </Tooltip>
          <Tooltip title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            <IconButton size="small" onClick={toggleFullscreen} aria-label="Toggle fullscreen">
              {fullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <span className="viewer-status"></span>
        </Stack>
      </div>
      <div className="graph-container">
        {fullscreen && (
          <div className="graph-search-bar">
            <TextField
              size="small"
              placeholder="Search nodes"
              value={fullscreenSearch}
              onChange={(event) => setFullscreenSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: fullscreenSearch ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setFullscreenSearch('')}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </div>
        )}
        <ReactFlow
          onInit={setFlowInstance}
          nodes={displayNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onNodeContextMenu={handleNodeContextMenu}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.6}
          maxZoom={2.5}
          zoomOnScroll
          zoomOnPinch
          zoomOnDoubleClick
          panOnScroll
          proOptions={{ hideAttribution: true }}
        >
          <Background color="var(--graph-grid)" gap={22} variant="dots" />
          <Controls className="graph-controls" />
          <MiniMap
            nodeColor={(n) => n.data?.color || 'var(--type-null)'}
            maskColor="rgba(15, 23, 42, 0.6)"
            className="graph-minimap"
            style={{ background: 'var(--graph-bg)' }}
          />
        </ReactFlow>
        <Popover
          open={Boolean(anchorPosition)}
          onClose={closeNodeMenu}
          anchorReference="anchorPosition"
          anchorPosition={anchorPosition || { top: 0, left: 0 }}
          disablePortal
          container={containerRef.current}
        >
          <MenuList dense>
            <MenuItem onClick={handleCopyPath}>Copy path</MenuItem>
            <MenuItem onClick={handleCopyValue} disabled={typeof selectedNode?.data?.rawValue === 'undefined'}>
              Copy value
            </MenuItem>
            <MenuItem onClick={handleEditValue} disabled={typeof selectedNode?.data?.rawValue === 'undefined'}>
              Edit value
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleOpenEditor}>Open in editor</MenuItem>
          </MenuList>
        </Popover>
        <Dialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          maxWidth="sm"
          fullWidth
          disablePortal
          container={containerRef.current}
        >
          <DialogTitle>Edit value</DialogTitle>
          <DialogContent>
            <TextField
              multiline
              minRows={6}
              fullWidth
              value={editValue}
              onChange={(event) => setEditValue(event.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleEditSave}>Save</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default TreeViewer;
