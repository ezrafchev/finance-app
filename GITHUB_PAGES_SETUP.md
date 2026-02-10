# 🚀 Como Configurar o GitHub Pages (Instruções em Português)

## ❌ Problema Atual

As GitHub Actions estão falhando com o erro:
```
Error: Failed to create deployment (status: 404)
Ensure GitHub Pages has been enabled
```

## 🔍 Causa Raiz

O GitHub Pages **NÃO ESTÁ HABILITADO** nas configurações do repositório. O workflow de deploy não pode criar uma implantação porque o GitHub Pages precisa ser configurado primeiro.

## ✅ Solução: Habilitar o GitHub Pages

### Passo a Passo (OBRIGATÓRIO)

1. **Acesse as configurações do repositório:**
   - Vá para: https://github.com/ezrafchev/finance-app/settings/pages
   
2. **Configure a origem de implantação:**
   - Em "Build and deployment"
   - Em "Source", selecione: **GitHub Actions**
   - ⚠️ **NÃO selecione** "Deploy from a branch"
   - O GitHub Actions deve ser a fonte de implantação

3. **Salve as alterações:**
   - A configuração será salva automaticamente
   - Aguarde alguns segundos para as configurações serem aplicadas

4. **Execute o workflow novamente:**
   - Vá para: https://github.com/ezrafchev/finance-app/actions
   - Selecione "Deploy to GitHub Pages"
   - Clique em "Run workflow"
   - Selecione o branch `main`
   - Clique em "Run workflow" para executar

### Capturas de Tela das Configurações

**Onde encontrar:**
```
GitHub Repository → Settings → Pages → Source: GitHub Actions
```

**Como deve estar configurado:**
```
┌─────────────────────────────────────────┐
│ Build and deployment                     │
├─────────────────────────────────────────┤
│ Source: GitHub Actions                   │
│ ✓ Use a workflow from your repository   │
└─────────────────────────────────────────┘
```

## 📋 Checklist de Verificação

Antes de tentar o deploy novamente, verifique:

- [ ] GitHub Pages está **habilitado** nas configurações
- [ ] Source está configurado como **"GitHub Actions"**
- [ ] O workflow `.github/workflows/deploy.yml` existe no branch `main`
- [ ] Você tem permissões de **admin** no repositório
- [ ] As permissões do GitHub Actions estão corretas (leitura e escrita)

## 🔧 Verificar Permissões do GitHub Actions

1. Vá para: https://github.com/ezrafchev/finance-app/settings/actions
2. Em "Workflow permissions", selecione:
   - ✅ **"Read and write permissions"**
3. Marque:
   - ✅ **"Allow GitHub Actions to create and approve pull requests"**
4. Clique em **"Save"**

## 🎯 Após a Configuração

Uma vez que o GitHub Pages esteja configurado:

1. **Deploy Automático:**
   - Todo push para o branch `main` irá disparar o deploy automaticamente
   
2. **Deploy Manual:**
   - Você pode disparar manualmente via Actions → Deploy to GitHub Pages → Run workflow

3. **Acesse o Site:**
   - Seu site estará disponível em: https://ezrafchev.github.io/finance-app/
   - Pode levar 1-2 minutos após o workflow completar

## 🐛 Solução de Problemas

### Erro 404 Ainda Persiste

Se após habilitar o GitHub Pages você ainda recebe erro 404:

1. **Verifique se as configurações foram salvas:**
   - Vá novamente em Settings → Pages
   - Confirme que "GitHub Actions" está selecionado

2. **Aguarde alguns minutos:**
   - Às vezes leva alguns minutos para as configurações propagarem

3. **Execute o workflow manualmente:**
   - Actions → Deploy to GitHub Pages → Run workflow

### Workflow Falha com Erro de Permissão

Se receber erro de permissão:

1. Verifique as permissões do workflow em Settings → Actions
2. Certifique-se de que "Read and write permissions" está habilitado
3. Salve e execute o workflow novamente

### Site Mostra Página em Branco

Se o deploy funciona mas o site está em branco:

1. Verifique o console do navegador para erros
2. Confirme que `next.config.ts` tem `output: 'export'`
3. Verifique se o arquivo `.nojekyll` existe em `public/`

## 📚 Recursos Adicionais

- [Documentação Oficial do GitHub Pages](https://docs.github.com/pt/pages)
- [GitHub Actions para Pages](https://github.com/actions/deploy-pages)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

## 💡 Nota Importante

Este é um **problema de configuração do GitHub**, não um problema de código. O código da aplicação está correto e funcional. Apenas as configurações do repositório precisam ser ajustadas para permitir que o GitHub Actions faça o deploy.

---

**Status Atual:**
- ✅ Código da aplicação está correto
- ✅ Workflow de deploy está configurado corretamente
- ✅ Build local funciona perfeitamente
- ❌ GitHub Pages não está habilitado (precisa ser configurado manualmente)

**Próximo Passo:** Siga as instruções acima para habilitar o GitHub Pages!
