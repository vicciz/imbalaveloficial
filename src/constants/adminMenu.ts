import {
  LayoutDashboard,
  Package,
  Layers3,
  ShoppingCart,
  Users,
  Settings,
  Tags,
  Building2,
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
    titulo: "Categorias",
    href: "/admin/produtos/categoria",
    icon: Tags,
  },
  {
    titulo: "Fornecedores",
    href: "/admin/produtos/fornecedores",
    icon: Building2,
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

export const optionsProduto =[{
  titulo:"editar",
  href:"/admin/produtos/editar"
}];