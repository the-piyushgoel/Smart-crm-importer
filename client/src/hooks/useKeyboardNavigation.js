import { useEffect } from 'react';

/**
 * Custom hook to handle global keyboard navigation for a specific component.
 *
 * @param {Object} options
 * @param {Function} [options.onEnter] Called when Enter is pressed.
 * @param {Function} [options.onEscape] Called when Escape is pressed.
 * @param {boolean} [options.enabled=true] Whether the listeners are active.
 */
export function useKeyboardNavigation({ onEnter, onEscape, enabled = true }) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Don't trigger if the user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
      }

      if (e.key === 'Enter' && onEnter) {
        e.preventDefault();
        onEnter();
      }

      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEnter, onEscape, enabled]);
}
