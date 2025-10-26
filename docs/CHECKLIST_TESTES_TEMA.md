# Checklist de Testes - Sistema de Temas Eagle Vision

**Versão:** 1.0  
**Data:** 26/10/2025  
**Commit:** `b1492aa`

---

## 🚀 Antes de Começar

1. **Aguarde o deploy do Lovable** (5-10 minutos após o push)
2. **Faça hard reload:** `Ctrl + F5` (Windows/Linux) ou `Cmd + Shift + R` (Mac)
3. **Limpe o cache do navegador** se necessário
4. **Abra o DevTools** (F12) para inspecionar atributos HTML

---

## ✅ Testes Obrigatórios

### 1. Verificação de Atributos HTML

**Light Mode:**
```html
<html data-mode="light" data-palette="sky" class="">
```

**Dark Mode:**
```html
<html data-mode="dark" data-palette="horizon" class="dark">
```

**Como verificar:**
1. Abra DevTools (F12)
2. Inspecione o elemento `<html>`
3. Verifique os atributos `data-mode` e `data-palette`

---

### 2. Teste de Paletas

#### Light Mode (Sky Commander)

- [ ] **Primary color:** Azul profundo (#1e40af)
- [ ] **Accent color:** Azul claro vibrante (#60a5fa)
- [ ] **Background:** Claro e limpo
- [ ] **Text:** Escuro e legível
- [ ] **Cards:** Fundo branco com bordas sutis

**Onde testar:**
- Botões primários
- Links e ícones ativos
- Badges e labels
- Gráficos e indicadores

#### Dark Mode (Horizon)

- [ ] **Primary color:** Teal claro (#5eead4)
- [ ] **Accent color:** Cyan vibrante (#22d3ee)
- [ ] **Background:** Escuro profundo (#0c1220)
- [ ] **Text:** Claro e legível (#e6edf7)
- [ ] **Cards:** Fundo escuro com bordas visíveis

**Onde testar:**
- Botões primários
- Links e ícones ativos
- Badges e labels
- Gráficos e indicadores

---

### 3. Teste de Contraste (Dark Mode)

- [ ] **Nenhum texto preto** em fundo escuro
- [ ] **Placeholders** legíveis (opacidade 50%)
- [ ] **Inputs** com fundo e texto contrastantes
- [ ] **Selects** com fundo e texto contrastantes
- [ ] **Textareas** com fundo e texto contrastantes
- [ ] **Borders** visíveis mas não agressivas
- [ ] **Hover states** claramente visíveis

**Páginas críticas:**
- Dashboard (cards de métricas)
- Produtos (tabela de produtos)
- Editar Produto (formulários longos)
- Integrações (configurações)

---

### 4. Teste de Sidebar Sticky

- [ ] **Dashboard:** Sidebar fixa ao rolar
- [ ] **Produtos:** Sidebar fixa ao rolar
- [ ] **Editar Produto:** Sidebar fixa ao rolar
- [ ] **Integrações:** Sidebar fixa ao rolar
- [ ] **Configurações:** Sidebar fixa ao rolar

**Como testar:**
1. Navegue para cada página
2. Role a página para baixo
3. Verifique se a sidebar permanece visível no topo

---

### 5. Teste de Toggle Light/Dark

- [ ] **Botão de toggle** visível no header
- [ ] **Clique alterna** entre light e dark
- [ ] **Transição suave** entre modos
- [ ] **Persistência:** Recarregar página mantém o modo escolhido
- [ ] **localStorage:** Valor correto em `theme` key

**Como verificar localStorage:**
```javascript
// No console do DevTools
localStorage.getItem('theme')
// Deve retornar: "light" ou "dark"
```

---

### 6. Teste de Inputs e Formulários

#### Light Mode
- [ ] Inputs com fundo branco
- [ ] Texto escuro legível
- [ ] Borders sutis mas visíveis
- [ ] Focus ring azul (#1e40af com 35% opacidade)
- [ ] Placeholders em cinza médio

#### Dark Mode
- [ ] Inputs com fundo escuro (#0f172a)
- [ ] Texto claro legível (#e6edf7)
- [ ] Borders visíveis (#1e293b)
- [ ] Focus ring teal (#7aa2ff com 35% opacidade)
- [ ] Placeholders em branco 50% opacidade

**Páginas para testar:**
- Editar Produto (todos os campos)
- Integrações (formulários de configuração)
- Configurações (campos de perfil)

---

### 7. Teste de Botões

#### Botões Primários
- [ ] **Light:** Azul profundo (#1e40af)
- [ ] **Dark:** Teal claro (#5eead4)
- [ ] **Hover:** Brightness aumenta 5%
- [ ] **Texto:** Sempre branco (#ffffff)

#### Botões Ghost/Outline
- [ ] **Light:** Texto azul, fundo transparente
- [ ] **Dark:** Texto teal, fundo transparente
- [ ] **Hover:** Fundo sutil aparece

#### Botões Desabilitados
- [ ] Opacidade reduzida
- [ ] Cursor not-allowed
- [ ] Sem hover effect

---

### 8. Teste de Páginas Longas (Editor)

- [ ] **Sem zoom/scale** aplicado
- [ ] **Largura máxima:** 1200px no container
- [ ] **Cards não estouram** o layout
- [ ] **Tabelas responsivas** com scroll horizontal se necessário
- [ ] **Seção de Links** renderiza normalmente

**Página específica:**
- `/produtos/editar/:id` (especialmente a aba "Links")

---

### 9. Teste de Componentes Específicos

#### Cards de Métricas (Dashboard)
- [ ] Fundo correto (branco/escuro)
- [ ] Texto legível
- [ ] Valores numéricos destacados
- [ ] Ícones visíveis

#### Tabela de Produtos
- [ ] Headers legíveis
- [ ] Rows com hover effect
- [ ] Borders visíveis
- [ ] Ações (editar/deletar) visíveis

#### Navegação Lateral
- [ ] Itens ativos destacados
- [ ] Hover effect nos itens
- [ ] Ícones visíveis
- [ ] Texto legível

---

### 10. Teste de Compatibilidade

#### Navegadores
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (se disponível)

#### Resoluções
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)

---

## 🐛 Problemas Conhecidos (Resolvidos)

### ❌ Antes da Correção
- Paletas invertidas (light usava horizon, dark usava eagle)
- Texto preto em dark mode
- Sidebar não sticky em algumas páginas
- Zoom/scale nas páginas de edição

### ✅ Após a Correção
- Paletas corretas (light = sky, dark = horizon)
- Zero texto preto em dark mode
- Sidebar sticky em todas as páginas
- Editor normalizado sem zoom

---

## 📊 Resultados Esperados

### Light Mode (Sky Commander)
- Visual moderno e profissional
- Azul vibrante como cor primária
- Alto contraste
- Fundo claro e limpo

### Dark Mode (Horizon)
- Visual noturno elegante
- Teal/turquesa como cor primária
- Excelente contraste
- Fundo escuro profundo

---

## 🔧 Troubleshooting

### Problema: Paletas ainda invertidas
**Solução:** Hard reload (Ctrl+F5) e limpar cache

### Problema: Texto preto em dark mode
**Solução:** Verificar se o CSS foi carregado corretamente (inspecionar no DevTools)

### Problema: Sidebar não sticky
**Solução:** Verificar se a página usa `<MainLayout>` component

### Problema: Toggle não funciona
**Solução:** Verificar console do navegador por erros JavaScript

### Problema: localStorage não persiste
**Solução:** Verificar permissões do navegador para localStorage

---

## 📝 Reportar Problemas

Se encontrar algum problema:

1. **Anote o problema específico**
2. **Tire um screenshot**
3. **Verifique o console do DevTools** (F12)
4. **Anote a URL da página**
5. **Anote o modo (light/dark)**
6. **Reporte com todos os detalhes**

---

## ✨ Checklist Final

- [ ] Todos os testes acima passaram
- [ ] Light mode usa Sky Commander (azul #1e40af)
- [ ] Dark mode usa Horizon (teal #5eead4)
- [ ] Sidebar fixa em todas as páginas
- [ ] Zero texto preto em dark mode
- [ ] Toggle funciona e persiste
- [ ] Formulários legíveis em ambos os modos
- [ ] Botões com cores corretas
- [ ] Editor sem zoom/scale

---

**Status:** ✅ Pronto para produção  
**Última atualização:** 26/10/2025

