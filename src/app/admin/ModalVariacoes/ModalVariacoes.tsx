"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";

import FooterVariacoes from "@/src/app/admin/ModalVariacoes/componentes/FooterVariacoes";

import AtributosTab from "./AtributosTab";
import CombinacoesTab from "./CombinacoesTab";

import { useVariacoes } from "@/src/hooks/useVariacoes";

interface ModalVariacoesProps {
  isOpen: boolean;
  onClose: () => void;
  produtoId: number;
  produtoNome: string;
  produtoImagem?: string | null;
}

export default function ModalVariacoes({
  isOpen,
  onClose,
  produtoId,
  produtoNome,
  produtoImagem,
}: ModalVariacoesProps) {
  const [aba, setAba] =
    useState("atributos");

  const variacoes =
    useVariacoes(produtoId);

  async function gerarCombinacoes() {
    await variacoes.gerarTodasCombinacoes(
      produtoNome
    );
  }

  async function salvarTudo() {
    // Vamos implementar no próximo passo
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="
          flex
          h-[82vh]
          w-[95vw]
          max-w-[1100px]
          flex-col
          overflow-hidden
          rounded-2xl
          p-0
        "
        onInteractOutside={(e) =>
          e.preventDefault()
        }
        onEscapeKeyDown={(e) =>
          e.preventDefault()
        }
      >
        <DialogHeader className="border-b px-8 py-5">
          <DialogTitle className="text-3xl font-bold">
            Variações - {produtoNome}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={aba}
          onValueChange={setAba}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex justify-center border-b py-5">
            <TabsList className="h-11 w-[360px]">
              <TabsTrigger
                value="atributos"
                className="flex-1"
              >
                ATRIBUTOS
              </TabsTrigger>

              <TabsTrigger
                value="combinacoes"
                className="flex-1"
              >
                COMBINAÇÕES
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent
              value="atributos"
              className="mt-0 h-full overflow-y-auto px-10 py-8"
            >
              <AtributosTab
                produtoId={produtoId}
                produtoNome={produtoNome}
                produtoImagem={produtoImagem}

                variacoesHook={
                  variacoes
                }
              />
            </TabsContent>

            <TabsContent
              value="combinacoes"
              className="mt-0 h-full overflow-y-auto px-10 py-8"
            >
              <CombinacoesTab
                produtoId={produtoId}
                produtoNome={produtoNome}
                produtoImagem={produtoImagem}

                variacoesHook={
                  variacoes
                }
              />
            </TabsContent>
          </div>

          <FooterVariacoes
            aba={aba}
            onGerar={gerarCombinacoes}
            onSalvar={salvarTudo}
          />
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}