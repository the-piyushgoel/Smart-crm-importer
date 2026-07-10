import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi, beforeEach } from 'vitest';
import UploadStep from '../components/UploadStep';
import { ToastProvider } from '../components/ToastProvider';
import useImportStore from '../store/useImportStore';

// Mock the API Request hook
vi.mock('../hooks/useApiRequest', () => ({
  useApiRequest: () => ({
    execute: vi.fn().mockResolvedValue({ data: { preview_rows: [] } }),
    loading: false,
    error: null
  })
}));

describe('UploadStep', () => {
  beforeEach(() => {
    useImportStore.setState({ file: null, preview: null, loading: false });
    vi.clearAllMocks();
  });

  const renderComponent = () => render(
    <ToastProvider>
      <UploadStep />
    </ToastProvider>
  );

  test('renders upload zone', () => {
    renderComponent();
    expect(screen.getByText(/Upload CSV File/i)).toBeInTheDocument();
    expect(screen.getByText(/Drop your CSV file here/i)).toBeInTheDocument();
  });

  test('validates file type (must be .csv)', async () => {
    renderComponent();
    const fileInput = screen.getByLabelText(/Choose CSV file/i);
    
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Toast should show up (wait for it)
    await waitFor(() => {
      expect(screen.getByText(/Only \.csv files are supported\./i)).toBeInTheDocument();
    });
    
    // File info should NOT be displayed
    expect(screen.queryByText('hello.png')).not.toBeInTheDocument();
  });

  test('allows valid CSV file and shows info', async () => {
    renderComponent();
    const fileInput = screen.getByLabelText(/Choose CSV file/i);
    
    const file = new File(['name,email\nTest,test@test.com'], 'data.csv', { type: 'text/csv' });
    await userEvent.upload(fileInput, file);
    
    expect(screen.getByText('data.csv')).toBeInTheDocument();
    
    const uploadButton = screen.getByRole('button', { name: /Upload and preview CSV/i });
    expect(uploadButton).not.toBeDisabled();
  });
});
