"use client";

import BannerItem from "./BannerItem";

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface Banner {
  id: number;
  imagem: string;
  ativo: boolean;
  ordem: number;
}

interface BannerListProps {
  banners: Banner[];

  onEdit: (id: number) => void;

  onDelete: (id: number) => void;

  onToggle: (
    id: number,
    ativo: boolean
  ) => void;

  onMove: (
  activeId: string,
  overId: string
) => void;
}

export default function BannerList({
  banners,
  onEdit,
  onDelete,
  onToggle,
  onMove,
}: BannerListProps) {
  if (!banners.length) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-500">
        Nenhum banner cadastrado.
      </div>
    );
  }

  const bannersOrdenados = [...banners].sort(
    (a, b) => a.ordem - b.ordem
  );

  function handleDragEnd(
    event: DragEndEvent
  ) {
    const { active, over } = event;

    if (!over) return;

    if (active.id === over.id) return;

    onMove(
      String(active.id),
      String(over.id)
    );
    console.log(active.id, over.id);
  }


  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={bannersOrdenados.map(
          (banner) => banner.id
        )}
        strategy={
          verticalListSortingStrategy
        }
      >
        <div className="space-y-5">
          {bannersOrdenados.map(
            (banner) => (
              <BannerItem
                key={banner.id}
                id={banner.id}
                ordem={banner.ordem}
                imagem={banner.imagem}
                ativo={banner.ativo}
                onEdit={() =>
                  onEdit(banner.id)
                }
                onDelete={() =>
                  onDelete(banner.id)
                }
                onToggle={(
                  checked
                ) =>
                  onToggle(
                    banner.id,
                    checked
                  )
                }
              />
            )
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}