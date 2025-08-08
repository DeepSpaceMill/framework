import { executePluginCommand } from '@momoyu-ink/kit';
import { useCallback, useEffect } from 'react';

/**
 * Custom hook to load a scenario with multiple stories and start a specific story.
 * It also provides a function to advance to the next line in the current story.
 *
 * @param {string[]} stories - An array of story names to load.
 * @param {string} startName - The name of the story to start.
 * @returns {Function} A function to advance to the next line in the current story.
 */
export function useScenario(stories: string[], startName: string) {
  useEffect(() => {
    const loadScenario = async () => {
      for (const story of stories) {
        try {
          await executePluginCommand('scenario', {
            subCommand: 'addStory',
            name: story,
            path: `scenario/${story}.sixu`,
          });
        } catch (error) {
          console.error(`Failed to load scenario:`, error);
        }
      }
    };

    loadScenario().then(async () => {
      try {
        await executePluginCommand('scenario', {
          subCommand: 'startStory',
          name: startName,
        });
      } catch (error) {
        console.error(`Failed to start scenario ${startName}:`, error);
      }
    });

    return () => {
      executePluginCommand('scenario', {
        subCommand: 'terminateStory',
        name: startName,
      });
    };
  }, [stories, startName]);

  return useCallback(() => {
    executePluginCommand('scenario', {
      subCommand: 'nextLine',
    });
  }, []);
}
