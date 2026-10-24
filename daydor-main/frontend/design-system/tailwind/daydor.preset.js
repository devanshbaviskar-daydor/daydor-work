/**
 * Daydor Tailwind preset (Tailwind v3). Generated from tokens/tokens.json.
 * Usage in tailwind.config.js:  presets: [require('./design-system/tailwind/daydor.preset.js')]
 * Colours are full CSS variables, so Tailwind opacity modifiers (bg-brand/50) won't work — use the -soft tokens instead.
 */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    colors: {
      "transparent": "transparent",
      "current": "currentColor",
      "canvas": "var(--canvas)",
      "surface": "var(--surface)",
      "surface-sunken": "var(--surface-sunken)",
      "line": "var(--line)",
      "line-strong": "var(--line-strong)",
      "ink": "var(--ink)",
      "ink-muted": "var(--ink-muted)",
      "on-ink": "var(--on-ink)",
      "brand": "var(--brand)",
      "brand-strong": "var(--brand-strong)",
      "brand-soft": "var(--brand-soft)",
      "on-brand": "var(--on-brand)",
      "action": "var(--action)",
      "action-strong": "var(--action-strong)",
      "action-soft": "var(--action-soft)",
      "on-action": "var(--on-action)",
      "link": "var(--link)",
      "focus": "var(--focus)",
      "irreversible": "var(--irreversible)",
      "irreversible-soft": "var(--irreversible-soft)",
      "success": "var(--success)",
      "success-soft": "var(--success-soft)",
      "warning": "var(--warning)",
      "warning-soft": "var(--warning-soft)",
      "danger": "var(--danger)",
      "danger-soft": "var(--danger-soft)",
      "on-danger": "var(--on-danger)",
      "info": "var(--info)",
      "info-soft": "var(--info-soft)",
      "photo-ground": "var(--photo-ground)"
    },
    extend: {
      spacing: {
        "1": "var(--space-1)",
        "2": "var(--space-2)",
        "3": "var(--space-3)",
        "4": "var(--space-4)",
        "5": "var(--space-5)",
        "6": "var(--space-6)",
        "8": "var(--space-8)",
        "12": "var(--space-12)"
      },
      borderRadius: {
        "sm": "var(--radius-sm)",
        "md": "var(--radius-md)",
        "lg": "var(--radius-lg)",
        "xl": "var(--radius-xl)",
        "full": "var(--radius-full)"
      },
      boxShadow: {
        "sm": "var(--shadow-sm)",
        "md": "var(--shadow-md)",
        "lg": "var(--shadow-lg)"
      },
      fontFamily: { sans: ['var(--font-sans)'], mono: ['var(--font-mono)'] },
      fontSize: {
        "display": [
                "28px",
                {
                        "lineHeight": "34px",
                        "fontWeight": "500",
                        "letterSpacing": "-0.025em"
                }
        ],
        "title-lg": [
                "20px",
                {
                        "lineHeight": "28px",
                        "fontWeight": "500",
                        "letterSpacing": "-0.015em"
                }
        ],
        "title": [
                "15px",
                {
                        "lineHeight": "22px",
                        "fontWeight": "600",
                        "letterSpacing": "-0.005em"
                }
        ],
        "reading": [
                "15px",
                {
                        "lineHeight": "24px",
                        "fontWeight": "400"
                }
        ],
        "body": [
                "14px",
                {
                        "lineHeight": "21px",
                        "fontWeight": "400"
                }
        ],
        "small": [
                "13px",
                {
                        "lineHeight": "19px",
                        "fontWeight": "400"
                }
        ],
        "label": [
                "13px",
                {
                        "lineHeight": "18px",
                        "fontWeight": "500"
                }
        ],
        "eyebrow": [
                "12px",
                {
                        "lineHeight": "16px",
                        "fontWeight": "500",
                        "letterSpacing": "0.01em"
                }
        ],
        "figure": [
                "24px",
                {
                        "lineHeight": "30px",
                        "fontWeight": "500",
                        "letterSpacing": "-0.02em"
                }
        ],
        "code": [
                "12px",
                {
                        "lineHeight": "18px",
                        "fontWeight": "400"
                }
        ]
      },
      maxWidth: { conversation: 'var(--conversation-max)', form: 'var(--form-max)' },
      width: { rail: 'var(--rail-width)' },
      height: { 'control-sm': 'var(--control-sm)', 'control-md': 'var(--control-md)', 'control-lg': 'var(--control-lg)' },
    },
  },
};
