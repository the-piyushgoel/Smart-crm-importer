import { useMemo } from 'react';
import useImportStore from '../store/useImportStore';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

export default function PreviewStep() {
  const { preview, goNext, goBack } = useImportStore();

  useKeyboardNavigation({
    onEnter: goNext,
    onEscape: goBack,
    enabled: !!preview
  });

  if (!preview) {
    return (
      <div className="card animate-fade-in">
        <h2 className="card-title">CSV Preview</h2>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-row"></div>
        <div className="skeleton skeleton-row"></div>
        <div className="skeleton skeleton-row"></div>
      </div>
    );
  }

  const {
    file_name,
    delimiter,
    encoding,
    total_rows,
    total_columns,
    detected_headers,
    preview_rows,
    warnings,
  } = preview;

  const delimiterName = useMemo(() => {
    return delimiter === ',' ? 'Comma' : delimiter === '\t' ? 'Tab' : delimiter === ';' ? 'Semicolon' : delimiter;
  }, [delimiter]);

  return (
    <div className="card animate-fade-in">
      <h2 className="card-title">CSV Preview</h2>
      <p className="card-subtitle">
        Review the detected structure before proceeding to AI mapping.
      </p>

      {/* Metadata */}
      <div className="meta-grid">
        <div className="meta-item">
          <div className="meta-item-label">File</div>
          <div className="meta-item-value" style={{ fontSize: 'var(--font-sm)', wordBreak: 'break-all' }} title={file_name}>
            {file_name}
          </div>
        </div>
        <div className="meta-item">
          <div className="meta-item-label">Rows</div>
          <div className="meta-item-value">{total_rows?.toLocaleString()}</div>
        </div>
        <div className="meta-item">
          <div className="meta-item-label">Columns</div>
          <div className="meta-item-value">{total_columns}</div>
        </div>
        <div className="meta-item">
          <div className="meta-item-label">Delimiter</div>
          <div className="meta-item-value">{delimiterName}</div>
        </div>
        <div className="meta-item">
          <div className="meta-item-label">Encoding</div>
          <div className="meta-item-value">{encoding?.toUpperCase()}</div>
        </div>
      </div>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="alert alert-warning" role="alert">
          <span aria-hidden="true">⚠</span>
          <div>
            {warnings.slice(0, 5).map((w, i) => <div key={i}>{w}</div>)}
            {warnings.length > 5 && <div>…and {warnings.length - 5} more warnings</div>}
          </div>
        </div>
      )}

      {/* Preview Table */}
      <div className="data-table-wrapper" tabIndex="0" aria-label="CSV data preview">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              {detected_headers?.map((h, i) => <th key={i}>{h || `Column ${i + 1}`}</th>)}
            </tr>
          </thead>
          <tbody>
            {preview_rows?.map((row, ri) => (
              <tr key={ri}>
                <td style={{ color: 'var(--text-muted)' }}>{ri + 1}</td>
                {row.map((cell, ci) => <td key={ci}>{cell || '—'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={goBack}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={goNext}>
          Generate AI Mapping →
        </button>
      </div>
    </div>
  );
}
