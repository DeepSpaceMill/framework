import { animated } from '@momoyu-ink/kit';
import { forwardRef, useImperativeHandle } from 'react';
import { type NotificationHandle, useNotification } from '../hooks/useNotification';

/**
 * Simple notification component with imperative API
 */
export const Notification = forwardRef<NotificationHandle, object>(function Notification(_, ref) {
  const { shouldRender, style, text, handle } = useNotification();

  useImperativeHandle(ref, () => handle, [handle]);

  if (!shouldRender) {
    return null;
  }

  return (
    <container label="Notification Container">
      <animated.sprite
        label="Notification Background"
        src="ui/notification_bg.png"
        x={1920 / 2}
        y={20}
        pivot={[0.5, 0]}
        anchor={[0.5, 0]}
        opacity={style.opacity}
      >
        <text
          label="Notification Text"
          text={text}
          fontSize={32}
          fillColor="#f0f0f0"
          anchor={[0.5, 0.5]}
          pivot={[0.5, 0.5]}
        />
      </animated.sprite>
    </container>
  );
});
