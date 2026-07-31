"use client";

import Image from "next/image";
import {
  Pencil,
  Trash2,
  GripVertical,
} from "lucide-react";
import {
  useSortable,
} from "@dnd-kit/sortable";

import {
  CSS,
} from "@dnd-kit/utilities";
import { Switch } from "@/src/components/ui/switch";
import { cn } from "@/src/lib/utils";

interface BannerItemProps {
  id: number;
  ordem: number;
  imagem: string;
  ativo: boolean;

  onEdit: () => void;
  onDelete: () => void;
  onToggle: (value: boolean) => void;
}

export default function BannerItem({
  id,
  ordem,
  imagem,
  ativo,
  onEdit,
  onDelete,
  onToggle,
}: BannerItemProps) {

const {
  attributes,
  listeners,
  setNodeRef,
  transform,
  transition,
} = useSortable({
  id,
});
const style = {
  transform: CSS.Transform.toString(
    transform
  ),
  transition,
  };
  
  return (
    <div
  ref={setNodeRef}
  style={style}
     >

     <button
  {...attributes}
  {...listeners}>
        <GripVertical size={22} />
      </button>

      {/* Conteúdo */}

      <div className="flex-1">

        {/* Badge */}

        <span
          className="
            mb-2
            inline-flex
            rounded-full
            bg-violet-100
            px-3
            py-1
            text-xs
            font-semibold
            text-violet-700
          "
        >
          #{ordem}
        </span>

        {/* Banner */}

        <div
          className="
            relative
            overflow-hidden
            rounded-xl
            border
          "
        >
          <Image
            src={imagem}
            alt={`Banner ${ordem}`}
            width={1920}
            height={500}
            className="
              h-44
              w-full
              object-cover
            "
          />
        </div>
      </div>

      {/* Ações */}

      <div className="flex items-center gap-5">

        <Switch
          checked={ativo}
          onCheckedChange={onToggle}
        />

        <button
          onClick={onEdit}
          className="
            text-zinc-500
            transition
            hover:text-violet-600
          "
        >
          <Pencil size={18} />
        </button>

        <button
          onClick={onDelete}
          className="
            text-zinc-500
            transition
            hover:text-red-600
          "
        >
          <Trash2 size={18} />
        </button>

      </div>
    </div>
  );
}
