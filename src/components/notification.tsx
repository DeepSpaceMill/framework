import { animated, getStageSize, useSpring, useTransition } from '@momoyu-ink/kit';
import { useSnapshot } from 'valtio';
import { uiState, type NotificationInfo } from '../state/ui';

/**
 * Individual notification item component with its own position animation
 */
function NotificationItem({ item, index, style }: { item: NotificationInfo; index: number; style: any }) {
  const stageSize = getStageSize();
  const scale = stageSize.height / 1080;
  // Calculate vertical position based on index
  const targetY = 20 + index * 80 * scale;

  // Animate the y position when index changes (e.g., when a notification above is removed)
  const spring = useSpring({
    y: targetY,
    config: { tension: 350, friction: 35 },
  });

  return (
    <animated.sprite
      label={`Notification ${item.id}`}
      src="ui/notification_bg.png"
      x={stageSize.width / 2}
      y={spring.y}
      opacity={style.opacity}
      scale={style.scale.to((s: number) => s * scale)}
      pivot={[0.5, 0]}
    >
      <text
        label="Notification Text"
        text={item.message}
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
 * Uses useTransition to manage enter/leave animations of notifications.
 * The removal from state is handled in uiActions.notify via setTimeout.
 */
export function Notification() {
  const { notifications } = useSnapshot(uiState);

  const transitions = useTransition(notifications, {
    keys: (item: NotificationInfo) => item.id,
    from: { opacity: 0, scale: 0.8 },
    enter: { opacity: 1, scale: 1 },
    leave: { opacity: 0, scale: 0.8 },
    config: (item: NotificationInfo, _index, phase) => {
      if (phase === 'leave') return { duration: item.fadeOutDuration };
      if (phase === 'enter') return { duration: item.fadeInDuration };
      return { tension: 300, friction: 30 };
    },
  });

  return (
    <container label="Global Notification Container">
      {transitions((style, item, _, index) => {
        // Find actual index in the current notifications list for positioning
        // If not found (already removed and in 'leave' phase), use the transition index
        const activeIndex = notifications.findIndex((n) => n.id === item.id);
        const displayIndex = activeIndex !== -1 ? activeIndex : index;

        return <NotificationItem key={item.id} item={item} index={displayIndex} style={style} />;
      })}
    </container>
  );
}
