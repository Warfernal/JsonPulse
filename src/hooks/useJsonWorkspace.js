import { useState, useEffect, useRef } from 'react';
import { exportToExcel, parseJSON } from '../excelConverter';

const isObject = (value) => value !== null && typeof value === 'object';

const findFirstDiffPath = (prev, next, path) => {
  if (prev === next) return null;
  const prevIsObj = isObject(prev);
  const nextIsObj = isObject(next);
  if (!prevIsObj || !nextIsObj) return path;
  if (Array.isArray(prev) !== Array.isArray(next)) return path;

  if (Array.isArray(prev)) {
    const max = Math.max(prev.length, next.length);
    for (let i = 0; i < max; i += 1) {
      if (i >= prev.length || i >= next.length) return [...path, String(i)];
      const child = findFirstDiffPath(prev[i], next[i], [...path, String(i)]);
      if (child) return child;
    }
    return null;
  }

  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  for (const key of keys) {
    if (!(key in prev) || !(key in next)) return [...path, key];
    const child = findFirstDiffPath(prev[key], next[key], [...path, key]);
    if (child) return child;
  }

  return null;
};

function useJsonWorkspace(defaultJson) {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(defaultJson, null, 2));
  const [parsedData, setParsedData] = useState(defaultJson);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [viewMode, setViewMode] = useState('graph');
  const [theme, setTheme] = useState(() => localStorage.getItem('jp-theme') || 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaceSplit, setWorkspaceSplit] = useState(50);
  const [focusPath, setFocusPath] = useState('');
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const isResizingRef = useRef(false);
  const prevDataRef = useRef(defaultJson);

  useEffect(() => {
    if (!jsonInput.trim()) {
      setParsedData(null);
      setError(null);
      setFocusPath('');
      return;
    }

    const result = parseJSON(jsonInput);

    if (result.success) {
      setParsedData(result.data);
      setError(null);
      const diffPath = findFirstDiffPath(prevDataRef.current, result.data, ['root']);
      setFocusPath(diffPath ? diffPath.join('.') : '');
      prevDataRef.current = result.data;
    } else {
      setParsedData(null);
      setError(result.error);
      setFocusPath('');
    }
  }, [jsonInput]);

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('jp-theme', theme);
  }, [theme]);

  const handleExport = async () => {
    if (!parsedData || error) return;

    setLoading(true);
    setSuccess(false);

    try {
      await exportToExcel(parsedData, 'export.xlsx');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Erreur lors de l'export: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setJsonInput('');
    setParsedData(null);
    setError(null);
  };

  const handleLoadExample = () => {
    setJsonInput(JSON.stringify(defaultJson, null, 2));
  };

  const handleFormat = () => {
    if (!jsonInput.trim()) return;
    const result = parseJSON(jsonInput);
    if (result.success) {
      setJsonInput(JSON.stringify(result.data, null, 2));
    } else {
      setError(result.error);
    }
  };

  const loadJsonFile = async (file) => {
    try {
      const content = await file.text();
      const result = parseJSON(content);
      if (result.success) {
        setJsonInput(JSON.stringify(result.data, null, 2));
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Unable to read file');
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await loadJsonFile(file);
    event.target.value = '';
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      await loadJsonFile(file);
    }
  };

  const scrollToEditor = () => {
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const openWorkspace = () => setWorkspaceOpen(true);
  const closeWorkspace = () => setWorkspaceOpen(false);

  const handleWorkspaceResizeStart = (event) => {
    event.preventDefault();
    isResizingRef.current = true;
  };

  const handleWorkspaceResizeMove = (event) => {
    if (!isResizingRef.current) return;
    const container = event.currentTarget;
    const rect = container.getBoundingClientRect();
    const next = ((event.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.min(80, Math.max(20, next));
    setWorkspaceSplit(clamped);
  };

  const handleWorkspaceResizeEnd = () => {
    isResizingRef.current = false;
  };

  const handleUpdateValue = (path, rawInput) => {
    if (!parsedData || !Array.isArray(path) || !path.length) return;
    const pathParts = path[0] === 'root' ? path.slice(1) : path;
    const updated = JSON.parse(JSON.stringify(parsedData));
    let cursor = updated;
    for (let i = 0; i < pathParts.length - 1; i += 1) {
      const key = pathParts[i];
      const nextKey = Array.isArray(cursor) ? Number(key) : key;
      if (typeof cursor[nextKey] === 'undefined') return;
      cursor = cursor[nextKey];
    }
    const lastKeyRaw = pathParts[pathParts.length - 1];
    const lastKey = Array.isArray(cursor) ? Number(lastKeyRaw) : lastKeyRaw;
    let nextValue = rawInput;
    try {
      nextValue = JSON.parse(rawInput);
    } catch {
      // keep raw string
    }
    cursor[lastKey] = nextValue;
    setJsonInput(JSON.stringify(updated, null, 2));
  };

  return {
    jsonInput,
    setJsonInput,
    parsedData,
    error,
    loading,
    success,
    viewMode,
    setViewMode,
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    isDragging,
    editorRef,
    fileInputRef,
    handleExport,
    handleClear,
    handleLoadExample,
    handleFormat,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    scrollToEditor,
    workspaceOpen,
    openWorkspace,
    closeWorkspace,
    workspaceSplit,
    focusPath,
    handleWorkspaceResizeStart,
    handleWorkspaceResizeMove,
    handleWorkspaceResizeEnd,
    handleUpdateValue,
  };
}

export default useJsonWorkspace;
