import Button from '../atoms/Button';

function ExportBar({ onExport, canExport, loading, success }) {
  return (
    <div className="export-bar">
      <div className="export-info">
        <div className="export-label">Export to Excel</div>
        <div className="export-hint">Flatten objects to columns automatically.</div>
      </div>
      <Button
        onClick={onExport}
        disabled={!canExport || loading}
        className={success ? 'success' : ''}
      >
        {loading ? 'Exporting…' : success ? 'Exported' : 'Download XLSX'}
      </Button>
    </div>
  );
}

export default ExportBar;
