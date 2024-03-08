import { createContext, useContext } from "react";
import { type DraggableSyntheticListeners } from "@dnd-kit/core";

interface Context {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: Record<string, any>;
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
