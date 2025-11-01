#!/bin/bash

# Script de deploy automatizado das Edge Functions
# Uso: ./scripts/deploy-functions.sh

set -e

echo "🚀 Iniciando deploy das Edge Functions..."
echo ""

# Verificar se está logado no Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Você não está logado no Supabase CLI"
    echo "Execute: supabase login"
    exit 1
fi

echo "✅ Autenticado no Supabase"
echo ""

# Lista de functions para deploy
FUNCTIONS=(
    "encrypt-token"
    "pushinpay-create-pix"
    "pushinpay-get-status"
    "pushinpay-webhook"
)

# Deploy de cada function
for func in "${FUNCTIONS[@]}"; do
    echo "📦 Fazendo deploy de: $func"
    
    # Functions chamadas pelo frontend precisam de --no-verify-jwt
    if [[ "$func" == "encrypt-token" || "$func" == "pushinpay-create-pix" || "$func" == "pushinpay-get-status" ]]; then
        echo "⚠️  Usando --no-verify-jwt (chamada do frontend)"
        if supabase functions deploy "$func" --no-verify-jwt; then
            echo "✅ $func implantada com sucesso"
        else
            echo "❌ Erro ao implantar $func"
            exit 1
        fi
    else
        # Webhook é server-to-server, mantém verificação JWT padrão
        if supabase functions deploy "$func"; then
            echo "✅ $func implantada com sucesso"
        else
            echo "❌ Erro ao implantar $func"
            exit 1
        fi
    fi
    echo ""
done

echo "🎉 Todas as Edge Functions foram implantadas com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente no painel do Supabase"
echo "2. Configure o webhook no painel da PushinPay"
echo "3. Teste a integração em ambiente Sandbox"
echo ""
echo "Para visualizar logs:"
echo "  supabase functions logs <function-name> --tail"
