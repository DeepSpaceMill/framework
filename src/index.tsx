import { addEventListener, createRoot, executePluginCommand } from '@momoyu-ink/kit';
import React, { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './error';
import { Navigation } from './router';
import { uiActions } from './state/ui';
import { Notification } from './components/notification';

function Main() {
  const logError = (error: Error, info: React.ErrorInfo) => {
    console.error('react error:', error);
    console.error(info.componentStack);
  };

  useEffect(() => {
    return addEventListener('beforeunload', () => {
      uiActions.confirm('确定要退出游戏吗？', () => {
        executePluginCommand('system', {
          subCommand: 'quit',
        });
      });
    });
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
      <Navigation />
      <Notification />
    </ErrorBoundary>
  );
}

addEventListener('ready', () => {
  try {
    const root = createRoot();
    root.render(<Main />);
  } catch (err) {
    console.error('Failed to render the game:', err);
  }
});
