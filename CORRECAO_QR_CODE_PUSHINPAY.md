# Correção: QR Code PIX PushinPay não exibe imagem

## Problema Identificado

O QR Code do PIX não estava sendo exibido como imagem na tela de checkout, apenas o código em texto era mostrado. O console do navegador apresentava erro 406 ao tentar carregar a imagem.

## Causa Raiz

A API da PushinPay retorna o campo `qr_code_base64` **já formatado** com o prefixo completo de Data URL:

```json
{
  "qr_code_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

No entanto, o componente `PixPayment.tsx` estava **adicionando o prefixo novamente** ao montar a tag `<img>`:

```tsx
// ❌ ANTES (INCORRETO)
<img
  src={`data:image/png;base64,${qrCodeBase64}`}
  alt="QR Code PIX"
/>
```

Isso resultava em uma URL duplicada e inválida:
```
data:image/png;base64,data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

## Solução Implementada

Removido o prefixo duplicado, usando o valor de `qr_code_base64` diretamente:

```tsx
// ✅ DEPOIS (CORRETO)
<img
  src={qrCodeBase64}
  alt="QR Code PIX"
/>
```

## Arquivo Modificado

- **`src/components/checkout/PixPayment.tsx`** (linha 138)

## Validação

Conforme documentação oficial da PushinPay:
- Endpoint: `POST /pix/cashIn`
- Documentação: https://app.theneo.io/pushinpay/pix/criar-pix
- O campo `qr_code_base64` é retornado no formato `data:image/png;base64,...`

## Próximos Passos

1. ✅ Correção aplicada no código
2. ⏳ Commit e push para o repositório
3. ⏳ Deploy da correção
4. ⏳ Teste em ambiente de produção/sandbox

## Data da Correção

03/11/2025
