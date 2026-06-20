import {
  animated,
  easings,
  getStageSize,
  useIsSeeking,
  type SpringValues,
  useIsSkipping,
  useSkipCallback,
  useSpring,
  useSpringRef,
} from '@momoyu-ink/kit';
import { Children, cloneElement, isValidElement, useCallback, useEffect, type ReactNode } from 'react';
import { useSnapshot } from 'valtio';
import { gameState } from '../state/game';
import { getCameraPlaneTargets } from '../lib/camera';

interface CameraSpringState {
  backgroundX: number;
  backgroundY: number;
  backgroundScale: number;
  characterX: number;
  characterY: number;
  characterScale: number;
  blur: number;
}

interface CameraPlaneRuntimeProps {
  width: number;
  height: number;
  springs: SpringValues<CameraSpringState>;
}

interface CameraPlaneProps {
  children: ReactNode;
  cameraRuntime?: CameraPlaneRuntimeProps;
}

interface CameraActorProps {
  children: ReactNode;
}

function buildBlurFilters(radius: number) {
  if (radius <= 0.01) {
    return [];
  }

  return [{ type: 'blur', radius }];
}

export function BackgroundPlane({ children, cameraRuntime }: CameraPlaneProps) {
  if (cameraRuntime === undefined) {
    return <>{children}</>;
  }

  const { width, height, springs } = cameraRuntime;

  return (
    <animated.container
      label="背景镜头平面"
      x={springs.backgroundX.to((value: number) => width / 2 + value)}
      y={springs.backgroundY.to((value: number) => height / 2 + value)}
      scale={springs.backgroundScale}
    >
      {/* Blur is isolated to the background plane so we fake depth of field without softening characters. */}
      <animated.filter filters={springs.blur.to((value: number) => buildBlurFilters(value)) as any}>
        <container x={-width / 2} y={-height / 2}>
          {children}
        </container>
      </animated.filter>
    </animated.container>
  );
}

export function CharacterPlane({ children, cameraRuntime }: CameraPlaneProps) {
  if (cameraRuntime === undefined) {
    return <>{children}</>;
  }

  const { width, height, springs } = cameraRuntime;

  return (
    <animated.container
      label="角色镜头平面"
      x={springs.characterX.to((value: number) => width / 2 + value)}
      y={springs.characterY.to((value: number) => height / 2 + value)}
      scale={springs.characterScale}
    >
      <container x={-width / 2} y={-height / 2}>
        {children}
      </container>
    </animated.container>
  );
}

export function CameraActor({ children }: CameraActorProps) {
  const cameraState = useSnapshot(gameState.camera);
  const skipping = useIsSkipping();
  const seeking = useIsSeeking();
  const shouldSkipVisuals = skipping || seeking;
  const stageSize = getStageSize();
  const springRef = useSpringRef();
  const { width, height } = stageSize;
  const { x, y, zoom, depth, blur, fadeTime } = cameraState;
  const initialTargets = getCameraPlaneTargets(cameraState, { width, height });

  // Only the background and character planes live under the camera. Textbox,
  // overlays, and headless actors stay outside so UI never zooms with the scene.
  const [springs] = useSpring(
    () => ({
      ref: springRef,
      backgroundX: initialTargets.backgroundX,
      backgroundY: initialTargets.backgroundY,
      backgroundScale: initialTargets.backgroundScale,
      characterX: initialTargets.characterX,
      characterY: initialTargets.characterY,
      characterScale: initialTargets.characterScale,
      blur: cameraState.blur,
      config: {
        duration: shouldSkipVisuals ? 0 : cameraState.fadeTime,
        easing: easings.easeInOutCubic,
      },
    }),
    [],
  );

  useEffect(() => {
    const targets = getCameraPlaneTargets({ x, y, zoom, depth, blur }, { width, height });
    springRef.start({
      backgroundX: targets.backgroundX,
      backgroundY: targets.backgroundY,
      backgroundScale: targets.backgroundScale,
      characterX: targets.characterX,
      characterY: targets.characterY,
      characterScale: targets.characterScale,
      blur,
      config: {
        duration: shouldSkipVisuals ? 0 : fadeTime,
        easing: easings.easeInOutCubic,
      },
    });
  }, [blur, depth, fadeTime, height, shouldSkipVisuals, springRef, width, x, y, zoom]);

  // Skip should immediately settle both planes at the final target so visual
  // state and flow-control timing stay consistent.
  const finishTransition = useCallback(() => {
    const targets = getCameraPlaneTargets(gameState.camera, { width, height });
    springRef.set({
      backgroundX: targets.backgroundX,
      backgroundY: targets.backgroundY,
      backgroundScale: targets.backgroundScale,
      characterX: targets.characterX,
      characterY: targets.characterY,
      characterScale: targets.characterScale,
      blur: gameState.camera.blur,
    });
  }, [height, springRef, width]);

  useSkipCallback(finishTransition);

  const cameraRuntime: CameraPlaneRuntimeProps = {
    width,
    height,
    springs,
  };

  return (
    <container label="镜头容器">
      {Children.map(children, (child) => {
        if (!isValidElement(child)) {
          return child;
        }

        return cloneElement(child as React.ReactElement<CameraPlaneProps>, {
          cameraRuntime,
        });
      })}
    </container>
  );
}
