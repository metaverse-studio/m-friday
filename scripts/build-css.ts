import fs from 'fs'
import path from 'path'
import { compile } from 'tailwindcss'

async function buildCss() {
  const files: string[] = []
  function walk(dir: string) {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/\.(tsx|ts|jsx|js|html)$/.test(entry.name)) files.push(full)
    }
  }
  walk('src')

  const candidates = new Set<string>()
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    const matches = content.match(/[^\s"'`<>{}]+/g) || []
    for (const m of matches) candidates.add(m)
  }

  const template = `@import "tailwindcss";

@theme {
  --font-sans: var(--font-inter), system-ui, -apple-system, sans-serif;
  --color-obsidian: #0D2745;
  --color-sapphire: #101520;
  --color-card: #131A27;
  --color-dialogue: #0E1420;
  --color-msb-orange: #F4600C;
  --color-msb-tint: #FDDFCE;
  --color-msb-gold: #F79009;
  --color-signal: #12B76A;
  --color-alert: #F04438;
  --color-link: #2E90FA;
}
`

  const compiler = await compile(template, {
    loadStylesheet: async (id) => {
      const filePath = path.resolve(
        'node_modules/tailwindcss',
        id === 'tailwindcss' ? 'index.css' : id,
      )
      return {
        base: path.dirname(filePath),
        content: fs.readFileSync(filePath, 'utf8'),
      }
    },
  })

  const builtUtilities = compiler.build(Array.from(candidates))

  const customKeyframesAndGlobals = `
:root {
  /* --- Figma Paint Styles (Affine Matrix Decoded) --- */
  --bg-eb-dark-1: linear-gradient(102deg, #0D2745 0%, #232323 49%, #4B372B 92%);
  --bg-eb-dark-1-mobile: linear-gradient(115deg, #0D2745 0%, #232323 49%, #4B372B 92%);
  --stroke-glass-1-sweep: linear-gradient(108deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.20) 33%, rgba(255, 255, 255, 0.60) 100%);
  --stroke-glass-1: linear-gradient(180deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.20) 33%, rgba(255, 255, 255, 0) 100%);
  --btn-primary-gradient: linear-gradient(0deg, #E45F35 0%, #FFA95A 100%);
  --skeleton-gradient: linear-gradient(90deg, #EAF4FF 0%, #DEE5EF 100%);

  /* --- Brand & Functional Colors --- */
  --color-brand-primary: #F4600C;
  --color-brand-tint: #FDDFCE;
  --color-success: #12B76A;
  --color-warning: #F79009;
  --color-warning-surface: #FEF4E6;
  --color-warning-border: #FDE9CE;
  --color-error: #F04438;
  --color-link: #2E90FA;
  --color-text-amount-spellout: #6B788E;

  /* --- Neutrals & Surfaces --- */
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #94A3B8;
  --color-text-muted: #64748B;
  --color-placeholder: #A6AEBB;
  --color-divider: rgba(255, 255, 255, 0.12);
  --color-surface-card: rgba(19, 26, 39, 0.85);
  --color-surface-input: #131A27;
  --color-scrim: rgba(29, 41, 57, 0.60);
  --color-footer-glass: rgba(16, 21, 32, 0.85);

  /* --- Radii Tokens --- */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 32px;
  --radius-circle: 9999px;

  /* --- Shadows & Blur --- */
  --shadow-center: 0 0 4px rgba(29, 41, 57, 0.15);
  --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.45);
  --blur-glass: 24px;
}

@keyframes orbPulse {
  0%, 100% { transform: scale(0.92); opacity: 0.75; }
  50% { transform: scale(1.06); opacity: 1; }
}

@keyframes orbSpin {
  to { transform: rotate(360deg); }
}

@keyframes orbSpinR {
  to { transform: rotate(-360deg); }
}

@keyframes waveBar {
  0%, 100% { transform: scaleY(0.28); }
  50% { transform: scaleY(1); }
}

@keyframes scanRing {
  0% { transform: scale(1); opacity: 0.85; }
  100% { transform: scale(1.45); opacity: 0; }
}

@keyframes scanLine {
  0% { top: 4%; }
  100% { top: 96%; }
}

@keyframes riseIn {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes breathe {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
}

html, body {
  background-color: #0D2745;
  background-image: linear-gradient(115deg, #0D2745 0%, #232323 49%, #4B372B 92%);
  color: white;
  font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
  overscroll-behavior: none;
  -webkit-font-smoothing: antialiased;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* --- Thang chữ MSB Business, đọc từ Figma "[MB] Chuyển tiền đơn - [CTB EB]" ---
   Tên class khớp tên text style trong thiết kế: H3 / Title / Base / Small / Caption */
.font-h3-bold { font-family: var(--font-inter), sans-serif; font-size: 22px; line-height: 32px; font-weight: 700; }
.font-h3-semibold { font-family: var(--font-inter), sans-serif; font-size: 22px; line-height: 32px; font-weight: 600; }
.font-title-bold { font-family: var(--font-inter), sans-serif; font-size: 18px; line-height: 24px; font-weight: 700; letter-spacing: -0.27px; }
.font-title-semibold { font-family: var(--font-inter), sans-serif; font-size: 18px; line-height: 24px; font-weight: 600; }
.font-title-medium { font-family: var(--font-inter), sans-serif; font-size: 18px; line-height: 24px; font-weight: 500; }
.font-base-semibold { font-family: var(--font-inter), sans-serif; font-size: 16px; line-height: 24px; font-weight: 600; }
.font-base-medium { font-family: var(--font-inter), sans-serif; font-size: 16px; line-height: 24px; font-weight: 500; }
.font-base-regular { font-family: var(--font-inter), sans-serif; font-size: 16px; line-height: 24px; font-weight: 400; }
.font-small-semibold { font-family: var(--font-inter), sans-serif; font-size: 14px; line-height: 20px; font-weight: 600; }
.font-small-medium { font-family: var(--font-inter), sans-serif; font-size: 14px; line-height: 20px; font-weight: 500; }
.font-small-regular { font-family: var(--font-inter), sans-serif; font-size: 14px; line-height: 20px; font-weight: 400; }
.font-caption-medium { font-family: var(--font-inter), sans-serif; font-size: 12px; line-height: 16px; font-weight: 500; }
.font-caption-regular { font-family: var(--font-inter), sans-serif; font-size: 12px; line-height: 16px; font-weight: 400; }

/* --- Design System Component Classes --- */
.card-glass {
  background-color: rgba(19, 26, 39, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-top-color: rgba(255, 255, 255, 0.60);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
}

.card-eb-dark {
  background: linear-gradient(102deg, #0D2745 0%, #232323 49%, #4B372B 92%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-top-color: rgba(255, 255, 255, 0.60);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.btn-primary-msb {
  background: linear-gradient(0deg, #E45F35 0%, #FFA95A 100%);
  color: #FFFFFF;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
}
.btn-primary-msb:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}
.btn-primary-msb:active {
  transform: translateY(0);
}

.btn-secondary-msb {
  background: transparent;
  border: 1px solid #F4600C;
  color: #F4600C;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
}
.btn-secondary-msb:hover {
  background: rgba(244, 96, 12, 0.1);
}

.chip-pill {
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  line-height: 16px;
  padding: 6px 12px;
  transition: all 0.15s ease-in-out;
}
.chip-pill:hover {
  border-color: rgba(247, 144, 9, 0.6);
  background: rgba(247, 144, 9, 0.12);
  color: #FFFFFF;
}

.bg-eb-gradient {
  background: linear-gradient(102deg, #0D2745 0%, #232323 49%, #4B372B 92%);
}
.bg-eb-gradient-mobile {
  background: linear-gradient(115deg, #0D2745 0%, #232323 49%, #4B372B 92%);
}
`

  const finalCss = `${builtUtilities}\n${customKeyframesAndGlobals}`
  fs.writeFileSync('src/app/globals.css', finalCss, 'utf8')
  console.log(`[build-css] Đã biên dịch ${finalCss.length} bytes CSS vào src/app/globals.css`)
}

void buildCss()
