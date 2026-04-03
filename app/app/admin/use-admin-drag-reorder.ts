"use client";

import { useCallback, useEffect, useOptimistic, useRef, useState, useTransition, type DragEvent } from "react";

type SortableItem = {
  id: string;
};

type PersistOrderAction = (formData: FormData) => Promise<void>;

export function useAdminDragReorder<TItem extends SortableItem>(
  orderedItemsFromProps: TItem[],
  persistOrderAction: PersistOrderAction,
) {
  const [orderedItems, setOrderedItems] = useOptimistic<TItem[]>(orderedItemsFromProps);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const dragOrderRef = useRef<TItem[]>(orderedItemsFromProps);
  const dragDidDropRef = useRef(false);
  const [isSavingOrder, startSavingOrder] = useTransition();

  useEffect(() => {
    dragOrderRef.current = orderedItemsFromProps;
  }, [orderedItemsFromProps]);

  const moveItemInList = useCallback(
    (fromId: string, toId: string) => {
      if (fromId === toId) {
        return;
      }

      setOrderedItems((current) => {
        const fromIndex = current.findIndex((item) => item.id === fromId);
        const toIndex = current.findIndex((item) => item.id === toId);

        if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
          return current;
        }

        const next = [...current];
        const [movedItem] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, movedItem);
        dragOrderRef.current = next;
        return next;
      });
    },
    [setOrderedItems],
  );

  const persistOrder = useCallback(() => {
    const formData = new FormData();
    formData.set("orderedIds", JSON.stringify(dragOrderRef.current.map((item) => item.id)));

    startSavingOrder(async () => {
      try {
        await persistOrderAction(formData);
      } catch (error) {
        console.error("persistOrderAction failed", error);
        setOrderedItems(orderedItemsFromProps);
        dragOrderRef.current = orderedItemsFromProps;
      }
    });
  }, [orderedItemsFromProps, persistOrderAction, setOrderedItems]);

  const getRowDragProps = useCallback(
    (itemId: string) => ({
      draggable: !isSavingOrder,
      onDragStart: (event: DragEvent<HTMLDivElement>) => {
        setDraggedItemId(itemId);
        dragOrderRef.current = orderedItems;
        dragDidDropRef.current = false;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", itemId);
      },
      onDragOver: (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (!draggedItemId || draggedItemId === itemId) {
          return;
        }

        moveItemInList(draggedItemId, itemId);
      },
      onDrop: (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (!draggedItemId) {
          return;
        }

        if (draggedItemId !== itemId) {
          moveItemInList(draggedItemId, itemId);
        }

        dragDidDropRef.current = true;
        setDraggedItemId(null);
        persistOrder();
      },
      onDragEnd: () => {
        const didReorder = draggedItemId !== null;
        setDraggedItemId(null);

        if (didReorder && !dragDidDropRef.current) {
          persistOrder();
        }

        dragDidDropRef.current = false;
      },
    }),
    [draggedItemId, isSavingOrder, moveItemInList, orderedItems, persistOrder],
  );

  return {
    orderedItems,
    draggedItemId,
    isSavingOrder,
    getRowDragProps,
  };
}
