import type { HaiEvent, HaiEventHandler } from "@doufu-moe/kit";

/**
 * Merge multiple event handlers into one.
 *
 * defaultHandler will be called if no event handler calls [e.preventDefault()].
 *
 * @param handlers - The event handlers to merge.
 * @param defaultHandler - The default event handler.
 * @returns The merged event handler.
 */
export function mergeEvent(
  handlers: HaiEventHandler | HaiEventHandler[] | undefined,
  defaultHandler?: HaiEventHandler
) {
  return (e: HaiEvent) => {
    if (!handlers) {
      return defaultHandler?.(e);
    }

    let _handlers: HaiEventHandler[];
    if (!Array.isArray(handlers)) {
      _handlers = [handlers];
    } else {
      _handlers = handlers;
    }

    for (const handler of _handlers) {
      handler(e);
    }

    if (!e.defaultPrevented) {
      defaultHandler?.(e);
    }
  };
}
