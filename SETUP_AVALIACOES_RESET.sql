-- Script para resetar a tabela produto_avaliacao
-- Use este script se o anterior falhou

-- 1. Deletar políticas RLS existentes (se existirem)
DROP POLICY IF EXISTS "Avaliações são públicas para leitura" ON produto_avaliacao;
DROP POLICY IF EXISTS "Usuários podem criar suas próprias avaliações" ON produto_avaliacao;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias avaliações" ON produto_avaliacao;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias avaliações" ON produto_avaliacao;

-- 2. Deletar trigger se existir
DROP TRIGGER IF EXISTS trigger_update_atualizado_em ON produto_avaliacao;

-- 3. Deletar função se existir
DROP FUNCTION IF EXISTS update_atualizado_em();

-- 4. Deletar a tabela (CASCADE remove índices automaticamente)
DROP TABLE IF EXISTS produto_avaliacao CASCADE;

-- 5. Criar a tabela corrigida
CREATE TABLE produto_avaliacao (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_produto INT NOT NULL REFERENCES produto(id) ON DELETE CASCADE,
  id_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nota INT NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_produto, id_usuario)
);

-- 6. Criar índices
CREATE INDEX idx_produto_avaliacao_produto ON produto_avaliacao(id_produto);
CREATE INDEX idx_produto_avaliacao_usuario ON produto_avaliacao(id_usuario);
CREATE INDEX idx_produto_avaliacao_criado ON produto_avaliacao(criado_em DESC);

-- 7. Habilitar RLS
ALTER TABLE produto_avaliacao ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas RLS
CREATE POLICY "Avaliações são públicas para leitura"
  ON produto_avaliacao
  FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem criar suas próprias avaliações"
  ON produto_avaliacao
  FOR INSERT
  WITH CHECK (auth.uid() = id_usuario);

CREATE POLICY "Usuários podem atualizar suas próprias avaliações"
  ON produto_avaliacao
  FOR UPDATE
  USING (auth.uid() = id_usuario)
  WITH CHECK (auth.uid() = id_usuario);

CREATE POLICY "Usuários podem deletar suas próprias avaliações"
  ON produto_avaliacao
  FOR DELETE
  USING (auth.uid() = id_usuario);

-- 9. Criar trigger para atualizar timestamp
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

-- Confirmação
SELECT 'Tabela produto_avaliacao criada com sucesso!' as mensagem;
