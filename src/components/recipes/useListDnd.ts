import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { useState } from "react";

export function useListDnd() {
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
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
