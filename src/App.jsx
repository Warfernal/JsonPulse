import { useState, useEffect } from 'react';
import TreeViewer from './TreeViewer';
import JsonTreeView from './JsonTreeView';
import { exportToExcel, parseJSON } from './excelConverter';
import './App.css';

const DEFAULT_JSON = {
  "users": [
    {
      "id": 1,
      "name": "Alice Martin",
      "email": "alice@example.com",
      "age": 28,
      "city": "Paris"
    },
    {
      "id": 2,
      "name": "Bob Dupont",
      "email": "bob@example.com",
      "age": 34,
      "city": "Lyon"
    },
    {
      "id": 3,
      "name": "Charlie Bernard",
      "email": "charlie@example.com",
      "age": 25,
      "city": "Marseille"
    }
  ],
  "metadata": {
    "total": 3,
    "timestamp": "2026-01-30"
  }
};

function App() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(DEFAULT_JSON, null, 2));
  const [parsedData, setParsedData] = useState(DEFAULT_JSON);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [viewMode, setViewMode] = useState('graph');

  useEffect(() => {
    if (!jsonInput.trim()) {
      setParsedData(null);
      setError(null);
      return;
    }

    const result = parseJSON(jsonInput);
    
    if (result.success) {
      setParsedData(result.data);
      setError(null);
    } else {
      setParsedData(null);
      setError(result.error);
    }
  }, [jsonInput]);

  const handleExport = async () => {
    if (!parsedData || error) return;

    setLoading(true);
    setSuccess(false);

    try {
      await exportToExcel(parsedData, 'export.xlsx');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Erreur lors de l\'export: ' + err.message);
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
    setJsonInput(JSON.stringify(DEFAULT_JSON, null, 2));
  };

  return (
    <div className="terminal">
      {/* Scanlines effect */}
      <div className="scanlines"></div>
      
      {/* Header terminal-style */}
      <header className="terminal-header">
        <div className="terminal-bar">
          <div className="terminal-dots">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
          </div>
          <div className="terminal-title">
            <span className="glitch" data-text="JsonPulse">JsonPulse</span>
          </div>
          <div className="terminal-stats">
            <span className="stat">{parsedData ? '◉ READY' : '◯ IDLE'}</span>
          </div>
        </div>
      </header>

      <div className="terminal-container">
        {/* Controls */}
        <div className="terminal-controls">
          <button onClick={handleClear} className="terminal-btn danger" title="Clear input">
            <span>⌫</span> CLEAR
          </button>
          <button onClick={handleLoadExample} className="terminal-btn" title="Load example data">
            <span>⚡</span> LOAD_EXAMPLE
          </button>
          <div className="view-toggle">
            <button
              onClick={() => setViewMode('graph')}
              className={`terminal-btn ${viewMode === 'graph' ? 'active' : ''}`}
              title="Graph view"
            >
              ◈ GRAPH
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`terminal-btn ${viewMode === 'tree' ? 'active' : ''}`}
              title="Tree view"
            >
              ▤ TREE
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="terminal-grid">
          {/* Input section */}
          <div className="terminal-panel">
            <div className="panel-header">
              <span className="panel-prompt">$</span>
              <span className="panel-title">INPUT_JSON</span>
              <div className="panel-indicator">
                {error ? <span className="error-dot">●</span> : <span className="success-dot">●</span>}
              </div>
            </div>
            <textarea
              className={`terminal-input ${error ? 'error' : ''}`}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{\n  "data": "paste JSON here..."\n}'
              rows={20}
              spellCheck={false}
            />
            {error && (
              <div className="terminal-error">
                <span className="error-icon">✗</span>
                <span className="error-text">PARSE_ERROR: {error}</span>
              </div>
            )}
          </div>

          {/* Viewer section */}
          <div className="terminal-panel">
            {viewMode === 'graph' ? (
              <TreeViewer data={parsedData} />
            ) : (
              <JsonTreeView data={parsedData} />
            )}
          </div>
        </div>

        {/* Export section */}
        <div className="terminal-export">
          <div className="export-panel">
            <div className="export-header">
              <span className="export-prompt">→</span>
              <span className="export-title">EXPORT_XLSX</span>
            </div>
            
            <button
              onClick={handleExport}
              disabled={!parsedData || error || loading}
              className={`export-btn ${success ? 'success' : ''}`}
            >
              <span className="btn-icon">
                {loading ? '⏳' : success ? '✓' : '▼'}
              </span>
              <span className="btn-text">
                {loading ? 'PROCESSING...' : success ? 'EXPORTED' : 'DOWNLOAD_XLSX'}
              </span>
              {!loading && !success && (
                <span className="btn-shortcut">CTRL+E</span>
              )}
            </button>

            {(!parsedData || error) && (
              <div className="export-info">
                <span className="info-icon">ℹ</span>
                <span className="info-text">Valid JSON required for export</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="terminal-footer">
          <div className="footer-line">
            <span className="footer-icon">▸</span>
            <span className="footer-text">
              Objects are flattened: <code>user.name</code> → <code>column</code>
            </span>
          </div>
          <div className="footer-line">
            <span className="footer-icon">▸</span>
            <span className="footer-text">
              Processing: <strong>CLIENT_SIDE</strong> | Data: <strong>PRIVATE</strong>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
