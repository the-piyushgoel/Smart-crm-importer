import { render, screen, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import MappingStep from '../components/MappingStep';
import { ToastProvider } from '../components/ToastProvider';
import useImportStore from '../store/useImportStore';

// Mock the API Request hook
const mockExecute = vi.fn();
vi.mock('../hooks/useApiRequest', () => ({
  useApiRequest: () => ({
    execute: mockExecute,
    loading: false,
    error: null,
    cancel: vi.fn()
  })
}));

describe('MappingStep', () => {
  beforeEach(() => {
    useImportStore.setState({
      preview: { detected_headers: ['Name', 'Email'], preview_rows: [] },
      mappings: [],
      loading: false
    });
    vi.clearAllMocks();
  });

  const renderComponent = () => render(
    <ToastProvider>
      <MappingStep />
    </ToastProvider>
  );

  test('calls mapping API automatically on mount', async () => {
    mockExecute.mockResolvedValueOnce({
      data: { mappings: [{ uploaded_field: 'Name', mapped_field: 'name', confidence: 99, confidence_level: 'high', source: 'ai' }] }
    });

    renderComponent();

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalled();
    });
  });

  test('shows retry button on failure', async () => {
    mockExecute.mockRejectedValueOnce(new Error('AI Failed'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Failed to load mappings/i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /Retry Mapping/i });
    expect(retryBtn).toBeInTheDocument();
  });

  test('renders mapped rows with badges', () => {
    useImportStore.setState({
      mappings: [
        { uploaded_field: 'Email', mapped_field: 'email', confidence: 100, confidence_level: 'high', source: 'heuristic' }
      ]
    });

    renderComponent();
    
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    
    // Using querying for badges by their text content or aria-labels
    expect(screen.getByText('heuristic')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });
});
