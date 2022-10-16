import {
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import { useState } from "react";

/**
 * An extended "PointerSensor" that prevent some
 * interactive html element(button, input, textarea, select, option...) from dragging
 */
class SmartPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: "onPointerDown" as any,
      handler: ({ nativeEvent: event }: React.PointerEvent) => {
        return shouldHandleEvent(event.target as HTMLElement);
      },
    },
  ];
}

class SmartKeyboardSensor extends KeyboardSensor {
  static activators = [
    {
      eventName: "onKeyDown" as const,
      handler: ({ nativeEvent: event }: React.KeyboardEvent<Element>) => {
        console.log(event, shouldHandleEvent(event.target as HTMLElement));
        return shouldHandleEvent(event.target as HTMLElement);
      },
    },
  ];
}

function shouldHandleEvent(element: HTMLElement | null) {
  let cur = element;

  while (cur) {
    if (cur.dataset && cur.dataset.noDnd) {
      return false;
    }
    cur = cur.parentElement;
  }

  return true;
}

export function useListDnd() {
  const sensors = useSensors(
    useSensor(SmartPointerSensor),
    useSensor(SmartKeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [canDrag, setCanDrag] = useState(false);
  const toggleCanDrag = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setCanDrag((cd) => !cd);
  };
  return {
    canDrag,
    toggleCanDrag,
    sensors,
  };
}
