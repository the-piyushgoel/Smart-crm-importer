import { useState, useCallback, useRef } from 'react';
import useImportStore from '../store/useImportStore';
import { useToast } from './ToastProvider';
import { useApiRequest } from '../hooks/useApiRequest';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { uploadPreview } from '../services/api';
import { MESSAGES } from '../constants/constants';

const MAX_SIZE = 5 * 1024 * 1024;

export default function UploadStep() {
  const { setFile, setPreview, loading, goNext } = useImportStore();
  const { error: toastError, success: toastSuccess } = useToast();
  const { execute: executeUpload } = useApiRequest();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return 'No file selected.';
    if (!file.name.toLowerCase().endsWith('.csv')) return MESSAGES.INVALID_FILE_TYPE;
    if (file.size > MAX_SIZE) return MESSAGES.FILE_TOO_LARGE(5);
    return null;
  };

  const handleFileSelect = useCallback((file) => {
    if (!file) return;
    const err = validateFile(file);
    if (err) {
      toastError(err);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setSelectedFile(file);
  }, [toastError]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!selectedFile || loading) return;
    
    try {
      const result = await executeUpload(uploadPreview, selectedFile);
      if (result) {
        setFile(selectedFile);
        setPreview(result.data);
        toastSuccess('File uploaded successfully!');
        goNext();
      }
    } catch (err) {
      toastError(err.message || MESSAGES.UPLOAD_FAILED);
    }
  };

  // Keyboard support: Enter to upload when a file is selected
  useKeyboardNavigation({
    onEnter: handleUpload,
    enabled: !!selectedFile && !loading
  });

  return (
    <div className="card">
      <h2 className="card-title">Upload CSV File</h2>
      <p className="card-subtitle">
        Drag and drop your CSV file or click to browse. Max 5MB.
      </p>

      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''} ${loading ? 'opacity-50' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={loading ? -1 : 0}
        aria-label="Upload CSV file"
        aria-disabled={loading}
      >
        <div className="upload-zone-icon" aria-hidden="true">📄</div>
        <h3>Drop your CSV file here</h3>
        <p>or click to browse files</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          aria-label="Choose CSV file"
          disabled={loading}
        />
      </div>

      {selectedFile && (
        <div className="file-info animate-fade-in">
          <span aria-hidden="true">📎</span>
          <span className="file-info-name">{selectedFile.name}</span>
          <span className="file-info-size">
            {(selectedFile.size / 1024).toFixed(1)} KB
          </span>
          <button
            className="file-info-remove"
            onClick={() => { 
              setSelectedFile(null); 
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            aria-label="Remove selected file"
            disabled={loading}
          >
            ✕ Remove
          </button>
        </div>
      )}

      <div className="btn-row">
        <button
          className="btn btn-primary"
          disabled={!selectedFile || loading}
          onClick={handleUpload}
          aria-label="Upload and preview CSV"
        >
          {loading && <span className="spinner" aria-hidden="true" />}
          {loading ? 'Uploading…' : 'Upload & Preview'}
        </button>
      </div>
    </div>
  );
}
