# 🔐 Configuração de Secrets - Edge Functions PushinPay

## ✅ Status do Deploy

**TODAS AS 4 EDGE FUNCTIONS FORAM DEPLOYADAS COM SUCESSO!**

- ✅ **encrypt-token** (v25) - ATIVA
- ✅ **pushinpay-create-pix** (v26) - ATIVA
- ✅ **pushinpay-get-status** (v26) - ATIVA
- ✅ **pushinpay-webhook** (v26) - ATIVA

---

## 🚨 AÇÃO NECESSÁRIA: Configurar Secrets

As Edge Functions foram deployadas, mas **NÃO FUNCIONARÃO** até que você configure os **6 secrets obrigatórios** no Supabase Dashboard.

### 📍 Link Direto para Configuração

**Acesse agora:** https://supabase.com/dashboard/project/wivbtmtgpsxupfjwwovf/settings/secrets

---

## 📋 Secrets a Configurar

### 1. ENCRYPTION_KEY
**Descrição:** Chave AES-256-GCM para criptografar tokens PushinPay no banco de dados  
**Valor:** `gnrwnLmN0+FF4iuvSc8L6Ku3XRdWJxN8HsMCC4RIoC0=`  
**Observação:** Esta chave foi gerada automaticamente (32 bytes em base64)

### 2. PLATFORM_PUSHINPAY_ACCOUNT_ID
**Descrição:** ID da conta PushinPay da plataforma (recebe os 7,5% de taxa)  
**Valor:** `9F73D854-4DA8-45E1-AFB6-9A8F803EFB7A`  
**Observação:** Conta da plataforma RiseCheckout

### 3. PLATFORM_FEE_PERCENT
**Descrição:** Percentual de taxa da plataforma (fixo, não editável pelos vendedores)  
**Valor:** `7.5`  
**Observação:** Taxa fixa de 7,5% sobre todas as transações

### 4. PUSHINPAY_BASE_URL_PROD
**Descrição:** URL base da API PushinPay em produção  
**Valor:** `https://api.pushinpay.com.br/api`  
**Observação:** Ambiente de produção (transações reais)

### 5. PUSHINPAY_BASE_URL_SANDBOX
**Descrição:** URL base da API PushinPay em sandbox  
**Valor:** `https://api-sandbox.pushinpay.com.br/api`  
**Observação:** Ambiente de testes (sem transações reais)

### 6. PUSHINPAY_WEBHOOK_TOKEN
**Descrição:** Token de segurança para validar webhooks da PushinPay  
**Valor:** `rise_secure_token_123`  
**Observação:** Token customizado para validação de webhooks

---

## 🔧 Como Configurar (Passo a Passo)

### Opção 1: Via Supabase Dashboard (Recomendado)

1. **Acesse o Dashboard de Secrets:**
   - URL: https://supabase.com/dashboard/project/wivbtmtgpsxupfjwwovf/settings/secrets
   - Ou navegue: Dashboard → Settings → Edge Functions → Secrets

2. **Adicione cada secret:**
   - Clique em "Add Secret" ou "New Secret"
   - **Name:** Digite o nome exato do secret (ex: `ENCRYPTION_KEY`)
   - **Value:** Cole o valor correspondente da lista acima
   - Clique em "Save" ou "Add Secret"

3. **Repita para os 6 secrets:**
   - ENCRYPTION_KEY
   - PLATFORM_PUSHINPAY_ACCOUNT_ID
   - PLATFORM_FEE_PERCENT
   - PUSHINPAY_BASE_URL_PROD
   - PUSHINPAY_BASE_URL_SANDBOX
   - PUSHINPAY_WEBHOOK_TOKEN

4. **Verifique:**
   - Todos os 6 secrets devem aparecer na lista
   - Os valores ficam ocultos (●●●●●●) por segurança

### Opção 2: Via Supabase CLI (Alternativa)

Se você tem o Supabase CLI instalado e configurado:

