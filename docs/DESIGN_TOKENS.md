# Design Tokens — MB Intelligence

Fonte única do visual. Definidos no `:root` de [styles.css](../apps/web/styles.css).
**Regra:** ao escrever/alterar CSS, use SEMPRE um token; evite valores soltos
(magic numbers). Mudar o look do produto inteiro deve ser possível só no `:root`.

## Cor
- **Base:** `--bg`, `--surface`, `--surface-2`, `--ink`, `--muted`, `--soft`, `--line`
- **Marca:** `--brand`, `--brand-2`, `--brand-3`, `--graphite`, `--black`
- **Semântica:** `--success`, `--warning`, `--danger`, `--info`, `--teal`, `--amber`, `--blue`
- **Tema escuro (dashboard):** `--dark-bg`, `--dark-panel`, `--dark-line`, `--dark-ink`,
  `--dark-strong`, `--dark-muted`, `--dark-faint` + acentos foscos
  `--dash-blue`, `--dash-teal`, `--dash-amber`, `--dash-brand`

## Espaçamento (escala 4px)
`--space-1`(4) `--space-2`(8) `--space-3`(12) `--space-4`(14) `--space-5`(18)
`--space-6`(24) `--space-8`(32). Use em `padding`, `margin`, `gap`.

## Raio
`--radius-sm`(8) `--radius`(8, compat) `--radius-md`(12) `--radius-lg`(16) `--radius-pill`(999)

## Tipografia
- Família: `--font-sans`
- Tamanhos: `--text-xs`(11) `--text-sm`(12.5) `--text-base`(14) `--text-md`(15)
  `--text-lg`(17) `--text-xl`(20) `--text-2xl`(24)
- Pesos: `--weight-regular/medium/semibold/bold`

## Elevação
`--shadow`, `--shadow-soft`, `--shadow-card`, `--shadow-pop`, `--shadow-modal`

## Camadas (z-index)
`--z-backdrop`(55) `--z-sidebar`(60) `--z-modal`(200) `--z-toast`(300)

## Movimento
`--ease`, `--dur-fast`(.12s), `--dur`(.2s)

## Migração incremental
Os tokens foram adicionados **sem alterar valores existentes** (zero regressão).
A conversão dos ~3.000 valores soltos do `styles.css` para tokens é incremental:
ao tocar numa regra, troque o número pelo token correspondente. O dashboard
escuro já foi parcialmente convertido (`--dark-bg`, `--dash-*`) como referência.
