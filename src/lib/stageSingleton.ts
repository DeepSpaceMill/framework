import { createStage } from '@momoyu-ink/kit';

export type StageInstance = ReturnType<typeof createStage>;

type StageGlobal = typeof globalThis & {
  __MOYU_FRAMEWORK_STAGE__?: StageInstance;
};

export function getStageSingleton(): StageInstance {
  const stageGlobal = globalThis as StageGlobal;
  if (stageGlobal.__MOYU_FRAMEWORK_STAGE__ === undefined) {
    // Keep the stage instance stable across Fast Refresh so runtime state can survive code updates.
    stageGlobal.__MOYU_FRAMEWORK_STAGE__ = createStage();
  }
  return stageGlobal.__MOYU_FRAMEWORK_STAGE__;
}
