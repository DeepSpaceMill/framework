import { animated, useSpring } from '@momoyu-ink/kit';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { uiState, uiActions, type NotificationInfo } from '../state/ui';

/**
 * Individual notification item component
 *
 * Each notification has its own lifecycle:
 * 1. Fade in over fadeInDuration
 * 2. Stay visible for duration
 * 3. Fade out over fadeOutDuration
 * 4. Remove from state after fade out completes
 */
function NotificationItem({ notification, index }: { notification: NotificationInfo; index: number }) {
  const [style, api] = useSpring(() => ({
    opacity: 0,
    config: { duration: notification.fadeInDuration },
  }));

  useEffect(() => {
    // Fade in
    api.start({
      opacity: 1,
      config: { duration: notification.fadeInDuration },
    });

    // Auto fade out after duration
    const fadeOutTimer = setTimeout(() => {
      api.start({
        opacity: 0,
        config: { duration: notification.fadeOutDuration },
        onRest: () => {
          // Remove notification from state after fade out completes
          uiActions.removeNotification(notification.id);
        },
      });
    }, notification.fadeInDuration + notification.duration);

    return () => {
      clearTimeout(fadeOutTimer);
    };
  }, [api, notification]);

  const yOffset = index * 80; // Spacing between notifications

  return (
    <animated.sprite
      label={`Notification Item ${index}`}
      src="ui/notification_bg.png"
      x={1920 / 2}
      y={20 + yOffset}
      pivot={[0.5, 0]}
      anchor={[0.5, 0]}
      opacity={style.opacity}
    >
      <text
        label="Notification Text"
        text={notification.message}
        fontSize={32}
        fillColor="#f0f0f0"
        anchor={[0.5, 0.5]}
        pivot={[0.5, 0.5]}
      />
    </animated.sprite>
  );
}

/**
 * Global notification system component
 *
 * This component renders all active notifications from the global state.
 * Multiple notifications are displayed simultaneously, stacked vertically.
 *
 * Usage: Call context.notify(message, options) from any component to show notifications.
 * The component is automatically rendered in index.tsx and manages its own lifecycle.
 */
export function Notification() {
  const { notifications } = useSnapshot(uiState);

  return (
    <container label="Global Notification Container">
      {notifications.map((notification, index) => (
        <NotificationItem key={notification.id} notification={notification} index={index} />
      ))}
    </container>
  );
}
