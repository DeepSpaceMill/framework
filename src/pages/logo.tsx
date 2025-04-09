import React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useSpring, animated, useSpringRef } from '@momoyu-ink/kit';
import { EntryContext } from '../entry';

export interface LogoPageProps {
  src: string;
}

export function LogoPage({ src }: LogoPageProps) {
  const context = useContext(EntryContext);
  const [phase, setPhase] = useState(0); // Track the current animation phase

  const transitions = [
    { opacity: 0, duration: 0 }, // Initial invisible state
    { opacity: 0.001, duration: 800 }, // Initial invisible state
    { opacity: 1.001, duration: 1500 }, // Fade in
    { opacity: 1, duration: 1000 }, // Stay visible
    { opacity: 0, duration: 1200 }, // Fade out
  ];

  const api = useSpringRef();
  const { opacity } = useSpring({
    ref: api,
    opacity: transitions[phase].opacity,
    config: { duration: transitions[phase].duration },
    onRest: () => {
      if (phase < transitions.length - 1) {
        setPhase((prev) => {
          return prev + 1;
        });
      } else {
        context.setPage('title');
      }
    },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: we need to recall start when phase changes
  useEffect(() => {
    api.start();
  }, [phase, api]);

  useEffect(() => {
    setPhase((prev) => Math.min(prev + 1, transitions.length - 1));
  }, []);

  const handleClick = () => {
    api.set({ opacity: transitions[phase].opacity });
  };

  return <animated.sprite label="背景图" src={src} opacity={opacity} onClick={handleClick} />;
}
