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

  /* Thang chữ MSB Business, đọc từ Figma "[MB] Chuyển tiền đơn - [CTB EB]".
     Tên tier khớp tên text style trong thiết kế. Cỡ chữ và line-height luôn
     đi cặp, nên dùng text-<tier> là không cần leading-* kèm theo. */
  --text-h3: 22px;
  --text-h3--line-height: 32px;
  --text-title: 18px;
  --text-title--line-height: 24px;
  --text-body: 16px;
  --text-body--line-height: 24px;
  --text-small: 14px;
  --text-small--line-height: 20px;
  --text-caption: 12px;
  --text-caption--line-height: 16px;
  --color-obsidian: #13161B;
  --color-sapphire: #22262F;
  --color-card: #0C0E12;
  --color-dialogue: #13161B;
  --color-msb-orange: #BE9A61;
  --color-msb-tint: #E5D7C0;
  --color-msb-gold: #BE9A61;
  --color-signal: #12B76A;
  --color-alert: #F04438;
  --color-link: #BE9A61;
  --color-mfirst-gold: #BE9A61;
  --color-mfirst-gold-light: #E5D7C0;
  --color-mfirst-gold-hover: #725C3A;
  --color-mfirst-gold-focus: #987B4E;
  --color-mfirst-gold-pressed: #D8C2A0;
  --color-mfirst-bg-primary: #13161B;
  --color-mfirst-bg-secondary: #22262F;
  --color-mfirst-surface-card: #0C0E12;
  --color-mfirst-surface-error: #601B16;
  --color-mfirst-surface-warning: #633A04;
  --color-mfirst-surface-success: #07492A;
  --color-mfirst-surface-info: #123A64;
  --color-mfirst-text-primary: #F0F0F1;
  --color-mfirst-text-secondary: #CECFD2;
  --color-mfirst-text-disable: #373A41;
  --color-mfirst-text-placeholder: #61656C;
  --color-mfirst-text-error: #F9B4AF;
  --color-mfirst-text-warning: #FCD39D;
  --color-mfirst-text-success: #A0E2C3;
  --color-mfirst-text-info: #ABD3FD;
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
  /* --- mFirst Luxury Theme Paint Styles --- */
  --bg-eb-dark-1: linear-gradient(115deg, #13161B 0%, #1A1D24 50%, #262019 100%);
  --bg-eb-dark-1-mobile: linear-gradient(115deg, #13161B 0%, #1A1D24 50%, #262019 100%);
  --stroke-glass-1-sweep: linear-gradient(108deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.20) 33%, rgba(190, 154, 97, 0.60) 100%);
  --stroke-glass-1: linear-gradient(180deg, rgba(190, 154, 97, 0.50) 0%, rgba(255, 255, 255, 0.20) 33%, rgba(255, 255, 255, 0.05) 100%);
  --btn-primary-gradient: linear-gradient(135deg, #BE9A61 0%, #D8C2A0 50%, #BE9A61 100%);
  --skeleton-gradient: linear-gradient(90deg, #22262F 0%, #373A41 100%);

  /* --- Brand & Functional Colors (mFirst) --- */
  --color-brand-primary: #BE9A61;
  --color-brand-tint: #E5D7C0;
  --color-success: #12B76A;
  --color-warning: #F79009;
  --color-warning-surface: #633A04;
  --color-warning-border: #987B4E;
  --color-error: #F04438;
  --color-error-surface: #601B16;
  --color-link: #BE9A61;
  --color-text-amount-spellout: #94979C;

  /* --- Neutrals & Surfaces (mFirst) --- */
  --color-text-primary: #F0F0F1;
  --color-text-secondary: #CECFD2;
  --color-text-muted: #94979C;
  --color-placeholder: #61656C;
  --color-divider: rgba(255, 255, 255, 0.12);
  --color-surface-card: rgba(12, 14, 18, 0.40);
  --color-surface-input: #13161B;
  --color-scrim: rgba(12, 14, 18, 0.60);
  --color-footer-glass: rgba(19, 22, 27, 0.85);

  /* --- Radii Tokens --- */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 32px;
  --radius-circle: 9999px;

  /* --- Shadows & Blur --- */
  --shadow-center: 0 0 4px rgba(12, 14, 18, 0.15);
  --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.50);
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
  background-color: #13161B;
  background-image: linear-gradient(115deg, #13161B 0%, #1A1D24 50%, #262019 100%);
  color: #F0F0F1;
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

/* --- Design System Component Classes (mFirst) --- */
.card-glass {
  background-color: rgba(12, 14, 18, 0.40);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-top-color: rgba(190, 154, 97, 0.40);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.50);
}

.card-eb-dark {
  background: linear-gradient(115deg, #13161B 0%, #1A1D24 50%, #262019 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-top-color: rgba(190, 154, 97, 0.40);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.50);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.btn-primary-msb {
  background: linear-gradient(135deg, #BE9A61 0%, #D8C2A0 50%, #BE9A61 100%);
  color: #13161B;
  border-radius: 8px;
  font-weight: 700;
  transition: all 0.15s ease-in-out;
}
.btn-primary-msb:hover {
  opacity: 0.94;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(190, 154, 97, 0.45);
}
.btn-primary-msb:active {
  transform: translateY(0);
}

.btn-secondary-msb {
  background: transparent;
  border: 1px solid #BE9A61;
  color: #BE9A61;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.15s ease-in-out;
}
.btn-secondary-msb:hover {
  background: rgba(190, 154, 97, 0.12);
}

.chip-pill {
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: #F0F0F1;
  font-size: 12px;
  line-height: 16px;
  padding: 6px 12px;
  transition: all 0.15s ease-in-out;
}
.chip-pill:hover {
  border-color: rgba(190, 154, 97, 0.6);
  background: rgba(190, 154, 97, 0.15);
  color: #FFFFFF;
}

.bg-eb-gradient {
  background: linear-gradient(102deg, #13161B 0%, #1A1D24 50%, #262019 100%);
}
.bg-eb-gradient-mobile {
  background: linear-gradient(115deg, #13161B 0%, #1A1D24 50%, #262019 100%);
}
`

  const finalCss = `${builtUtilities}\n${customKeyframesAndGlobals}`
  fs.writeFileSync('src/app/globals.css', finalCss, 'utf8')
  console.log(`[build-css] Đã biên dịch ${finalCss.length} bytes CSS vào src/app/globals.css`)
}

void buildCss()
