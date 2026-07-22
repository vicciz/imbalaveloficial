export interface PerfilUserLike {
  id: number
  nome: string
  email: string
  endereco?: string
  image?: string
  role?: string
  created_at?: string
  createdAt?: string
}

export function getInitials(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

export function getRoleLabel(role?: string) {
  const normalizedRole = role?.trim().toLowerCase()

  if (normalizedRole === "admin") {
    return "Administrador"
  }

  return "Cliente Premium"
}

export function formatMemberSince(user: PerfilUserLike) {
  const rawDate = user.created_at ?? user.createdAt

  if (!rawDate) {
    return "Membro desde 07/2026"
  }

  const date = new Date(rawDate)

  if (Number.isNaN(date.getTime())) {
    return "Membro desde 07/2026"
  }

  return `Membro desde ${date.toLocaleDateString("pt-BR", {
    month: "2-digit",
    year: "numeric",
  })}`
}