import { useState, useEffect } from 'react';
import { addEventListener, KeyboardEvent } from '@momoyu-ink/kit';

interface StageState {
  paused: boolean;
  autoMode: boolean;
  skipMode: boolean;
  currentScenario: string;
}

export function useStageManager(nextLine: () => void) {
  const [stageState, setStageState] = useState<StageState>({
    paused: false,
    autoMode: false,
    skipMode: false,
    currentScenario: 'example',
  });

  useEffect(() => {
    return addEventListener('scenarionextline', (e) => {
      if (e.type === 'commandline') {
        // Handle stage commands like pause, auto, skip
        // This will be implemented when command definitions are available
      } else if (e.type === 'finished') {
        setStageState((prev) => ({ ...prev, paused: true }));
      }
    });
  }, []);

  const handleAdvance = (
    textBoxVisible: boolean,
    textProgress: number,
    finishPrinting: () => void
  ) => {
    if (!textBoxVisible) {
      return true; // Show textbox
    }

    if (textProgress < 1) {
      finishPrinting();
      return false;
    } else {
      nextLine();
      return false;
    }
  };

  const handleToggleTextBox = (textBoxVisible: boolean) => {
    return !textBoxVisible;
  };

  const setAutoMode = (auto: boolean) => {
    setStageState((prev) => ({ ...prev, autoMode: auto }));
  };

  const setSkipMode = (skip: boolean) => {
    setStageState((prev) => ({ ...prev, skipMode: skip }));
  };

  const setPaused = (paused: boolean) => {
    setStageState((prev) => ({ ...prev, paused }));
  };

  return {
    stageState,
    handleAdvance,
    handleToggleTextBox,
    setAutoMode,
    setSkipMode,
    setPaused,
  };
}
