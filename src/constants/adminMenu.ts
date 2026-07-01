import {
  LayoutDashboard,
  Package,
  Layers3,
  ShoppingCart,
  Users,
  Settings,
} from "lucide-react";

export const adminMenu = [
  {
    titulo: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    titulo: "Produtos",
    href: "/admin/produtos",
    icon: Package,
  },
  {
    titulo: "Coleções",
    href: "/admin/produtos/colecao",
    icon: Layers3,
  },
  {
    titulo: "Pedidos",
    href: "/admin/pedidos",
    icon: ShoppingCart,
  },
  {
    titulo: "Usuários",
    href: "/admin/usuarios/gerenciar-usuarios",
    icon: Users,
  },
];

export const adminMenuBottom = [
  {
    titulo: "Configurações",
    href: "/admin/configuracoes",
    icon: Settings,
  },
];