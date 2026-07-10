import { useMemo } from 'react';
import useImportStore from '../store/useImportStore';
import { CRM_FIELDS } from '../constants/crmFields';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { MESSAGES } from '../constants/constants';

export default function ReviewStep() {
  const { mappings, editedMappings, updateMapping, goNext, goBack } = useImportStore();

  const handleSelectChange = (index, value) => {
    updateMapping(index, 'mapped_field', value);
  };

  const handleIgnore = (index) => {
    updateMapping(index, 'mapped_field', 'ignore');
  };

  const handleReset = (index) => {
    const original = mappings[index].mapped_field;
    updateMapping(index, 'mapped_field', original);
  };

  // Memoize duplicate mappings check
  const duplicates = useMemo(() => {
    const counts = {};
    const dups = new Set();
    editedMappings.forEach((m) => {
      const field = m.mapped_field;
      if (field !== 'notes' && field !== 'ignore') {
        counts[field] = (counts[field] || 0) + 1;
        if (counts[field] > 1) {
          dups.add(field);
        }
      }
    });
    return dups;
  }, [editedMappings]);

  const hasErrors = duplicates.size > 0;

  useKeyboardNavigation({
    onEnter: () => {
      if (!hasErrors) goNext();
    },
    onEscape: goBack,
    enabled: true
  });

  return (
    <div className="card animate-fade-in">
      <h2 className="card-title">Manual Mapping Review</h2>
      <p className="card-subtitle">
        Review and adjust the AI's mapping suggestions. Fields marked as "ignore" will not be imported.
      </p>

      {hasErrors && (
        <div className="alert alert-error animate-fade-in" role="alert">
          <span aria-hidden="true">⚠</span>
          <span>{MESSAGES.DUPLICATE_MAPPING}</span>
        </div>
      )}

      <div className="data-table-wrapper" tabIndex="0" aria-label="Manual mapping review table">
        <div className="mapping-row mapping-header" style={{ gridTemplateColumns: '1fr 1fr 120px', position: 'sticky', top: 0, zIndex: 1 }}>
          <span>Uploaded CSV Field</span>
          <span>Target CRM Field</span>
          <span>Actions</span>
        </div>
        {editedMappings.map((m, index) => {
          const original = mappings[index].mapped_field;
          const isChanged = m.mapped_field !== original;
          const isIgnored = m.mapped_field === 'ignore';
          const isDuplicate = duplicates.has(m.mapped_field);

          return (
            <div
              key={index}
              className={`mapping-row ${m.confidence_level === 'low' && !isChanged ? 'low-confidence' : ''} ${isIgnored ? 'opacity-50' : ''}`}
              style={{ gridTemplateColumns: '1fr 1fr 120px', transition: 'all var(--transition-base)' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600, textDecoration: isIgnored ? 'line-through' : 'none' }}>
                  {m.uploaded_field}
                </span>
                {m.manual_review && !isChanged && !isIgnored && (
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--danger)' }}>
                    Requires Review
                  </span>
                )}
                {isChanged && !isIgnored && (
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--warning)' }}>
                    Manually Overridden
                  </span>
                )}
              </div>

              <div>
                <select
                  className={`field-select ${isChanged ? 'changed' : ''} ${isIgnored ? 'ignored' : ''}`}
                  value={m.mapped_field}
                  onChange={(e) => handleSelectChange(index, e.target.value)}
                  style={isDuplicate ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 1px var(--danger)' } : {}}
                  aria-label={`Map ${m.uploaded_field} to`}
                  aria-invalid={isDuplicate}
                >
                  <option value="ignore">-- Ignore Field --</option>
                  <option disabled>──────────</option>
                  {CRM_FIELDS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
                {isDuplicate && (
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--danger)', marginTop: '4px' }} role="alert">
                    Duplicate mapping
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {!isIgnored && (
                  <button 
                    className="btn btn-ghost" 
                    style={{ padding: '4px 8px', fontSize: 'var(--font-xs)' }} 
                    onClick={() => handleIgnore(index)}
                    aria-label={`Ignore ${m.uploaded_field}`}
                  >
                    Ignore
                  </button>
                )}
                {isChanged && (
                  <button 
                    className="btn btn-ghost" 
                    style={{ padding: '4px 8px', fontSize: 'var(--font-xs)' }} 
                    onClick={() => handleReset(index)}
                    aria-label={`Reset ${m.uploaded_field} to original mapping`}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={goBack}>← Back</button>
        <button className="btn btn-primary" onClick={goNext} disabled={hasErrors}>
          Confirm & Execute Import →
        </button>
      </div>
    </div>
  );
}
