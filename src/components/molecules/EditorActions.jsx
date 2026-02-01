import Button from '../atoms/Button';

function EditorActions({ onClear, onLoadExample, onFormat, onImport, viewMode, onChangeView }) {
  return (
    <div className="editor-actions">
      <Button variant="ghost" onClick={onClear}>
        Clear
      </Button>
      <Button variant="ghost" onClick={onLoadExample}>
        Load example
      </Button>
      <Button variant="ghost" onClick={onFormat}>
        Format
      </Button>
      <Button variant="ghost" onClick={onImport}>
        Import JSON
      </Button>
      <div className="segmented">
        <button
          onClick={() => onChangeView('graph')}
          className={viewMode === 'graph' ? 'active' : ''}
        >
          Graph
        </button>
        <button
          onClick={() => onChangeView('tree')}
          className={viewMode === 'tree' ? 'active' : ''}
        >
          Tree
        </button>
      </div>
    </div>
  );
}

export default EditorActions;
