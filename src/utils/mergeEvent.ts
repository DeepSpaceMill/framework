import type { BubbleEvent, MoyuEvent, MoyuEventHandler } from '@momoyu-ink/kit';

/**
 * Merge multiple event handlers into one.
 *
 * defaultHandler will be called if no event handler calls [e.preventDefault()].
 *
 * @param handlers - The event handlers to merge.
 * @param defaultHandler - The default event handler.
 * @returns The merged event handler.
 */
export function mergeEvent<T extends BubbleEvent, K extends BubbleEvent>(
  handlers: MoyuEventHandler<T> | MoyuEventHandler<T>[] | undefined,
  defaultHandler?: MoyuEventHandler<K>,
) {
  return (e: T | K) => {
    if (!handlers) {
      return defaultHandler?.(e as K);
    }

    let _handlers: MoyuEventHandler<T | K>[];
    if (!Array.isArray(handlers)) {
      _handlers = [handlers as MoyuEventHandler<T | K>];
    } else {
      _handlers = handlers as MoyuEventHandler<T | K>[];
    }

    for (const handler of _handlers) {
      handler(e);
    }

    if (!e.defaultPrevented) {
      defaultHandler?.(e as K);
    }
  };
}
