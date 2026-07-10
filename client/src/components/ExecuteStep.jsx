import { useEffect } from 'react';
import useImportStore from '../store/useImportStore';
import { executeImport } from '../services/api';
import { useApiRequest } from '../hooks/useApiRequest';
import { useToast } from './ToastProvider';
import { MESSAGES } from '../constants/constants';

export default function ExecuteStep() {
  const {
    preview, editedMappings, setImportResult,
    loading, goNext, goBack
  } = useImportStore();

  const { execute, cancel } = useApiRequest();
  const { error: toastError, success: toastSuccess } = useToast();

  const runImport = async () => {
    try {
      const finalMapping = editedMappings
        .filter(m => m.mapped_field !== 'ignore')
        .map(m => ({
          uploaded_field: m.uploaded_field,
          mapped_field: m.mapped_field
        }));

      const result = await execute(
        executeImport,
        finalMapping,
        preview.detected_headers,
        preview.preview_rows
      );
      
      if (result) {
        setImportResult(result.data);
        toastSuccess('Import executed successfully!');
        goNext();
      }
    } catch (err) {
      toastError(err.message || MESSAGES.IMPORT_FAILED);
    }
  };

  useEffect(() => {
    if (!loading) {
       runImport();
    }
    return () => cancel();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loading && !useImportStore.getState().loading) {
    // If we get here and aren't loading, it means there was an error (caught in runImport)
    return (
      <div className="card animate-fade-in">
        <div className="alert alert-error" role="alert">
          <span aria-hidden="true">⚠</span>
          <span>{MESSAGES.IMPORT_FAILED}</span>
        </div>
        <div className="btn-row">
          <button className="btn btn-secondary" onClick={goBack}>← Back to Mapping</button>
          <button className="btn btn-primary" onClick={runImport}>
            Retry Import
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      <div className="loading-overlay" aria-live="assertive">
        <span className="spinner spinner-lg" aria-hidden="true" />
        <h2 style={{ color: 'var(--text-primary)' }}>Executing Import</h2>
        <p>Transforming and validating records…</p>
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--warning)' }}>
          Please do not close this window.
        </p>
      </div>
    </div>
  );
}
