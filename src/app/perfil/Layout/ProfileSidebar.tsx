"use client"

import { Menu, LogOut } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { ScrollArea } from "@/src/components/ui/scroll-area"

import AvatarCard from "../components/cards/AvatarCard"
import ProfileMenu, { type ProfileMenuItem } from "./ProfileMenu"
import type { PerfilUserLike } from "../utils/profile-utils"

interface ProfileSidebarProps {
  user: PerfilUserLike
  menuItems: ProfileMenuItem[]
  activeId: string
  onSelect: (id: string) => void
  onLogout: () => void
}

function MobileDrawer({
  user,
  menuItems,
  activeId,
  onSelect,
}: ProfileSidebarProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-2xl border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg md:hidden"
        >
          <Menu className="mr-2 size-4" />
          Abrir menu
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton
        className="fixed inset-y-0 left-0 top-0 h-full w-[88vw] max-w-sm translate-x-0 translate-y-0 rounded-none border-r border-slate-200 bg-[#F8F8FC] p-0 sm:w-95"
      >
        <DialogHeader className="border-b border-slate-200 px-5 py-5">
          <DialogTitle className="text-lg font-semibold text-slate-900">
            Minha Conta
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(100vh-84px)]">
          <div className="space-y-5 p-5">
            <AvatarCard user={user} />
            <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
              <ProfileMenu
                items={menuItems}
                activeId={activeId}
                onSelect={onSelect}
              />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default function ProfileSidebar({
  user,
  menuItems,
  activeId,
  onSelect,
  onLogout,
}: ProfileSidebarProps) {
  return (
    <aside className="space-y-5">
      <div className="md:hidden">
        <MobileDrawer
          user={user}
          menuItems={menuItems}
          activeId={activeId}
          onSelect={onSelect}
          onLogout={onLogout}
        />
      </div>

      <div className="hidden md:block lg:block">
        <AvatarCard user={user} />
      </div>

      <div className="sticky top-24 hidden md:block">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-4 lg:hidden">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <LogOut className="size-4 rotate-180 opacity-0" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Minha Conta</p>
                <p className="text-xs text-slate-500">Navegação rápida</p>
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-[calc(100vh-220px)] p-3">
            <ProfileMenu
              items={menuItems}
              activeId={activeId}
              onSelect={onSelect}
            />
          </ScrollArea>
        </div>
      </div>
    </aside>
  )
}