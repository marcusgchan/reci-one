import { GrDrag } from "react-icons/gr";
import { useSortableItemContext } from "./SortableItemContext";

export function DraggableListItem({
  children,
  canDrag,
}: {
  canDrag: boolean;
  children: React.ReactNode;
}) {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { attributes, listeners, ref: r } = useSortableItemContext();
  return (
    <div className="flex h-10 items-stretch">
      {canDrag && (
        <button
          type="button"
          className="mr-2 touch-manipulation"
          {...attributes}
          {...listeners}
          ref={r}
        >
          <GrDrag size={25} className="cursor-grab" />
        </button>
      )}
      {children}
    </div>
  );
}
