# Guia de Deploy no Hostgator

## Pré-requisitos
- Node.js 18+ instalado localmente
- npm ou yarn
- Acesso FTP ou cPanel do Hostgator

## Passos para Build

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Edite o arquivo `.env.production` com a URL correta da sua API:
```
NEXT_PUBLIC_API_URL=https://seu-dominio.com/api
```

### 3. Gerar build estático
```bash
npm run build
```

Isso vai criar uma pasta `out/` com os arquivos estáticos prontos para deploy.

### 4. Fazer upload dos arquivos

#### Opção A: Via cPanel (File Manager)
1. Acesse o cPanel do Hostgator
2. Vá para File Manager
3. Acesse a pasta `public_html`
4. Faça upload de todos os arquivos da pasta `out/`

#### Opção B: Via FTP
1. Use um cliente FTP (Filezilla, WinSCP, etc.)
2. Conecte com as credenciais do Hostgator
3. Navegue até `public_html`
4. Faça upload de todos os arquivos da pasta `out/`

### 5. Verificar .htaccess para Next.js (IMPORTANTE)

Crie um arquivo `.htaccess` na raiz do `public_html` com o seguinte conteúdo:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Não reescrever se o arquivo existe
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Rotear todas as requisições para index.html
  RewriteRule ^(.*)$ index.html [QSA,L]
</IfModule>
```

## Estrutura de arquivos do build

Após rodar `npm run build`, você terá:
- Arquivo HTML estático para cada página
- Pasta `_next/` com assets compilados
- Pasta `public/` com imagens e recursos estáticos

## Notas Importantes

1. **Aplicação é estática**: O site é gerado como HTML/CSS/JS estático. APIs precisam estar funcionando corretamente na sua URL de backend.

2. **Rewrite de URLs**: O `.htaccess` redireciona URLs para `index.html` permitindo navegação SPA.

3. **Variáveis de ambiente**: A URL da API é definida no build, não pode ser alterada sem novo build.

4. **Cache**: Limpe o cache do navegador se encontrar problemas após atualizar.

## Troubleshooting

### Erro 404 em rotas
- Certifique-se de que o `.htaccess` está configurado corretamente
- Verifique se `mod_rewrite` está ativado no Hostgator

### Imagens não carregam
- Verifique se a pasta `public/` foi uploadada corretamente
- Confirme as permissões das pastas (755)

### API retorna erro
- Verifique se a URL em `.env.production` está correta
- Confirme se a API está acessível (teste no navegador)
- Verifique CORS na API (deve aceitar requisições do seu domínio)

## Atualizar o site

Quando precisar fazer atualizações:
1. Edite os arquivos localmente
2. Rode `npm run build` novamente
3. Faça upload dos novos arquivos da pasta `out/` para o Hostgator
4. Limpe o cache do navegador
