export interface HomeConfig {
  id: string;

  tipo: string;

  referencia: string | null;

  ordem: number;

  ativo: boolean;

  banner_duracao: number;

  banner_transicao:
    | "fade"
    | "slide"
    | "zoom"
    | "none";

  banner_autoplay: boolean;

  banner_loop: boolean;
}