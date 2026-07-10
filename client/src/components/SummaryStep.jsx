import useImportStore from '../store/useImportStore';

export default function SummaryStep() {
  const { importResult, reset } = useImportStore();

  if (!importResult) return null;

  const { summary, warnings, skipped_records } = importResult;

  return (
    <div className="card animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-2)' }} aria-hidden="true">🎉</div>
        <h2 className="card-title" style={{ fontSize: 'var(--font-3xl)', color: 'var(--success)' }}>
          Import Complete
        </h2>
        <p className="card-subtitle">Your CSV data has been successfully processed.</p>
      </div>

      <div className="summary-grid">
        <div className="summary-stat" style={{ animationDelay: '100ms' }}>
          <div className="summary-stat-value">{summary.total_rows?.toLocaleString()}</div>
          <div className="summary-stat-label">Total Rows</div>
        </div>
        <div className="summary-stat animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="summary-stat-value success">{summary.success_count?.toLocaleString()}</div>
          <div className="summary-stat-label">Successfully Imported</div>
        </div>
        <div className="summary-stat animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="summary-stat-value warning">{summary.skipped_count?.toLocaleString()}</div>
          <div className="summary-stat-label">Skipped (Rule Violations)</div>
        </div>
        <div className="summary-stat animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="summary-stat-value danger">{summary.failed_count?.toLocaleString()}</div>
          <div className="summary-stat-label">Failed (Errors)</div>
        </div>
        <div className="summary-stat animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="summary-stat-value info">{summary.processing_time_ms}ms</div>
          <div className="summary-stat-label">Processing Time</div>
        </div>
      </div>

      {warnings && warnings.length > 0 && (
        <div style={{ marginTop: 'var(--space-8)' }} className="animate-fade-in">
          <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-3)' }}>Warnings</h3>
          <div className="alert alert-warning" style={{ flexDirection: 'column', gap: 'var(--space-2)' }} role="alert">
            {warnings.slice(0, 5).map((w, i) => (
              <div key={i}>• {w}</div>
            ))}
            {warnings.length > 5 && <div>…and {warnings.length - 5} more warnings</div>}
          </div>
        </div>
      )}

      {skipped_records && skipped_records.length > 0 && (
        <div style={{ marginTop: 'var(--space-8)' }} className="animate-fade-in">
          <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-3)' }}>Skipped Records Details</h3>
          <div className="data-table-wrapper" style={{ maxHeight: '200px', overflowY: 'auto' }} tabIndex="0" aria-label="Skipped records table">
             <table className="data-table">
               <thead>
                 <tr>
                   <th style={{ position: 'sticky', top: 0, zIndex: 1 }}>Row #</th>
                   <th style={{ position: 'sticky', top: 0, zIndex: 1 }}>Reason</th>
                 </tr>
               </thead>
               <tbody>
                 {skipped_records.map((r, i) => (
                   <tr key={i}>
                     <td>{r.row_number}</td>
                     <td style={{ color: 'var(--warning)' }}>{r.reason}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      )}

      <div className="btn-row" style={{ marginTop: 'var(--space-8)', justifyContent: 'center' }}>
        <button className="btn btn-primary animate-fade-in" style={{ animationDelay: '600ms' }} onClick={reset}>
          Import Another CSV
        </button>
      </div>
    </div>
  );
}
