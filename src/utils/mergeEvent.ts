import type { BubbleEvent, HaiEvent, HaiEventHandler } from '@doufu-moe/kit';

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
  handlers: HaiEventHandler<T> | HaiEventHandler<T>[] | undefined,
  defaultHandler?: HaiEventHandler<K>,
) {
  return (e: T | K) => {
    if (!handlers) {
      return defaultHandler?.(e as K);
    }

    let _handlers: HaiEventHandler<T | K>[];
    if (!Array.isArray(handlers)) {
      _handlers = [handlers as HaiEventHandler<T | K>];
    } else {
      _handlers = handlers as HaiEventHandler<T | K>[];
    }

    for (const handler of _handlers) {
      handler(e);
    }

    if (!e.defaultPrevented) {
      defaultHandler?.(e as K);
    }
  };
}
