import { useState, useEffect, useRef } from 'react';
import type { MoyuSpriteAttributes, Tuple4 } from '@momoyu-ink/kit';

type LoopMode = 'none' | 'always' | 'bounce' | 'reverse';

interface FrameAnimationProps extends Omit<MoyuSpriteAttributes, 'area'> {
  /**
   * Direction of frame sequence layout in the sprite sheet
   */
  direction: 'horizontal' | 'vertical';

  /**
   * Total number of frames in the animation
   */
  frameCount: number;

  /**
   * Interval between frames in milliseconds
   */
  interval: number;

  /**
   * Loop configuration:
   * - false: play once
   * - true: loop infinitely
   * - number: loop N times
   */
  loop?: boolean | number;

  /**
   * Loop playback mode:
   * - 'none': play from start to end, then stop
   * - 'always': always loop from start to end
   * - 'bounce': ping-pong between start and end
   * - 'reverse': play from end to start when looping
   */
  loopMode?: LoopMode;
}

/**
 * Frame sequence animation component
 * Plays frame-based animations using sprite area to display different frames
 */
export function FrameAnimation({
  direction,
  frameCount,
  interval,
  loop = false,
  loopMode = 'none',
  ...spriteProps
}: FrameAnimationProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const playCountRef = useRef(0);
  const directionRef = useRef<1 | -1>(1); // 1 for forward, -1 for reverse

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentFrame((prevFrame) => {
        let nextFrame: number;

        if (loopMode === 'bounce') {
          // Ping-pong animation
          nextFrame = prevFrame + directionRef.current;

          if (nextFrame >= frameCount - 1) {
            directionRef.current = -1;
            nextFrame = frameCount - 1;
          } else if (nextFrame <= 0) {
            directionRef.current = 1;
            nextFrame = 0;
            playCountRef.current++;
          }
        } else if (loopMode === 'reverse') {
          // Reverse playback on loop
          if (playCountRef.current % 2 === 0) {
            // Forward
            nextFrame = prevFrame + 1;
            if (nextFrame >= frameCount) {
              playCountRef.current++;
              nextFrame = frameCount - 1;
            }
          } else {
            // Backward
            nextFrame = prevFrame - 1;
            if (nextFrame < 0) {
              playCountRef.current++;
              nextFrame = 0;
            }
          }
        } else {
          // Normal forward playback
          nextFrame = prevFrame + 1;

          if (nextFrame >= frameCount) {
            playCountRef.current++;
            nextFrame = 0;
          }
        }

        // Check if we should stop
        if (loop === false && playCountRef.current >= 1) {
          setIsPlaying(false);
          return loopMode === 'reverse' || loopMode === 'bounce' ? 0 : frameCount - 1;
        } else if (typeof loop === 'number' && playCountRef.current >= loop) {
          setIsPlaying(false);
          return loopMode === 'reverse' || loopMode === 'bounce' ? 0 : frameCount - 1;
        }

        return nextFrame;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, interval, frameCount, loop, loopMode]);

  // Calculate area based on current frame
  // Area format: [x1, y1, x2, y2] where x2/y2 are actual coordinates, not offsets
  const area: Tuple4 = (() => {
    if (direction === 'horizontal') {
      // Horizontal layout: frames are arranged left to right
      const frameWidth = 1.0 / frameCount;
      const x1 = currentFrame * frameWidth;
      const x2 = (currentFrame + 1) * frameWidth;
      return [x1, 0, x2, 1.0];
    } else {
      // Vertical layout: frames are arranged top to bottom
      const frameHeight = 1.0 / frameCount;
      const y1 = currentFrame * frameHeight;
      const y2 = (currentFrame + 1) * frameHeight;
      return [0, y1, 1.0, y2];
    }
  })();

  return <sprite {...spriteProps} area={area} />;
}
