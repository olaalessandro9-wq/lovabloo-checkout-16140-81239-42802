-- Adicionar campos de customização de cores na tabela checkout_customizations

-- Cores de texto
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS primary_text_color TEXT DEFAULT '#FFFFFF';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS secondary_text_color TEXT DEFAULT '#CCCCCC';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS active_text_color TEXT DEFAULT '#10B981';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS icon_color TEXT DEFAULT '#FFFFFF';

-- Cores de fundo
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#000000';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS form_background_color TEXT DEFAULT '#1A1A1A';

-- Botões não selecionados
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS unselected_button_text_color TEXT DEFAULT '#000000';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS unselected_button_bg_color TEXT DEFAULT '#FFFFFF';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS unselected_button_icon_color TEXT DEFAULT '#000000';

-- Botão selecionado
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS selected_button_text_color TEXT DEFAULT '#FFFFFF';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS selected_button_bg_color TEXT DEFAULT '#10B981';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS selected_button_icon_color TEXT DEFAULT '#FFFFFF';

-- Botão de pagamento
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS payment_button_text_color TEXT DEFAULT '#FFFFFF';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS payment_button_bg_color TEXT DEFAULT '#10B981';

-- Caixas padrões
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS box_header_bg_color TEXT DEFAULT '#1A1A1A';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS box_header_primary_text_color TEXT DEFAULT '#FFFFFF';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS box_header_secondary_text_color TEXT DEFAULT '#CCCCCC';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS box_bg_color TEXT DEFAULT '#0A0A0A';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS box_primary_text_color TEXT DEFAULT '#FFFFFF';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS box_secondary_text_color TEXT DEFAULT '#CCCCCC';

-- Caixas não selecionadas
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS unselected_box_header_bg_color TEXT DEFAULT '#1A1A1A';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS unselected_box_header_primary_text_color TEXT DEFAULT '#FFFFFF';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS unselected_box_header_secondary_text_color TEXT DEFAULT '#CCCCCC';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS unselected_box_bg_color TEXT DEFAULT '#0A0A0A';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS unselected_box_primary_text_color TEXT DEFAULT '#FFFFFF';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS unselected_box_secondary_text_color TEXT DEFAULT '#CCCCCC';

-- Caixas selecionadas
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS selected_box_header_bg_color TEXT DEFAULT '#10B981';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS selected_box_header_primary_text_color TEXT DEFAULT '#FFFFFF';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS selected_box_header_secondary_text_color TEXT DEFAULT '#CCCCCC';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS selected_box_bg_color TEXT DEFAULT '#0A0A0A';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS selected_box_primary_text_color TEXT DEFAULT '#FFFFFF';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS selected_box_secondary_text_color TEXT DEFAULT '#CCCCCC';

-- Tema e fonte
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'customizado';
ALTER TABLE checkout_customizations ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Roboto';

COMMENT ON COLUMN checkout_customizations.primary_text_color IS 'Cor primária do texto (títulos, labels)';
COMMENT ON COLUMN checkout_customizations.secondary_text_color IS 'Cor secundária do texto (descrições)';
COMMENT ON COLUMN checkout_customizations.active_text_color IS 'Cor ativa do texto (preços, CTAs) - padrão verde';
COMMENT ON COLUMN checkout_customizations.selected_button_bg_color IS 'Cor de fundo do botão selecionado - padrão verde';
COMMENT ON COLUMN checkout_customizations.payment_button_bg_color IS 'Cor do botão de pagamento - padrão verde';
COMMENT ON COLUMN checkout_customizations.selected_box_header_bg_color IS 'Cor do header da caixa selecionada - padrão verde';
