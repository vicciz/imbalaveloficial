export interface HeaderUser {
  nome: string;
  email?: string;
  role?: "admin" | "user" | string;
}