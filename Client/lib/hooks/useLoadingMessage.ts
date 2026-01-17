import { useState, useEffect } from 'react';

const useLoadingMessage = (isLoading: boolean, componentName: string) => {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    if (isLoading) {
      timeouts.push(
        setTimeout(
          () => setMessage('This is taking longer than normal...'),
          10000
        )
      ); // 10 seconds
      timeouts.push(
        setTimeout(() => setMessage('Hmm... Still working on it.'), 20000)
      ); // 20 seconds
      timeouts.push(
        setTimeout(
          () =>
            setMessage(
              `Having trouble loading ${componentName}. Please wait or try refreshing.`
            ),
          30000
        )
      ); // 30 seconds
    } else {
      setMessage('Loading...');
      timeouts.forEach(clearTimeout); // Clear all timeouts if isLoading becomes false
    }

    return () => timeouts.forEach(clearTimeout); // Cleanup on unmount or isLoading change
  }, [isLoading, componentName]);

  return message;
};

export default useLoadingMessage;
