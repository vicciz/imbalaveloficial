-- Criação da tabela produto_avaliacao
-- Execute estes comandos no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS produto_avaliacao (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_produto INT NOT NULL REFERENCES produto(id) ON DELETE CASCADE,
  id_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nota INT NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_produto, id_usuario)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_produto_avaliacao_produto ON produto_avaliacao(id_produto);
CREATE INDEX IF NOT EXISTS idx_produto_avaliacao_usuario ON produto_avaliacao(id_usuario);
CREATE INDEX IF NOT EXISTS idx_produto_avaliacao_criado ON produto_avaliacao(criado_em DESC);

-- Política de RLS (Row Level Security)
ALTER TABLE produto_avaliacao ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública de todas as avaliações
CREATE POLICY "Avaliações são públicas para leitura"
  ON produto_avaliacao
  FOR SELECT
  USING (true);

-- Permitir que usuários criem apenas suas próprias avaliações
CREATE POLICY "Usuários podem criar suas próprias avaliações"
  ON produto_avaliacao
  FOR INSERT
  WITH CHECK (auth.uid() = id_usuario);

-- Permitir que usuários atualizem apenas suas próprias avaliações
CREATE POLICY "Usuários podem atualizar suas próprias avaliações"
  ON produto_avaliacao
  FOR UPDATE
  USING (auth.uid() = id_usuario)
  WITH CHECK (auth.uid() = id_usuario);

-- Permitir que usuários deletem apenas suas próprias avaliações
CREATE POLICY "Usuários podem deletar suas próprias avaliações"
  ON produto_avaliacao
  FOR DELETE
  USING (auth.uid() = id_usuario);

-- Opcional: Criar um trigger para atualizar o timestamp 'atualizado_em'
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_atualizado_em
BEFORE UPDATE ON produto_avaliacao
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em();
