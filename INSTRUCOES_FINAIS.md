# INSTRUÇÕES FINAIS PARA MANUS - INTEGRAÇÃO PUSHINPAY

## OBJETIVO

Concluir as configurações pós-deploy no Supabase e no Painel da PushinPay para permitir que o checkout gere e valide PIX corretamente (ambientes Sandbox e Produção).

---

## ETAPA 1 - CONFIGURAR O WEBHOOK NA PUSHINPAY

### 1. Acesse o painel da PushinPay:
https://app.pushinpay.com.br/settings/webhooks

### 2. Adicione o seguinte webhook (para produção e sandbox):

| Campo | Valor |
|-------|-------|
| **URL** | `https://wivbtmtgpsxupfjwwovf.supabase.co/functions/v1/pushinpay-webhook` |
| **Token (x-pushinpay-token)** | `rise_secure_token_123` |
| **Eventos** | `pix.created`, `pix.paid`, `pix.expired`, `pix.canceled` |

### 3. Salve as configurações.

---

## ETAPA 2 - CONFIRMAR SECRETS NO SUPABASE

Confirme no painel do Supabase > Project Settings > Secrets se constam as seguintes chaves:

- ✅ `ENCRYPTION_KEY` (gerado automaticamente)
- ✅ `PLATFORM_PUSHINPAY_ACCOUNT_ID` = `9F73D854-4DA8-45E1-AFB6-9A8F803EFB7A`
- ✅ `PLATFORM_FEE_PERCENT` = `7.5`
- ✅ `PUSHINPAY_BASE_URL_PROD` = `https://api.pushinpay.com.br/api`
- ✅ `PUSHINPAY_BASE_URL_SANDBOX` = `https://api-sandbox.pushinpay.com.br/api`
- ✅ `PUSHINPAY_WEBHOOK_TOKEN` = `rise_secure_token_123`

**Link direto:** https://supabase.com/dashboard/project/wivbtmtgpsxupfjwwovf/settings/secrets

---

## ETAPA 3 - DEPLOY DAS EDGE FUNCTIONS

Executar caso o script não tenha completado alguma função:

```bash
supabase functions deploy encrypt-token --no-verify-jwt --project-ref wivbtmtgpsxupfjwwovf

supabase functions deploy pushinpay-create-pix --no-verify-jwt --project-ref wivbtmtgpsxupfjwwovf

supabase functions deploy pushinpay-get-status --no-verify-jwt --project-ref wivbtmtgpsxupfjwwovf

supabase functions deploy pushinpay-webhook --project-ref wivbtmtgpsxupfjwwovf
```

---

## ETAPA 4 - TESTES DE VALIDAÇÃO

### **Teste 1: Criptografia**

```bash
curl -X POST "https://wivbtmtgpsxupfjwwovf.supabase.co/functions/v1/encrypt-token" \
  -H "apikey: <SUA_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"token": "sandbox_xxxxx"}'
```

**Esperado:** `{"encrypted":"..."} (200 OK)`

> **Como obter a ANON KEY:**  
> Acesse: https://supabase.com/dashboard/project/wivbtmtgpsxupfjwwovf/settings/api  
> Copie a **anon/public key**

---

### **Teste 2: Salvar Integração**

1. Acesse: https://risecheckout.lovable.app/financeiro
2. Cole o **token da PushinPay** (Sandbox ou Produção)
3. Selecione o ambiente correto
4. Clique em **Salvar integração**

**Esperado:** Toast de sucesso, sem erro 500

---

### **Teste 3: Criar PIX**

1. Criar pedido de valor igual ou superior a R$ 0,50
2. Gerar QR Code
3. Verificar status "created"

**Esperado:** QR Code gerado com sucesso

---

### **Teste 4: Simular Pagamento**

No painel da PushinPay, simular pagamento.

**Esperado:** Status "paid" via webhook.

---

### **Teste 5: Validar Split**

No banco de dados (tabela `payments_map`), verificar campo `split_rules`.

**Esperado:** 7.5% aplicado na conta `9F73D854-4DA8-45E1-AFB6-9A8F803EFB7A`.

---

## ETAPA 5 - CHECKLIST FINAL

- [ ] Secrets configuradas: OK
- [ ] Funções deployadas: OK
- [ ] Webhook configurado: OK
- [ ] encrypt-token retorna 200 OK: OK
- [ ] PIX gerado e pago: OK
- [ ] Split aplicado: OK

---

## RESULTADO ESPERADO

✅ Nenhum erro 500  
✅ PIX funcional  
✅ Split automático  
✅ Webhook ativo

---

## LINKS ÚTEIS

- **Supabase Dashboard:** https://supabase.com/dashboard/project/wivbtmtgpsxupfjwwovf
- **PushinPay:** https://app.pushinpay.com.br
- **Documentação API:** https://app.theneo.io/pushinpay/pix/criar-pix

---

**Criado por:** Manus AI  
**Baseado em:** Instruções Finais Manus PushinPay (ChatGPT)  
**Data:** 01/11/2025
