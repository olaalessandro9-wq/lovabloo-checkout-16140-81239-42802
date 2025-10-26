import type { Config } from "tailwindcss";

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // ===== EAGLE VISION SYSTEM (NOVO) =====
        bg: 'var(--bg)',
        card: 'var(--card)',
        text: 'var(--text)',
        subtext: 'var(--subtext)',
        muted: 'var(--muted)',
        brand: { 
          DEFAULT: 'var(--brand)', 
          fg: 'var(--brand-fg)', 
          subtle: 'var(--brand-subtle)' 
        },
        sidebar: {
          bg: 'var(--sidebar-bg)',
          text: 'var(--sidebar-text)',
          muted: 'var(--sidebar-muted)',
          active: 'var(--sidebar-active)',
          hover: 'var(--sidebar-hover)',
          border: 'var(--sidebar-border)',
        },

        // ===== ALIASES PARA COMPATIBILIDADE (SISTEMA ANTIGO) =====
        // Mapeia classes antigas (bg-background, text-foreground, etc.) para novas vars
        background: 'var(--bg)',
        foreground: 'var(--text)',
        primary: {
          DEFAULT: 'var(--brand)',
          foreground: 'var(--brand-fg)',
        },
        secondary: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--text)',
        },
        destructive: {
          DEFAULT: "hsl(0 72% 51%)",
          foreground: "hsl(0 0% 100%)",
        },
        accent: {
          DEFAULT: 'var(--brand-subtle)',
          foreground: 'var(--text)',
        },
        popover: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--text)',
        },
        'card-foreground': 'var(--text)',
        'muted-foreground': 'var(--subtext)',
        border: 'var(--sidebar-border)',
        input: 'var(--card)',
        ring: 'var(--brand)',
        success: "hsl(142 76% 36%)",
        warning: "hsl(38 92% 50%)",
        info: 'var(--brand)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-card': 'var(--gradient-card)',
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'card': 'var(--shadow-card)',
        'soft': '0 6px 24px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl2: '1rem',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

