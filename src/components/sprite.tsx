import {
  animated,
  MoyuAnimationAttributes,
  MoyuNodeAttributes,
  MoyuSpriteAttributes,
  MoyuVideoAttributes,
} from '@momoyu-ink/kit';
import { TransitionBoundary, TransitionBoundaryProps } from '../components/transitionBoundary';

// File extensions treated as looping background video instead of static image.
const VIDEO_EXTENSIONS = ['.mp4', '.webm'];

function isVideoSrc(src: string): boolean {
  const lower = src.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export type SpriteProps = MoyuNodeAttributes &
  MoyuSpriteAttributes &
  Partial<MoyuAnimationAttributes> &
  MoyuVideoAttributes & {
    transition: Omit<TransitionBoundaryProps, 'children'>;
    isAnimation?: boolean;
  };

export function Sprite(props: SpriteProps) {
  if (!props.src) {
    return null;
  }

  const content = !props.src ? null : isVideoSrc(props.src) ? (
    <animated.video {...props} />
  ) : props.isAnimation ? (
    <animated.animation {...props} />
  ) : (
    <animated.sprite {...props} />
  );
  return (
    <TransitionBoundary {...props.transition}>
      <container>{content}</container>
    </TransitionBoundary>
  );
}
