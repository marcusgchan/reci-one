import React, { createContext, useContext } from "react";
import { DraggableSyntheticListeners } from "@dnd-kit/core";

interface Context {
  attributes: Record<string, any>;
  listeners: DraggableSyntheticListeners;
  ref(node: HTMLElement | null): void;
}

export const SortableItemContext = createContext<Context>({
  attributes: {},
  listeners: undefined,
  ref() {},
});

export function useSortableItemContext() {
  return useContext(SortableItemContext);
}
