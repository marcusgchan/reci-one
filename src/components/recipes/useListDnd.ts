import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { useState } from "react";

export function useListDnd() {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
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
