import { useState } from 'react';

type AsyncState = 'idle' | 'loading' | 'error';

interface AsyncStateReturn {
  state: AsyncState;
  errorMessage: string | null;
  startLoading: () => void;
  stopLoading: () => void;
  handleError: (message?: string) => void;
  clearError: () => void;
}

const useAsyncState = (): AsyncStateReturn => {
  const [state, setState] = useState<AsyncState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startLoading = (): void => {
    setState('loading');
    setErrorMessage(null);
  };

  const stopLoading = (): void => {
    setState('idle');
    setErrorMessage(null);
  };

  const handleError = (
    message: string = 'An error occurred. Please try again.'
  ): void => {
    setState('error');
    setErrorMessage(message);
  };

  const clearError = (): void => {
    setState('idle');
    setErrorMessage(null);
  };

  return {
    state,
    errorMessage,
    startLoading,
    stopLoading,
    handleError,
    clearError,
  };
};

export default useAsyncState;
