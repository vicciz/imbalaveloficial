import { BadgeCheck } from "lucide-react"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"

import {
  formatMemberSince,
  getInitials,
  getRoleLabel,
  type PerfilUserLike,
} from "../../utils/profile-utils"

interface AvatarCardProps {
  user: PerfilUserLike
}

export default function AvatarCard({ user }: AvatarCardProps) {
  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className="space-y-5 p-0">
        <div className="h-24 bg-linear-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6]" />

        <div className="space-y-5 px-6 pb-6">
          <div className="-mt-12 flex items-start gap-4">
            <Avatar className="size-24 border-4 border-white ring-4 ring-violet-50">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.nome} />
              ) : null}
              <AvatarFallback className="bg-linear-to-br from-[#6D28D9] to-[#8B5CF6] text-2xl font-semibold text-white">
                {getInitials(user.nome)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-2 pt-12">
              <div>
                <h2 className="truncate text-2xl font-semibold text-slate-900">
                  {user.nome}
                </h2>
                <p className="mt-1 break-all text-sm text-slate-500">
                  {user.email}
                </p>
              </div>

              <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                {getRoleLabel(user.role)}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-medium text-slate-800">
              <BadgeCheck className="size-4 text-emerald-600" />
              <span>Conta verificada</span>
            </div>
            <p>{formatMemberSince(user)}</p>
          </div>

          <Button
            type="button"
            className="w-full rounded-2xl bg-linear-to-r from-[#6D28D9] to-[#8B5CF6] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Editar foto
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}