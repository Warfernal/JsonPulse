import EditorActions from '../molecules/EditorActions';
import ExportBar from '../molecules/ExportBar';
import TreeViewer from '../../TreeViewer';
import JsonTreeView from '../../JsonTreeView';

function Editor({
  editorRef,
  jsonInput,
  parsedData,
  error,
  viewMode,
  searchQuery,
  isDragging,
  fileInputRef,
  onClear,
  onLoadExample,
  onFormat,
  onImportClick,
  onFileSelect,
  onDragOver,
  onDragLeave,
  onDrop,
  onChangeView,
  onSearch,
  onInputChange,
  onExport,
  canExport,
  loading,
  success,
}) {
  return (
    <section id="editor" className="editor" ref={editorRef}>
      <div className="editor-header">
        <div>
          <h2>JSON Workspace</h2>
          <p>Paste your JSON, choose the view, and export when ready.</p>
        </div>
        <EditorActions
          onClear={onClear}
          onLoadExample={onLoadExample}
          onFormat={onFormat}
          onImport={onImportClick}
          viewMode={viewMode}
          onChangeView={onChangeView}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={onFileSelect}
          className="file-input"
        />
      </div>

      <div className="editor-grid">
        <div className="panel input-panel">
          <div className="panel-title">
            <span>JSON input</span>
            <span className={`status-dot ${error ? 'error' : 'ok'}`}></span>
          </div>
          <div
            className={`drop-zone ${isDragging ? 'active' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <textarea
              className={`json-input ${error ? 'error' : ''}`}
              value={jsonInput}
              onChange={onInputChange}
              placeholder='{
  "data": "paste JSON here..."
}'
              rows={22}
              spellCheck={false}
            />
            <div className="drop-hint">Drop a .json file here to import</div>
          </div>
          {error && (
            <div className="error-banner">
              <span>Parse error:</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="panel viewer-panel">
          <div className="panel-title">
            <span>Visualization</span>
            <input
              className="search-input"
              type="search"
              placeholder="Search nodes"
              value={searchQuery}
              onChange={onSearch}
            />
          </div>
          <div className="panel-body">
            {viewMode === 'graph' ? (
              <TreeViewer data={parsedData} searchQuery={searchQuery} />
            ) : (
              <JsonTreeView data={parsedData} />
            )}
          </div>
        </div>
      </div>

      <ExportBar onExport={onExport} canExport={canExport} loading={loading} success={success} />
    </section>
  );
}

export default Editor;
