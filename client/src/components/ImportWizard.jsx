import React, { Suspense } from 'react';
import useImportStore from '../store/useImportStore';
import { WIZARD_STEP_LABELS } from '../constants/constants';

// Lazy load steps for performance
const UploadStep = React.lazy(() => import('./UploadStep'));
const PreviewStep = React.lazy(() => import('./PreviewStep'));
const MappingStep = React.lazy(() => import('./MappingStep'));
const ReviewStep = React.lazy(() => import('./ReviewStep'));
const ExecuteStep = React.lazy(() => import('./ExecuteStep'));
const SummaryStep = React.lazy(() => import('./SummaryStep'));

const StepFallback = () => (
  <div className="card">
    <div className="skeleton skeleton-title"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-row" style={{ marginTop: 'var(--space-6)' }}></div>
    <div className="skeleton skeleton-row"></div>
    <div className="skeleton skeleton-row"></div>
  </div>
);

export default function ImportWizard() {
  const { currentStep } = useImportStore();

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <UploadStep />;
      case 1: return <PreviewStep />;
      case 2: return <MappingStep />;
      case 3: return <ReviewStep />;
      case 4: return <ExecuteStep />;
      case 5: return <SummaryStep />;
      default: return null;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header animate-fade-in">
        <h1>GrowEasy CSV Importer</h1>
        <p>Intelligently map and import your CRM data with AI.</p>
      </header>

      <div className="stepper animate-fade-in" style={{ animationDelay: '100ms' }}>
        {WIZARD_STEP_LABELS.map((label, index) => {
          let state = '';
          if (index === currentStep) state = 'active';
          else if (index < currentStep) state = 'completed';

          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <div className={`stepper-item ${state}`}>
                <div className="stepper-dot" aria-hidden="true"></div>
                <span aria-current={index === currentStep ? 'step' : undefined}>{label}</span>
              </div>
              {index < WIZARD_STEP_LABELS.length - 1 && <div className="stepper-line" aria-hidden="true"></div>}
            </div>
          );
        })}
      </div>

      <main className="animate-fade-in" style={{ animationDelay: '200ms' }} aria-live="polite">
        <Suspense fallback={<StepFallback />}>
          {renderStep()}
        </Suspense>
      </main>
    </div>
  );
}
