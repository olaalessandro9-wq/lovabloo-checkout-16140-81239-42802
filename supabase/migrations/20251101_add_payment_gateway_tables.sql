-- Habilitar extensão pgcrypto para criptografia
create extension if not exists pgcrypto;

-- Tabela de configurações de gateway de pagamento por vendedor
create table if not exists public.payment_gateway_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  token_encrypted text not null,
  environment text not null check (environment in ('sandbox','production')),
  platform_fee_percent numeric(5,2) not null default 0.00 check (platform_fee_percent >= 0 and platform_fee_percent <= 50),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela de mapeamento entre pedidos internos e transações PIX
create table if not exists public.payments_map (
  order_id uuid not null,
  pix_id text not null,
  created_at timestamp with time zone default now(),
  primary key (order_id, pix_id)
);

-- Índices para performance
create index if not exists idx_payment_gateway_env on public.payment_gateway_settings(environment);
create index if not exists idx_payments_map_pix_id on public.payments_map(pix_id);
create index if not exists idx_payments_map_order_id on public.payments_map(order_id);

-- RLS (Row-Level Security) para payment_gateway_settings
alter table public.payment_gateway_settings enable row level security;

-- Política: usuário pode gerenciar apenas suas próprias configurações
create policy "owner can manage own gateway settings"
  on public.payment_gateway_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS para payments_map
alter table public.payments_map enable row level security;

-- Política: clientes não têm acesso direto
create policy "no direct client access"
  on public.payments_map
  for select 
  using (false);

-- Política: Edge Functions (service_role) podem gerenciar
create policy "edge can manage map"
  on public.payments_map
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Função para atualizar updated_at automaticamente
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger para atualizar updated_at em payment_gateway_settings
create trigger update_payment_gateway_settings_updated_at
  before update on public.payment_gateway_settings
  for each row
  execute function public.update_updated_at_column();

-- Comentários para documentação
comment on table public.payment_gateway_settings is 'Armazena configurações de gateway de pagamento por vendedor com token criptografado';
comment on table public.payments_map is 'Mapeia pedidos internos para transações PIX da PushinPay';
comment on column public.payment_gateway_settings.token_encrypted is 'Token da PushinPay criptografado com pgcrypto';
comment on column public.payment_gateway_settings.environment is 'Ambiente: sandbox ou production';
comment on column public.payment_gateway_settings.platform_fee_percent is 'Percentual de taxa da plataforma (0-50%)';
