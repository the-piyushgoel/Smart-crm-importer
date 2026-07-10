import { create } from 'zustand';

const STEPS = ['upload', 'preview', 'mapping', 'review', 'execute', 'summary'];

const useImportStore = create((set, get) => ({
  /* Navigation */
  currentStep: 0,
  steps: STEPS,
  goNext: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, STEPS.length - 1) })),
  goBack: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),
  goToStep: (step) => set({ currentStep: step }),

  /* Step 1 — Upload */
  file: null,
  setFile: (file) => set({ file }),

  /* Step 2 — Preview */
  preview: null,
  setPreview: (preview) => set({ preview }),

  /* Step 3 — AI Mapping */
  mappings: [],
  setMappings: (mappings) => set({ mappings }),

  /* Step 4 — Manual Edits */
  editedMappings: [],
  setEditedMappings: (editedMappings) => set({ editedMappings }),
  updateMapping: (index, field, value) =>
    set((s) => {
      const updated = [...s.editedMappings];
      updated[index] = { ...updated[index], [field]: value };
      return { editedMappings: updated };
    }),

  /* Step 5/6 — Execution */
  importResult: null,
  setImportResult: (importResult) => set({ importResult }),

  /* Shared */
  loading: false,
  setLoading: (loading) => set({ loading }),
  error: null,
  setError: (error) => set({ error }),

  /* Reset */
  reset: () =>
    set({
      currentStep: 0,
      file: null,
      preview: null,
      mappings: [],
      editedMappings: [],
      importResult: null,
      loading: false,
      error: null,
    }),
}));

export default useImportStore;
