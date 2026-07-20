import { executePluginCommand, useNavigation } from '@momoyu-ink/kit';
import { useCallback, useEffect, useState } from 'react';
import { uiActions } from '../state/ui';
import { restoreGameStateFromScenario } from '../utils/scenarioGameState';

export type BacklogMeta =
  | {
      kind: 'text';
      speaker: string;
      voice?: string;
      text: string;
    }
  | {
      kind: 'selection';
      options: string[];
    };

export interface BacklogRecord {
  id: string;
  createdAt: number;
  meta: BacklogMeta;
}

export function useBacklog() {
  const navigation = useNavigation();
  const [records, setRecords] = useState<BacklogRecord[]>([]);
  const [didLoadRecords, setDidLoadRecords] = useState(false);

  const refreshRecords = useCallback(async () => {
    try {
      const result = (await executePluginCommand('scenario', {
        subCommand: 'getRecords',
      })) as BacklogRecord[];
      setRecords([...(result ?? [])].reverse());
    } catch (error) {
      console.error('Failed to load backlog records:', error);
      uiActions.notify('读取历史记录失败');
    } finally {
      setDidLoadRecords(true);
    }
  }, []);

  useEffect(() => {
    void refreshRecords();
  }, [refreshRecords]);

  const close = useCallback(() => {
    navigation.popOverlay();
  }, [navigation]);

  const jumpToRecord = useCallback(
    async (recordId: string) => {
      try {
        const success = (await executePluginCommand('scenario', {
          subCommand: 'jumpToRecord',
          recordId,
        })) as boolean;

        if (!success) {
          uiActions.notify('跳转失败');
          return false;
        }

        await restoreGameStateFromScenario();
        navigation.popOverlay();
        return true;
      } catch (error) {
        console.error('Failed to jump to backlog record:', error);
        uiActions.notify('跳转失败');
        return false;
      }
    },
    [navigation],
  );

  return {
    records,
    didLoadRecords,
    jumpToRecord,
    close,
  };
}
