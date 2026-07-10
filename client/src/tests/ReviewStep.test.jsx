import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import ReviewStep from '../components/ReviewStep';
import useImportStore from '../store/useImportStore';

describe('ReviewStep', () => {
  beforeEach(() => {
    useImportStore.setState({
      preview: {
        detected_headers: ['First_Name', 'Mail'],
        preview_rows: [['Alice', 'alice@test.com']]
      },
      mappings: [
        { uploaded_field: 'First_Name', mapped_field: 'first_name' },
        { uploaded_field: 'Mail', mapped_field: 'notes' }
      ],
      editedMappings: [
        { uploaded_field: 'First_Name', mapped_field: 'first_name' },
        { uploaded_field: 'Mail', mapped_field: 'notes' } // simulate mapping to notes
      ],
      loading: false
    });
    vi.clearAllMocks();
  });

  const renderComponent = () => render(<ReviewStep />);

  test('renders mapping review table', () => {
    renderComponent();
    expect(screen.getByText(/Manual Mapping Review/i)).toBeInTheDocument();
    
    expect(screen.getByRole('combobox', { name: /Map First_Name to/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Map Mail to/i })).toBeInTheDocument();
  });

  test('allows modifying mapping via select', () => {
    renderComponent();
    
    // Grab the select for the 'Mail' column
    const selects = screen.getAllByRole('combobox');
    const mailSelect = selects[1];
    
    // Change mapping from 'notes' to 'email'
    fireEvent.change(mailSelect, { target: { value: 'email' } });
    
    const state = useImportStore.getState();
    expect(state.editedMappings[1].mapped_field).toBe('email');
  });

  test('displays duplicate mapping error', () => {
    useImportStore.setState({
      mappings: [
        { uploaded_field: 'First_Name', mapped_field: 'first_name' },
        { uploaded_field: 'Mail', mapped_field: 'first_name' }
      ],
      editedMappings: [
        { uploaded_field: 'First_Name', mapped_field: 'first_name' },
        { uploaded_field: 'Mail', mapped_field: 'first_name' }
      ]
    });
    
    renderComponent();
    
    expect(screen.getByText(/Please resolve duplicate mappings before proceeding/i)).toBeInTheDocument();
    
    const confirmBtn = screen.getByRole('button', { name: /Confirm & Execute Import/i });
    expect(confirmBtn).toBeDisabled();
  });
});
