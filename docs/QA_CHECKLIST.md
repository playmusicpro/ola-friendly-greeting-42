# QA Checklist - Produção & Submissão para Lojas

Este documento contém a checklist completa para preparar o app para produção.

## 📋 Testes Automatizados

### Unit Tests

- [x] `src/lib/__tests__/calculations.test.ts` - Testes de cálculos financeiros
  - calculateShow (gastos, lucro, margem)
  - calculateDRE (receita bruta, custos, resultado operacional)
  - calculateProjectProgress (progresso, semanas restantes)
  - calculateMonthlyProjection (projeção de faturamento)
  - formatCurrency, formatPercentage

- [x] `src/lib/__tests__/transposeChord.test.ts` - Testes de transposição de acordes
  - Acordes simples (C, D, G)
  - Acordes com sustenido (C#, F#)
  - Acordes com bemol (Bb, Eb) - conversão enarmônica
  - Sufixos complexos (7, m7, maj7, sus4, add9)
  - Slash chords (C/G, D/F#)
  - Transposição de cifra completa

- [x] `src/lib/__tests__/dateUtils.test.ts` - Testes de utilitários de data

### Como executar testes

```bash
# Rodar todos os testes
bun run test

# Rodar com cobertura
bun run test --coverage

# Rodar testes específicos
bun run test src/lib/__tests__/calculations.test.ts
```

---

## 🎯 Cenários E2E (Manual ou Playwright)

### Cenário 1: Fluxo Completo de Show

1. ➡️ Navegar para /shows
2. ➡️ Clicar em "Novo Show"
3. ➡️ Preencher formulário (local, data, cachê, custos)
4. ➡️ Salvar show
5. ✅ Verificar que show aparece na lista
6. ✅ Verificar que DRE foi calculado (lucro, margem)
7. ➡️ Navegar para /financas
8. ✅ Verificar que receita total inclui novo show

### Cenário 2: Gestão de Setlist

1. ➡️ Navegar para /repertorio
2. ➡️ Adicionar nova música com cifra
3. ➡️ Criar novo setlist
4. ➡️ Adicionar música ao setlist
5. ➡️ Mudar tom da música (transpor)
6. ➡️ Abrir Modo Show
7. ✅ Verificar que cifra está transposta corretamente
8. ✅ Verificar navegação por teclado (setas, espaço)
9. ✅ Verificar modo tela cheia

### Cenário 3: Receitas Extras

1. ➡️ Navegar para /receitas
2. ➡️ Adicionar nova receita (aula de música)
3. ➡️ Navegar para /financas
4. ✅ Verificar que receita aparece no DRE

---

## ⚡ Performance

### Otimizações Implementadas

- [x] **Lazy Loading**: Componentes pesados carregados sob demanda
- [x] **Cache de Setlists**: Setlists cacheados para Modo Show offline
- [x] **Debounce/Throttle**: Utilitários para evitar excesso de renders
- [x] **Skeleton Loading**: Feedback visual durante carregamento

### Métricas Alvo

| Métrica | Alvo | Status |
|---------|------|--------|
| First Contentful Paint | < 1.5s | ✅ |
| Largest Contentful Paint | < 2.5s | ✅ |
| Time to Interactive | < 3s | ✅ |
| Cumulative Layout Shift | < 0.1 | ✅ |

### Como medir

1. Chrome DevTools > Lighthouse
2. PageSpeed Insights
3. WebPageTest

---

## ♿ Acessibilidade (a11y)

### WCAG 2.1 Checklist

#### Nível A (Obrigatório)

- [x] **1.1.1** Alternativas de texto para imagens
- [x] **1.3.1** Estrutura semântica (headings, landmarks)
- [x] **1.4.1** Uso de cor não é único indicador
- [x] **2.1.1** Navegação por teclado
- [x] **2.4.1** Skip links / bypass blocks
- [x] **4.1.1** Parsing (HTML válido)
- [x] **4.1.2** Name, Role, Value (ARIA)

#### Nível AA (Recomendado)

- [x] **1.4.3** Contraste mínimo 4.5:1 (texto)
- [x] **1.4.4** Resize text até 200%
- [x] **1.4.10** Reflow (sem scroll horizontal em 320px)
- [x] **2.4.6** Headings descritivos
- [x] **2.4.7** Focus visível

### Recursos de Acessibilidade

- [x] Modo de alto contraste
- [x] Ajuste de tamanho de fonte (Normal/Grande/Muito Grande)
- [x] Suporte a prefers-reduced-motion
- [x] Focus rings visíveis
- [x] ARIA labels em botões e controles
- [x] Roles semânticos em regiões

### Como testar

```bash
# axe-core via browser extension
# WAVE Web Accessibility Evaluation Tool
# Lighthouse Accessibility audit
```

---

## 📱 Checklist Play Store (PWA)

### Requisitos Técnicos

- [ ] **manifest.json** configurado
- [ ] **Service Worker** registrado
- [ ] **Icons** em todos os tamanhos (192x192, 512x512)
- [ ] **Screenshots** da app (phone e tablet)
- [ ] **HTTPS** obrigatório

### manifest.json Exemplo

```json
{
  "name": "Músico Pro",
  "short_name": "MúsicoPro",
  "description": "Gestão financeira para músicos",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3366FF",
  "background_color": "#000000",
  "icons": [...]
}
```

### TWA (Trusted Web Activity)

Para publicar na Play Store como TWA:

1. Criar projeto Android com bubblewrap
2. Configurar assetlinks.json
3. Gerar APK/AAB assinado
4. Upload no Google Play Console

---

## 🍎 Checklist App Store (iOS)

### Requisitos

- [ ] **Apple Developer Account** ($99/ano)
- [ ] **Capacitor/Cordova** para wrapper nativo
- [ ] **Icons** em todos os tamanhos iOS
- [ ] **Launch screens** configurados
- [ ] **Privacy policy** URL

### Build iOS

```bash
# Com Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npm run build
npx cap sync
npx cap open ios
```

---

## 🔒 Segurança

- [ ] Sem API keys expostas no código
- [ ] Content Security Policy configurado
- [ ] HTTPS em produção
- [ ] Sanitização de inputs
- [ ] Rate limiting (se tiver backend)

---

## 📦 Build de Produção

```bash
# Build otimizado
bun run build

# Preview local
bun run preview

# Verificar tamanho do bundle
npx vite-bundle-visualizer
```

### Otimizações de Build

- [x] Tree shaking habilitado
- [x] Code splitting por rotas
- [x] Minificação de CSS/JS
- [x] Compressão de assets

---

## ✅ Checklist Final

### Antes de Publicar

- [ ] Todos os testes passando
- [ ] Lighthouse score > 90 em todas as categorias
- [ ] Testado em Chrome, Firefox, Safari
- [ ] Testado em iOS e Android (browser)
- [ ] Analytics configurado
- [ ] Error tracking configurado (Sentry)
- [ ] Backup de dados implementado
- [ ] Política de privacidade publicada
- [ ] Termos de uso publicados

### Após Publicar

- [ ] Monitorar métricas de erro
- [ ] Coletar feedback de usuários
- [ ] Planejar próximas releases
