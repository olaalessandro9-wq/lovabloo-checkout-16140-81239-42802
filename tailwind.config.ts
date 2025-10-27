/** Tailwind config — v3 patch
 *  - Retrocompat aliases (shadcn) apontam para novas CSS vars (Eagle)
 *  - Funciona com data-theme="light" | "dark" + data-palette="eagle|sky|horizon"
 */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html','./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // NOVO sistema (Eagle)
        bg: 'var(--bg)',
        card: 'var(--card)',
        text: 'var(--text)',
        subtext: 'var(--subtext)',
        brand: {
          DEFAULT: 'var(--brand)',
          fg: 'var(--brand-fg)',
          subtle: 'var(--brand-subtle)',
        },
        sidebar: {
          bg: 'var(--sidebar-bg)',
          text: 'var(--sidebar-text)',
          muted: 'var(--sidebar-muted)',
          active: 'var(--sidebar-active)',
          hover: 'var(--sidebar-hover)',
          border: 'var(--sidebar-border)',
        },

        // Retrocompat (shadcn-like)
        background: 'var(--bg)',
        foreground: 'var(--text)',
        'muted-foreground': 'var(--subtext)',
        border: 'var(--sidebar-border)',
        ring: 'var(--brand)',
        card: 'var(--card)',
        'card-foreground': 'var(--text)',
        primary: 'var(--brand)',
        'primary-foreground': 'var(--brand-fg)',
      },
      boxShadow: {
        soft: '0 6px 24px rgba(0,0,0,0.06)',
      }
    },
  },
  plugins: [],
}
