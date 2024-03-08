import { createContext, useContext } from "react";
import { type DraggableSyntheticListeners } from "@dnd-kit/core";

interface Context {
  attributes: Record<string, unknown>;
  listeners: DraggableSyntheticListeners;
  ref(node: HTMLElement | null): void;
}

export const SortableItemContext = createContext<Context>({
  attributes: {},
  listeners: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ref() {},
});

export function useSortableItemContext() {
  return useContext(SortableItemContext);
}
