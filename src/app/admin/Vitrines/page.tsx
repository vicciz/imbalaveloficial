"use client";

import { useEffect, useState } from "react";

import {

  listarVitrines,

} from "@/src/services/vitrine/index";
import { VitrineForm } from "./componentes";
import type {

  VitrineSecao,

} from "@/src/services/vitrine/types";

import { AdminLayout } from "@/src/components/layout/Admin";
import { alterarStatusVitrine, excluirVitrine } from "@/src/services/vitrine/index";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

import { Button } from "@/src/components/ui/button";
import VitrineCard from "@/src/services/vitrine/VitrineCard";
export default function Page() {

  const [vitrines, setVitrines] =

    useState<VitrineSecao[]>([]);

  const [editing, setEditing] =

    useState<VitrineSecao | null>(null);
  const [open, setOpen] = useState(false);
  async function carregar() {

    const { data } = await listarVitrines();

    setVitrines(data ?? []);

  }

  useEffect(() => {

    carregar();

  }, []);

  async function alterarStatus(
  vitrine: VitrineSecao,
  ativo: boolean
) {

  await alterarStatusVitrine(
    vitrine.id,
    ativo
  );

  carregar();

}
async function excluir(id: number) {

  const confirmar = window.confirm(
    "Deseja realmente excluir esta vitrine?"
  );

  if (!confirmar) return;

  const { error } = await excluirVitrine(id);

  if (error) {

    alert("Erro ao excluir.");

    return;

  }

  carregar();

}

  return (
<AdminLayout>
    <div className="space-y-6">
      <div className="flex justify-between items-center">

    <div>

        <h1 className="text-3xl font-bold">

            Vitrines

        </h1>

        <p className="text-muted-foreground">

            Configure as vitrines da página inicial.

        </p>

    </div>

    <Button

        onClick={() => {

            setEditing(null);

            setOpen(true);

        }}

    >

        Nova vitrine

    </Button>

</div>
     <div className="space-y-8">

  {vitrines.map(vitrine => (

    <VitrineCard

      key={vitrine.id}

      vitrine={vitrine}

      onEdit={(v) => {

        setEditing(v);

        setOpen(true);

      }}

      onDelete={excluir}

      onToggle={alterarStatus}

    />

  ))}

</div>

    <Dialog
    open={open}
    onOpenChange={setOpen}
>

   <DialogContent className="max-w-6xl p-8">

          <DialogHeader>

              <DialogTitle>

                  {editing

                      ? "Editar Vitrine"

                      : "Nova Vitrine"}

              </DialogTitle>

          </DialogHeader>

          <VitrineForm

              vitrine={editing}

              onSuccess={() => {

                  carregar();

                  setOpen(false);

                  setEditing(null);

              }}

          />

      </DialogContent>

</Dialog>

    </div>
  </AdminLayout>

  );

}