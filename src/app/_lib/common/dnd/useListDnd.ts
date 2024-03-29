"use client";

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
    }),
  );
  const [canDrag, setCanDrag] = useState(false);
  const toggleCanDrag = () => {
    setCanDrag((cd) => !cd);
  };
  return {
    canDrag,
    toggleCanDrag,
    sensors,
  };
}
