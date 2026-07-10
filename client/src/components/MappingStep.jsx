import { useEffect } from 'react';
import useImportStore from '../store/useImportStore';
import { requestMapping } from '../services/api';
import { useApiRequest } from '../hooks/useApiRequest';
import { useToast } from './ToastProvider';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { MESSAGES } from '../constants/constants';

export default function MappingStep() {
  const {
    preview, mappings, setMappings, setEditedMappings,
    loading, goNext, goBack
  } = useImportStore();
  
  const { execute, cancel } = useApiRequest();
  const { error: toastError } = useToast();

  const fetchMapping = async () => {
    try {
      const result = await execute(
        requestMapping,
        preview.detected_headers,
        preview.preview_rows
      );
      if (result) {
        const m = result.data.mappings;
        setMappings(m);
        setEditedMappings(m.map((entry) => ({ ...entry })));
      }
    } catch (err) {
      toastError(err.message || MESSAGES.MAPPING_FAILED);
    }
  };

  useEffect(() => {
    if (mappings.length === 0 && !loading) {
      fetchMapping();
    }
    return () => cancel(); // Cancel if user navigates away early
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useKeyboardNavigation({
    onEnter: goNext,
    onEscape: goBack,
    enabled: !loading && mappings.length > 0
  });

  if (loading) {
    return (
      <div className="card animate-fade-in">
        <h2 className="card-title">AI Analysis in Progress</h2>
        <div className="loading-overlay" style={{ padding: 'var(--space-6) 0' }}>
          <span className="spinner spinner-lg" aria-hidden="true" />
          <p>AI is analyzing your headers…</p>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
            This may take a few seconds
          </p>
        </div>
        <div className="skeleton skeleton-row"></div>
        <div className="skeleton skeleton-row"></div>
        <div className="skeleton skeleton-row"></div>
      </div>
    );
  }

  if (mappings.length === 0 && !loading) {
    return (
      <div className="card animate-fade-in">
        <div className="alert alert-error" role="alert">
          <span aria-hidden="true">⚠</span>
          <span>Failed to load mappings.</span>
        </div>
        <div className="btn-row">
          <button className="btn btn-secondary" onClick={goBack}>← Back</button>
          <button className="btn btn-primary" onClick={fetchMapping}>Retry Mapping</button>
        </div>
      </div>
    );
  }

  const confidenceBadge = (level) => {
    const cls = level === 'high' ? 'badge-high' : level === 'medium' ? 'badge-medium' : 'badge-low';
    const icon = level === 'high' ? '✓' : level === 'medium' ? '○' : '⚠';
    return (
      <span className={`badge ${cls}`} aria-label={`Confidence: ${level}`}>
        <span aria-hidden="true">{icon}</span> {level}
      </span>
    );
  };

  const sourceBadge = (source) => {
    const cls = source === 'heuristic' ? 'badge-heuristic' : 'badge-ai';
    const icon = source === 'heuristic' ? '⚙' : '✨';
    return (
      <span className={`badge ${cls}`} aria-label={`Source: ${source}`}>
        <span aria-hidden="true">{icon}</span> {source}
      </span>
    );
  };

  return (
    <div className="card animate-fade-in">
      <h2 className="card-title">AI Mapping Results</h2>
      <p className="card-subtitle">
        The AI has analyzed your CSV headers. Review the suggestions below.
      </p>

      <div className="data-table-wrapper" tabIndex="0" aria-label="Mapping results">
        <div className="mapping-row mapping-header" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <span>Uploaded Field</span>
          <span>CRM Field</span>
          <span>Confidence</span>
          <span>Level</span>
          <span>Source</span>
          <span>Reason</span>
          <span></span>
        </div>
        {mappings.map((m, i) => (
          <div
            key={i}
            className={`mapping-row ${m.confidence_level === 'low' ? 'low-confidence' : ''}`}
          >
            <span style={{ fontWeight: 600 }}>{m.uploaded_field}</span>
            <span style={{ color: 'var(--accent-primary)' }}>{m.mapped_field}</span>
            <span>{m.confidence}%</span>
            {confidenceBadge(m.confidence_level)}
            {sourceBadge(m.source)}
            <span style={{ color: 'var(--text-secondary)' }}>{m.reason}</span>
            <span>
              {m.manual_review && (
                <span className="badge badge-low" title="Needs manual review">⚠</span>
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={goBack}>← Back</button>
        <button className="btn btn-primary" onClick={goNext}>
          Review & Edit Mappings →
        </button>
      </div>
    </div>
  );
}
