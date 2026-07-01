"use client";

import { Button } from "@/src/components/ui/button";
import {
  Copy,
  Edit3,
  Eye,
  EyeOff,
  Star,
  Trash2,
} from "lucide-react";

interface TableActionsProps {
  oculto?: boolean;
  destaque?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  onToggleHighlight: () => void;
}

export default function TableActions({
  oculto = false,
  destaque = false,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onToggleHighlight,
}: TableActionsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button variant="ghost" size="icon" onClick={onEdit} title="Editar">
        <Edit3 className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="icon" onClick={onDuplicate} title="Duplicar">
        <Copy className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleVisibility}
        title={oculto ? "Mostrar produto" : "Ocultar produto"}
      >
        {oculto ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleHighlight}
        title={destaque ? "Remover destaque" : "Destacar produto"}
      >
        <Star className={`h-4 w-4 ${destaque ? "fill-yellow-400 text-yellow-400" : ""}`} />
      </Button>

      <Button variant="ghost" size="icon" onClick={onDelete} title="Excluir">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}