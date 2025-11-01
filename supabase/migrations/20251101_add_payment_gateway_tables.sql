-- Tabela de credenciais por usuário (seller) para PushinPay
create table if not exists payment_gateway_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pushinpay_token text not null,
  environment text not null check (environment in ('sandbox','production')),
  platform_fee_percent numeric(5,2) default 0.00,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Opcional: tabela global de app settings (caso não exista)
create table if not exists app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Guarda o mapeamento entre order e pix (para consulta/status)
create table if not exists payments_map (
  order_id uuid primary key,
  pix_id text not null,
  created_at timestamptz default now()
);

-- Índices auxiliares
create index if not exists idx_payment_gateway_env on payment_gateway_settings(environment);
create index if not exists idx_payments_map_pix_id on payments_map(pix_id);
