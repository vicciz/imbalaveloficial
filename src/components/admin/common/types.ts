import { Area } from "react-easy-crop";
import { Produto, ProdutoImagem } from "@/src/services/produtos";

export interface Categoria {
    id: number;
    nome: string;
}

export interface FormProdutoProps {
    modo: "criar" | "editar";
    produtoId?: number;
}

export interface InformacoesProps {
    produto: Partial<Produto>;
    setProduto: React.Dispatch<
        React.SetStateAction<Partial<Produto>>
    >;
}

export interface ConfiguracoesProps {
    produto: Partial<Produto>;
    setProduto: React.Dispatch<
        React.SetStateAction<Partial<Produto>>
    >;

    categorias: Categoria[];
}

export interface MarkdownEditorProps {
    value: string;
    onChange(value: string): void;
}

export interface GaleriaImagensProps {
    imagens: ProdutoImagem[];
    setImagens: React.Dispatch<
        React.SetStateAction<ProdutoImagem[]>
    >;
    abrirCropper: (imagem: ProdutoImagem) => void;
}

export interface CropperModalProps {
    open: boolean;

    image: string;

    onClose(): void;

    onSave(croppedArea: Area): void;
}

export interface ImagemFormulario {

    id?: number;

    file?: File;

    preview: string;

    principal: boolean;

    ordem: number;

}