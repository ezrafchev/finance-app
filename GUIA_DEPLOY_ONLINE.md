# Guia de Implantação - Finance App com Banco Online

Este guia explica como implantar o Finance App com banco de dados online (PostgreSQL) e verificação de e-mail funcional.

## 📋 Pré-requisitos

Antes de começar, você precisa:
- ✅ Conta no [Vercel](https://vercel.com) ou outro provedor de hospedagem
- ✅ Conta no [Supabase](https://supabase.com) ou [Neon](https://neon.tech) para PostgreSQL gratuito
- ✅ Conta no [Resend](https://resend.com) para envio de e-mails (gratuito até 3.000 e-mails/mês)

## 🚀 Implantação Rápida no Vercel + Supabase

### Passo 1: Criar Banco de Dados PostgreSQL

#### Opção A: Supabase (Recomendado)
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Escolha um nome para o projeto
5. Defina uma senha forte para o banco
6. Escolha a região mais próxima dos seus usuários
7. Aguarde a criação do projeto (~2 minutos)
8. Vá em "Settings" → "Database"
9. Copie a "Connection string" em modo "URI" (com `postgresql://`)

#### Opção B: Neon
1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta ou faça login
3. Clique em "Create Project"
4. Escolha um nome e região
5. Copie a connection string fornecida

### Passo 2: Configurar Serviço de E-mail (Resend)

1. Acesse [resend.com](https://resend.com)
2. Crie uma conta ou faça login
3. Vá em "API Keys"
4. Clique em "Create API Key"
5. Dê um nome (ex: "Finance App Production")
6. Copie a chave gerada (começa com `re_`)

**Importante:** Para produção, você precisará verificar um domínio próprio no Resend para enviar e-mails do seu domínio.

### Passo 3: Fazer Deploy no Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe seu repositório do GitHub
3. Configure as variáveis de ambiente:

```env
# Database
DATABASE_URL=sua_connection_string_do_supabase_ou_neon

# Authentication
JWT_SECRET=crie_uma_chave_secreta_aleatoria_forte_aqui

# Email
RESEND_API_KEY=sua_chave_api_do_resend
FROM_EMAIL=Finance App <noreply@seudominio.com>

# Application
APP_URL=https://seu-app.vercel.app
NODE_ENV=production
```

4. Clique em "Deploy"
5. Aguarde o deploy finalizar

### Passo 4: Executar Migrações do Banco

Após o primeiro deploy, você precisa criar as tabelas no banco:

1. Instale a CLI do Vercel: `npm i -g vercel`
2. Faça login: `vercel login`
3. Entre na pasta do projeto e execute:
```bash
npx prisma migrate deploy
```

Ou execute diretamente no Vercel:
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

### Passo 5: Testar a Aplicação

1. Acesse sua URL do Vercel
2. Crie uma nova conta
3. Verifique seu e-mail
4. Faça login
5. Teste criar transações

## 🔒 Segurança

### Gerar JWT_SECRET Seguro

Use um desses métodos para gerar uma chave secreta forte:

```bash
# Opção 1: OpenSSL
openssl rand -base64 32

# Opção 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Opção 3: Online (somente para desenvolvimento)
# https://generate-secret.vercel.app/32
```

### Configurar Domínio de E-mail no Resend

Para produção, configure seu próprio domínio:

1. No Resend, vá em "Domains"
2. Clique em "Add Domain"
3. Adicione seu domínio (ex: `seudominio.com`)
4. Configure os registros DNS conforme instruído
5. Aguarde a verificação
6. Atualize a variável `FROM_EMAIL` para usar seu domínio:
   ```
   FROM_EMAIL=Finance App <noreply@seudominio.com>
   ```

## 🔄 Alternativas de Hospedagem

### Railway

1. Acesse [railway.app](https://railway.app)
2. Crie uma conta
3. Clique em "New Project"
4. Escolha "Deploy from GitHub repo"
5. Selecione seu repositório
6. Configure as variáveis de ambiente (mesmas do Vercel)
7. Railway criará automaticamente um banco PostgreSQL para você

### Render

1. Acesse [render.com](https://render.com)
2. Crie uma conta
3. Clique em "New +"
4. Escolha "Web Service"
5. Conecte seu repositório
6. Configure:
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm run start`
7. Adicione um banco PostgreSQL em "New +" → "PostgreSQL"
8. Configure as variáveis de ambiente

## 📊 Monitoramento e Logs

### Ver Logs de E-mail no Resend

1. Acesse [resend.com](https://resend.com)
2. Vá em "Emails"
3. Veja todos os e-mails enviados, status de entrega, etc.

### Ver Logs da Aplicação no Vercel

1. Acesse seu projeto no Vercel
2. Vá na aba "Logs"
3. Filtre por erros ou busque por eventos específicos

### Monitorar Banco de Dados

**Supabase:**
- Use o Table Editor no dashboard do Supabase
- Veja logs de conexões em "Database" → "Logs"

**Neon:**
- Use o Console SQL no dashboard do Neon
- Monitore uso em "Monitoring"

## 🐛 Solução de Problemas

### Erro: "Cannot connect to database"
- Verifique se a `DATABASE_URL` está correta
- Verifique se o banco de dados está ativo
- Teste a conexão com: `npx prisma db pull`

### Erro: "Email not sent"
- Verifique se `RESEND_API_KEY` está configurada
- Verifique cotas no dashboard do Resend
- Verifique logs de erro no Vercel

### Erro: "Session expired" / "Unauthorized"
- Limpe cookies do navegador
- Verifique se `JWT_SECRET` está configurada
- Verifique se o usuário verificou o e-mail

### Migrações não aplicadas
Execute manualmente:
```bash
# Produção
npx prisma migrate deploy

# Desenvolvimento
npx prisma migrate dev
```

## 💡 Dicas de Produção

1. **Backups**: Configure backups automáticos no Supabase/Neon
2. **Domínio**: Use um domínio personalizado no Vercel
3. **HTTPS**: Sempre ativo no Vercel (gratuito)
4. **Rate Limiting**: Considere adicionar rate limiting nas rotas de API
5. **Monitoramento**: Use ferramentas como Sentry para monitorar erros

## 📝 Checklist de Deploy

Antes de marcar como concluído:

- [ ] Banco de dados PostgreSQL criado e acessível
- [ ] Variáveis de ambiente configuradas
- [ ] Migrações do banco executadas com sucesso
- [ ] Deploy realizado sem erros
- [ ] Teste de registro de conta realizado
- [ ] E-mail de verificação recebido e funcional
- [ ] Teste de login realizado
- [ ] Teste de criação de transações realizado
- [ ] Dados persistem após logout/login
- [ ] Domínio personalizado configurado (opcional)
- [ ] SSL/HTTPS funcionando
- [ ] Backups configurados

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. Compartilhe o link da aplicação
2. Monitore logs e erros
3. Colete feedback dos usuários
4. Implemente melhorias baseadas no uso

## 📞 Suporte

Se encontrar problemas:
- Verifique os logs no Vercel
- Consulte a documentação do Prisma: https://www.prisma.io/docs
- Consulte a documentação do Resend: https://resend.com/docs
- Abra uma issue no repositório do GitHub
