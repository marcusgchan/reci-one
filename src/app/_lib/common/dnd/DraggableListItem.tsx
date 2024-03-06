import { GrDrag } from "react-icons/gr";
import { useSortableItemContext } from "./SortableItemContext";

export function DraggableListItem({
  children,
  canDrag,
}: {
  canDrag: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, ref } = useSortableItemContext();
  return (
    <div className="flex h-10 items-stretch">
      {canDrag && (
        <button
          type="button"
          className="mr-2 touch-manipulation"
          {...attributes}
          {...listeners}
          ref={ref}
        >
          <GrDrag size={25} className="cursor-grab" />
        </button>
      )}
      {children}
    </div>
  );
}
