#!/bin/bash

# Script de Configuração de Secrets do Supabase
# Integração PushinPay - RiseCheckout
# Data: 01/11/2025

set -e

PROJECT_REF="wivbtmtgpsxupfjwwovf"

echo "=================================================="
echo "  Configuração de Secrets - Integração PushinPay"
echo "=================================================="
echo ""

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Erro: Supabase CLI não está instalado"
    echo "Instale com: npm install -g supabase"
    exit 1
fi

# Verificar se está logado
if ! supabase projects list &> /dev/null; then
    echo "❌ Erro: Você não está logado no Supabase CLI"
    echo "Faça login com: supabase login"
    exit 1
fi

echo "✅ Supabase CLI detectado e autenticado"
echo ""

# 1. ENCRYPTION_KEY
echo "=================================================="
echo "1. Configurando ENCRYPTION_KEY"
echo "=================================================="
echo ""

if [ -z "$ENCRYPTION_KEY" ]; then
    echo "⚠️  ENCRYPTION_KEY não encontrada no ambiente"
    echo "Gerando nova chave de criptografia (32 bytes em base64)..."
    echo ""
    
    ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    
    echo "Chave gerada:"
    echo "$ENCRYPTION_KEY"
    echo ""
    echo "⚠️  IMPORTANTE: Salve esta chave em um local seguro!"
    echo ""
else
    echo "✅ ENCRYPTION_KEY encontrada no ambiente"
fi

echo "Configurando ENCRYPTION_KEY no Supabase..."
supabase secrets set ENCRYPTION_KEY="$ENCRYPTION_KEY" --project-ref "$PROJECT_REF"
echo "✅ ENCRYPTION_KEY configurada"
echo ""

# 2. PLATFORM_PUSHINPAY_ACCOUNT_ID
echo "=================================================="
echo "2. Configurando PLATFORM_PUSHINPAY_ACCOUNT_ID"
echo "=================================================="
echo ""

if [ -z "$PLATFORM_PUSHINPAY_ACCOUNT_ID" ]; then
    echo "⚠️  PLATFORM_PUSHINPAY_ACCOUNT_ID não encontrada no ambiente"
    echo ""
    echo "Por favor, defina a variável de ambiente antes de executar:"
    echo "export PLATFORM_PUSHINPAY_ACCOUNT_ID=\"seu_account_id\""
    echo ""
    echo "Você pode obter o Account ID no painel da PushinPay:"
    echo "https://app.pushinpay.com.br/settings/account"
    echo ""
    exit 1
fi

echo "Account ID: $PLATFORM_PUSHINPAY_ACCOUNT_ID"
echo "Configurando no Supabase..."
supabase secrets set PLATFORM_PUSHINPAY_ACCOUNT_ID="$PLATFORM_PUSHINPAY_ACCOUNT_ID" --project-ref "$PROJECT_REF"
echo "✅ PLATFORM_PUSHINPAY_ACCOUNT_ID configurada"
echo ""

# 3. PLATFORM_FEE_PERCENT
echo "=================================================="
echo "3. Configurando PLATFORM_FEE_PERCENT"
echo "=================================================="
echo ""

PLATFORM_FEE_PERCENT="${PLATFORM_FEE_PERCENT:-7.5}"
echo "Taxa da plataforma: $PLATFORM_FEE_PERCENT%"
echo "Configurando no Supabase..."
supabase secrets set PLATFORM_FEE_PERCENT="$PLATFORM_FEE_PERCENT" --project-ref "$PROJECT_REF"
echo "✅ PLATFORM_FEE_PERCENT configurada"
echo ""

# 4. PUSHINPAY_BASE_URL_PROD
echo "=================================================="
echo "4. Configurando PUSHINPAY_BASE_URL_PROD"
echo "=================================================="
echo ""

PUSHINPAY_BASE_URL_PROD="https://api.pushinpay.com.br/api"
echo "URL de produção: $PUSHINPAY_BASE_URL_PROD"
echo "Configurando no Supabase..."
supabase secrets set PUSHINPAY_BASE_URL_PROD="$PUSHINPAY_BASE_URL_PROD" --project-ref "$PROJECT_REF"
echo "✅ PUSHINPAY_BASE_URL_PROD configurada"
echo ""

# 5. PUSHINPAY_BASE_URL_SANDBOX
echo "=================================================="
echo "5. Configurando PUSHINPAY_BASE_URL_SANDBOX"
echo "=================================================="
echo ""

PUSHINPAY_BASE_URL_SANDBOX="https://api-sandbox.pushinpay.com.br/api"
echo "URL de sandbox: $PUSHINPAY_BASE_URL_SANDBOX"
echo "Configurando no Supabase..."
supabase secrets set PUSHINPAY_BASE_URL_SANDBOX="$PUSHINPAY_BASE_URL_SANDBOX" --project-ref "$PROJECT_REF"
echo "✅ PUSHINPAY_BASE_URL_SANDBOX configurada"
echo ""

# Resumo
echo "=================================================="
echo "  ✅ Configuração Concluída com Sucesso!"
echo "=================================================="
echo ""
echo "Secrets configuradas:"
echo "  ✅ ENCRYPTION_KEY (32 bytes base64)"
echo "  ✅ PLATFORM_PUSHINPAY_ACCOUNT_ID"
echo "  ✅ PLATFORM_FEE_PERCENT ($PLATFORM_FEE_PERCENT%)"
echo "  ✅ PUSHINPAY_BASE_URL_PROD"
echo "  ✅ PUSHINPAY_BASE_URL_SANDBOX"
echo ""
echo "Próximo passo: Deploy das Edge Functions"
echo "Execute: ./scripts/deploy-functions.sh"
echo ""
