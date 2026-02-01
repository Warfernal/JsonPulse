import React, { useState } from 'react';
import './JsonTreeView.css';

function JsonTreeView({ data }) {
  const [expandAll, setExpandAll] = useState(false);

  if (!data) {
    return (
      <div className="tree-view">
        <div className="viewer-header">
          <div className="viewer-title">
            <span>Tree view</span>
            <span className="viewer-subtitle">Awaiting data</span>
          </div>
          <div className="viewer-actions">
            <span className="viewer-status idle"></span>
          </div>
        </div>
        <div className="tree-empty">
          <div className="tree-empty-icon">▤</div>
          <div className="tree-empty-title">Paste valid JSON to start</div>
          <div className="tree-empty-text">Expand nodes and copy values.</div>
        </div>
      </div>
    );
  }

  const handleExpandAll = () => {
    setExpandAll(true);
    setTimeout(() => setExpandAll(false), 100);
  };

  const handleCollapseAll = () => {
    setExpandAll(null);
    setTimeout(() => setExpandAll(false), 100);
  };

  return (
    <div className="tree-view">
      <div className="viewer-header">
        <div className="viewer-title">
          <span>Tree view</span>
          <span className="viewer-subtitle">Structured explorer</span>
        </div>
        <div className="viewer-actions">
          <button className="icon-btn" onClick={handleExpandAll} title="Expand all">
            +
          </button>
          <button className="icon-btn" onClick={handleCollapseAll} title="Collapse all">
            −
          </button>
          <span className="viewer-status"></span>
        </div>
      </div>
      <div className="tree-content">
        <JsonNode data={data} name="root" level={0} forceExpand={expandAll} />
      </div>
    </div>
  );
}

function JsonNode({ data, name, level, forceExpand }) {
  const [expanded, setExpanded] = useState(level < 2);

  React.useEffect(() => {
    if (forceExpand === true) setExpanded(true);
    if (forceExpand === null) setExpanded(level < 2);
  }, [forceExpand, level]);

  const handleCopy = (value) => {
    navigator.clipboard.writeText(JSON.stringify(value, null, 2));
  };

  if (data === null) {
    return (
      <div className="jtv-line">
        <span className="jtv-key">{name}</span>
        <span className="jtv-punct">:</span>
        <span className="jtv-null" onClick={() => handleCopy(null)}>
          null
        </span>
      </div>
    );
  }

  if (typeof data !== 'object') {
    let valueClass = 'jtv-value';
    let displayValue = String(data);

    if (typeof data === 'string') {
      valueClass = 'jtv-string';
      displayValue = `"${data}"`;
    } else if (typeof data === 'number') {
      valueClass = 'jtv-number';
    } else if (typeof data === 'boolean') {
      valueClass = 'jtv-boolean';
    }

    return (
      <div className="jtv-line">
        <span className="jtv-key">{name}</span>
        <span className="jtv-punct">:</span>
        <span className={`${valueClass} jtv-copyable`} onClick={() => handleCopy(data)}>
          {displayValue}
        </span>
      </div>
    );
  }

  const isArray = Array.isArray(data);
  const isEmpty = isArray ? data.length === 0 : Object.keys(data).length === 0;
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';
  const itemCount = isArray ? data.length : Object.keys(data).length;

  if (isEmpty) {
    return (
      <div className="jtv-line">
        <span className="jtv-key">{name}</span>
        <span className="jtv-punct">:</span>
        <span className="jtv-bracket">
          {openBracket}
          {closeBracket}
        </span>
      </div>
    );
  }

  const entries = isArray ? data.map((item, idx) => [`[${idx}]`, item]) : Object.entries(data);

  return (
    <div className="jtv-node">
      <div className="jtv-line jtv-expandable" onClick={() => setExpanded(!expanded)}>
        <span className={`jtv-chevron ${expanded ? 'expanded' : ''}`}>▶</span>
        <span className="jtv-key">{name}</span>
        <span className="jtv-punct">:</span>
        <span className="jtv-bracket">{openBracket}</span>
        {!expanded && (
          <>
            <span className="jtv-count">{itemCount}</span>
            <span className="jtv-bracket">{closeBracket}</span>
          </>
        )}
      </div>

      {expanded && (
        <div className="jtv-children">
          {entries.map(([key, value]) => (
            <div key={key} className="jtv-child">
              <div className="jtv-pipe"></div>
              <JsonNode data={value} name={key} level={level + 1} forceExpand={forceExpand} />
            </div>
          ))}
          <div className="jtv-line jtv-closing">
            <span className="jtv-bracket">{closeBracket}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default JsonTreeView;