```bash
# 1. Login no Supabase CLI
supabase login

# 2. Link ao projeto
supabase link --project-ref wivbtmtgpsxupfjwwovf

# 3. Configure os secrets
supabase secrets set ENCRYPTION_KEY=gnrwnLmN0+FF4iuvSc8L6Ku3XRdWJxN8HsMCC4RIoC0=
supabase secrets set PLATFORM_PUSHINPAY_ACCOUNT_ID=9F73D854-4DA8-45E1-AFB6-9A8F803EFB7A
supabase secrets set PLATFORM_FEE_PERCENT=7.5
supabase secrets set PUSHINPAY_BASE_URL_PROD=https://api.pushinpay.com.br/api
supabase secrets set PUSHINPAY_BASE_URL_SANDBOX=https://api-sandbox.pushinpay.com.br/api
supabase secrets set PUSHINPAY_WEBHOOK_TOKEN=rise_secure_token_123

# 4. Verifique os secrets
supabase secrets list
```

---

## ✅ Verificação Pós-Configuração

Após configurar todos os secrets, teste a função `encrypt-token`:

### Teste via cURL

```bash
curl -X POST https://wivbtmtgpsxupfjwwovf.supabase.co/functions/v1/encrypt-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpdmJ0bXRncHN4dXBmand3b3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjYzMjgsImV4cCI6MjA3NjY0MjMyOH0.fiSC6Ic4JLO2haISk-qKBe_nyQ2CWOkEJstE2SehEY8" \
  -d '{"token":"test_token_123"}'
```

**Resposta esperada:**
```json
{
  "encrypted": "base64_encrypted_string_here..."
}
```

**Se retornar erro:**
- `"Encryption key not configured"` → Secret `ENCRYPTION_KEY` não foi configurado
- `500 Internal Server Error` → Verifique se todos os secrets foram salvos corretamente

---

## 🔗 URLs das Edge Functions

Após configurar os secrets, as funções estarão disponíveis em:

- **encrypt-token:** https://wivbtmtgpsxupfjwwovf.supabase.co/functions/v1/encrypt-token
- **pushinpay-create-pix:** https://wivbtmtgpsxupfjwwovf.supabase.co/functions/v1/pushinpay-create-pix
- **pushinpay-get-status:** https://wivbtmtgpsxupfjwwovf.supabase.co/functions/v1/pushinpay-get-status
- **pushinpay-webhook:** https://wivbtmtgpsxupfjwwovf.supabase.co/functions/v1/pushinpay-webhook

---

## 📝 Próximos Passos

Após configurar os secrets e testar:

1. **Configure o Webhook na PushinPay:**
   - Acesse o dashboard da PushinPay
   - Configure a URL de webhook: `https://wivbtmtgpsxupfjwwovf.supabase.co/functions/v1/pushinpay-webhook`
   - Token de segurança: `rise_secure_token_123`

2. **Configure suas Credenciais PushinPay no Frontend:**
   - Acesse a página "Financeiro" no RiseCheckout
   - Insira seu **Token PushinPay**
   - Selecione o **Ambiente** (Sandbox ou Produção)
   - Clique em "Salvar Configurações"

3. **Teste uma Transação:**
   - Crie um pedido de teste
   - Gere um PIX
   - Verifique se o QR Code é exibido corretamente
   - Simule o pagamento (Sandbox) ou pague (Produção)
   - Verifique se o status do pedido é atualizado automaticamente

---

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique os logs das Edge Functions:**
   - Dashboard → Edge Functions → Logs
   - URL: https://supabase.com/dashboard/project/wivbtmtgpsxupfjwwovf/functions

2. **Verifique se todos os 6 secrets estão configurados:**
   - Dashboard → Settings → Edge Functions → Secrets
   - URL: https://supabase.com/dashboard/project/wivbtmtgpsxupfjwwovf/settings/secrets

3. **Teste cada função individualmente:**
   - Use o script `test_encrypt.sh` para testar a função encrypt-token
   - Use Postman ou cURL para testar as outras funções

---

## 📚 Documentação Adicional

- **PLANO_FINAL_DEPLOY.md:** Plano completo de deploy seguindo especificações do ChatGPT
- **INSTRUCOES_FINAIS.md:** Instruções finais em português para deploy completo
- **KEYS_SUPABASE.md:** Chaves do projeto (ANON e SERVICE_ROLE) - NÃO commitado
- **deploy_rise_pushinpay.sh:** Script de deploy automatizado via Supabase CLI
- **test_encrypt.sh:** Script de teste automatizado para função encrypt-token

---

**✅ Deploy das Edge Functions: COMPLETO**  
**⏳ Configuração de Secrets: AGUARDANDO SUA AÇÃO**  
**🎯 Próximo Passo: Configurar os 6 secrets no Dashboard**
