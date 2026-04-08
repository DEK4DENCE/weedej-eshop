# Weedejna Cannabis E-Shop — Design System

**Version**: 1.0.0
**Date**: 2026-04-07
**Stack**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui + Framer Motion + Lucide React

---

## 1. Color Palette

### Base Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-primary` | `#0A0D0A` | Page background (near-black with green tint) |
| `--color-bg-secondary` | `#111714` | Card surfaces, nav background |
| `--color-bg-tertiary` | `#1A2219` | Input fields, code blocks, hover states |
| `--color-bg-elevated` | `#1F2B1E` | Dropdown menus, popovers, modals |
| `--color-bg-overlay` | `rgba(10, 13, 10, 0.85)` | Modal backdrops, cart overlay |

### Brand Accent Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-green-50` | `#EDFAED` | Light green tint backgrounds |
| `--color-green-100` | `#C8F0C8` | Success light states |
| `--color-green-200` | `#96E296` | Subtle highlights |
| `--color-green-300` | `#5FD15F` | Active states |
| `--color-green-400` | `#38C424` | Hover state for primary green |
| `--color-green-500` | `#22A829` | Primary cannabis green (main brand) |
| `--color-green-600` | `#198A1F` | Pressed/active primary |
| `--color-green-700` | `#116616` | Darker accent |
| `--color-green-800` | `#0A420E` | Very dark green |
| `--color-green-900` | `#052208` | Near-black green tint |

### Gold/Amber Accent

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-gold-500` | `#D4A017` | Primary gold (secondary accent) |
| `--color-gold-600` | `#B8860B` | Dark goldenrod — premium feel |
| `--color-gold-400` | `#F5B800` | Standard gold highlight |
| `--color-gold-300` | `#FFC933` | Warm gold |

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text-primary` | `#F0F5F0` | Primary body text |
| `--color-text-secondary` | `#B8C8B8` | Secondary text, subtitles |
| `--color-text-muted` | `#6B8A6B` | Placeholder text, disabled states |
| `--color-text-accent-green` | `#4DD94D` | Green text highlights |
| `--color-text-accent-gold` | `#D4A017` | Gold text highlights |

### Semantic/State Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#22A829` | Success states |
| `--color-warning` | `#F5B800` | Warning states |
| `--color-error` | `#E53E3E` | Error states |
| `--color-info` | `#3B82F6` | Info states |

### Border Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-border-default` | `#1F3D1F` | Default card/input borders |
| `--color-border-subtle` | `#152A15` | Very subtle separators |
| `--color-border-strong` | `#2D5C2D` | Focused inputs, active cards |
| `--color-border-accent` | `#22A829` | Green accent borders |
| `--color-border-gold` | `#D4A017` | Gold premium borders |

---

## 2. Typography

### Font Families

```
Primary Display: "Playfair Display" (Google Fonts) — headings, hero text
Primary Body: "Inter" (Google Fonts) — body text, UI elements
Accent/Mono: "Space Grotesk" (Google Fonts) — prices, stats, badges
```

**Google Fonts Import URL:**
```
https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap
```

### Heading Styles

| Element | Font | Size | Weight | Line Height | Color |
|---------|------|------|--------|-------------|-------|
| H1 | Playfair Display | 72px | 900 | 1.1 | `#F0F5F0` |
| H2 | Playfair Display | 60px | 700 | 1.15 | `#F0F5F0` |
| H3 | Playfair Display | 48px | 700 | 1.2 | `#F0F5F0` |
| H4 | Inter | 36px | 700 | 1.25 | `#F0F5F0` |
| H5 | Inter | 30px | 600 | 1.3 | `#B8C8B8` |
| H6 | Inter | 24px | 600 | 1.35 | `#B8C8B8` |

---

## 3. Spacing & Layout

### Container
**Page Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

### Grid System
- **Product grid**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`
- **Category grid**: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4`
- **Sidebar layout**: `grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8`

### Breakpoints
| Name | Min Width |
|------|-----------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

---

## 4. Component Designs

### 4.1 Navigation Bar
- Height: `h-16` (64px)
- Background: `bg-[#111714]/95 backdrop-blur-md`
- Border: `border-b border-[#1F3D1F]`
- Logo: cannabis leaf SVG `#22A829` + "Weedejna" in Playfair Display bold
- Nav links: `text-sm font-medium text-[#B8C8B8] hover:text-[#22A829] transition-colors`
- Cart badge: `bg-[#22A829] text-black text-xs rounded-full w-5 h-5`
- Login button: `border-[#22A829] text-[#22A829] hover:bg-[#22A829] hover:text-black`

### 4.2 Hero Section
- Container: `relative w-full min-h-screen overflow-hidden`
- Background: `bg-gradient-to-br from-[#0A0D0A] via-[#0D1A0D] to-[#0A0D0A]`
- Spotlight: `radial-gradient(ellipse at 60% 50%, rgba(34,168,41,0.08) 0%, transparent 70%)`
- Headline: Playfair Display 72px, weight 900, `text-[#F0F5F0]` with "Finest" in `text-[#22A829]`
- Primary CTA: `bg-[#22A829] hover:bg-[#38C424] text-black font-semibold px-8 py-3 rounded-full hover:shadow-[0_0_30px_rgba(34,168,41,0.4)]`
- Secondary CTA: `border border-[#2D5C2D] text-[#F0F5F0] hover:border-[#22A829] px-8 py-3 rounded-full`

### 4.3 Product Card
- Container: `bg-[#111714] rounded-2xl overflow-hidden border border-[#1F3D1F] hover:border-[#22A829] group`
- Image: `object-cover w-full h-[260px] group-hover:scale-105 transition-transform duration-500`
- Name: `text-base font-semibold text-[#F0F5F0] leading-snug line-clamp-2`
- Price: `text-xl font-bold text-[#D4A017]` (Space Grotesk)
- Add-to-cart: `w-9 h-9 rounded-full bg-[#22A829] hover:bg-[#38C424] flex items-center justify-center text-black`

### 4.4 Cart Sidebar
- Width: `w-[400px]` (mobile: `w-full max-w-[90vw]`)
- Background: `bg-[#111714] border-l border-[#1F3D1F]`
- Shadow: `shadow-[-20px_0_60px_rgba(0,0,0,0.6)]`
- Checkout button: `bg-[#22A829] hover:bg-[#38C424] text-black font-bold py-4 rounded-xl`

### 4.5 Order Status Badges
All: Space Grotesk, `text-xs font-medium px-3 py-1 rounded-full`

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Pending | `#2E2200` | `#F5B800` | — |
| Paid | `#0D2000` | `#22A829` | `#1A6B1D` |
| Processing | `#0E1B2D` | `#60A5FA` | — |
| Packed | `#0D1A2D` | `#38BDF8` | `#0E4A7A` |
| Shipped | `#1A1A2E` | `#A78BFA` | — |
| Out for Delivery | `#1A0D2E` | `#C084FC` | `#5B2D8A` |
| Delivered | `#0D2E0E` | `#22A829` | — |
| Cancelled | `#2D0E0E` | `#E53E3E` | — |
| Refunded | `#1A1505` | `#D4A017` | — |

### 4.6 Buttons

**Primary**: `bg-[#22A829] hover:bg-[#38C424] text-black rounded-xl px-6 py-2.5 text-sm font-semibold hover:shadow-[0_4px_20px_rgba(34,168,41,0.35)]`

**Secondary**: `bg-transparent border border-[#22A829] text-[#22A829] hover:bg-[#22A829]/10 rounded-xl px-6 py-2.5 text-sm font-semibold`

**Ghost**: `bg-transparent text-[#B8C8B8] hover:text-[#F0F5F0] hover:bg-[#1A2219] rounded-xl px-6 py-2.5 text-sm font-semibold`

**Gold**: `bg-[#D4A017] hover:bg-[#F5B800] text-black rounded-xl px-6 py-2.5 text-sm font-semibold hover:shadow-[0_4px_20px_rgba(212,160,23,0.35)]`

**Danger**: `bg-[#E53E3E] hover:bg-[#FC5C5C] text-white rounded-xl px-6 py-2.5 text-sm font-semibold`

### 4.7 Form Inputs
```
bg-[#1A2219] border border-[#1F3D1F] rounded-xl px-4 py-3
text-sm text-[#F0F5F0] placeholder:text-[#3D5C3D]
focus:outline-none focus:border-[#22A829] focus:ring-2 focus:ring-[#22A829]/20
transition-all duration-200 w-full
```

---

## 5. Animations (Framer Motion)

### Page Transitions
```typescript
export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } }
}
```

### Hero Entrance (stagger)
```typescript
export const heroContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } }
}
export const heroItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
}
```

### Cart Drawer
```typescript
export const cartDrawerVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } }
}
```

### Scroll Fade-ins
```typescript
export const fadeInUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
}
// Trigger: useInView({ once: true, margin: '-80px' })
// Stagger grid items: staggerChildren: 0.08
```

### Mobile Nav Menu
```typescript
export const mobileMenuVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { height: { duration: 0.3, ease: 'easeOut' }, opacity: { duration: 0.2 } } },
  exit: { height: 0, opacity: 0, transition: { height: { duration: 0.25, ease: 'easeIn' }, opacity: { duration: 0.15 } } }
}
```

### Image Gallery
```typescript
export const galleryVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? '60%' : '-60%', opacity: 0, scale: 0.95 }),
  center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: (direction: number) => ({ x: direction > 0 ? '-60%' : '60%', opacity: 0, scale: 0.95, transition: { duration: 0.3, ease: 'easeIn' } })
}
```

---

## 6. Icons (Lucide React)

Key icons: `ShoppingCart`, `ShoppingBag`, `User`, `Search`, `Menu`, `X`, `Check`, `CheckCircle2`, `AlertTriangle`, `ArrowRight`, `Plus`, `Minus`, `Trash2`, `Star`, `Package`, `Truck`, `CreditCard`, `Lock`, `Eye`, `EyeOff`, `Mail`, `Leaf`, `Sparkles`, `Loader2`

Default size: 20px, strokeWidth: 2

---

## 7. Page Layout Specifications

### Homepage
```
[NAVBAR — sticky 64px]
[HERO — min-h-screen, animated bg, headline + CTAs + stats]
[CATEGORY STRIP — 6 category cards]
[FEATURED PRODUCTS — "Best Sellers", 4-col grid, 8 products]
[PROMOTIONAL BANNER — gold gradient]
[NEW ARRIVALS — 4-col grid, 4 products]
[WHY CHOOSE US — 3 icon+text blocks]
[TESTIMONIALS — 3-col cards]
[NEWSLETTER — email input]
[FOOTER]
```

### Product Listing
```
[PAGE HEADER + breadcrumb]
[FILTER SIDEBAR (280px) + PRODUCT GRID (3-col desktop)]
[PAGINATION]
```

### Product Detail
```
[BREADCRUMB]
[2-col: IMAGE GALLERY | PRODUCT INFO (name, price, variants, add-to-cart)]
[TABS: Description / Effects / Reviews]
[RELATED PRODUCTS]
```

### Admin Dashboard
```
[ADMIN SIDEBAR (240px) + MAIN CONTENT]
[STATS CARDS (4x) + REVENUE CHART + ORDERS TABLE]
```

### 7.10 Layout Defaults for Unspecified Pages

**Auth pages** (login, register, forgot-password, reset-password, verify-email): Use the centered auth card layout — `min-h-screen bg-[#0A0D0A] flex items-center justify-center px-4`. Card: `bg-[#111714] border border-[#1F3D1F] rounded-2xl p-8 w-full max-w-md`.

**Account pages** (profile, orders, settings, addresses): Use the Account Sidebar (220px, `bg-[#111714] border-r border-[#1F3D1F]`) + Content Area (`flex-1 p-8`) layout. Active nav item: `bg-[#22A829]/10 text-[#22A829] border-l-2 border-[#22A829]`.

**Cart page**: Two-column `lg:grid-cols-[1fr_380px]` layout. Cart items list on left, Order Summary sticky card on right (`bg-[#111714] border border-[#1F3D1F] rounded-2xl p-6`).

**Checkout pages** (all steps + success): Two-column `lg:grid-cols-[1fr_380px]`. Form/content area on left, Order Summary sidebar sticky on right. Stepper at top: active `bg-[#22A829] text-black`, completed `bg-[#22A829]/30 text-[#22A829]`, inactive `bg-[#1A2219] text-[#6B8A6B]`.

**Search results**: Same layout as Product Listing (Section 7.2) with "Results for '{query}'" as page heading.

**Admin CRUD pages** (product create/edit, order detail, user detail, category management): Use Admin Sidebar (240px) + Main Content shell. Forms: `bg-[#111714] border border-[#1F3D1F] rounded-2xl p-8 max-w-2xl`. Tables use the Admin Table Styling defined in Section 7.4.

**404 / Error pages**: Centered, `min-h-screen bg-[#0A0D0A] flex flex-col items-center justify-center`. Large error code in Playfair Display `text-8xl font-black text-[#22A829]/20`. Message in `text-xl text-[#B8C8B8]`. "Go Home" primary button.

---

## 8. Tailwind Config (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
    extend: {
      colors: {
        background: '#0A0D0A',
        foreground: '#F0F5F0',
        card: { DEFAULT: '#111714', foreground: '#F0F5F0' },
        popover: { DEFAULT: '#1F2B1E', foreground: '#F0F5F0' },
        primary: { DEFAULT: '#22A829', foreground: '#0A0D0A' },
        secondary: { DEFAULT: '#1A2219', foreground: '#B8C8B8' },
        muted: { DEFAULT: '#1A2219', foreground: '#6B8A6B' },
        accent: { DEFAULT: '#D4A017', foreground: '#0A0D0A' },
        destructive: { DEFAULT: '#E53E3E', foreground: '#F0F5F0' },
        border: '#1F3D1F',
        input: '#1F3D1F',
        ring: '#22A829',
        green: {
          50: '#EDFAED', 100: '#C8F0C8', 200: '#96E296', 300: '#5FD15F',
          400: '#38C424', 500: '#22A829', 600: '#198A1F', 700: '#116616',
          800: '#0A420E', 900: '#052208',
        },
        gold: {
          50: '#FFF9E6', 100: '#FFEEB3', 200: '#FFD966', 300: '#FFC933',
          400: '#F5B800', 500: '#D4A017', 600: '#B8860B', 700: '#8B6914',
          800: '#5C4510', 900: '#2E220A',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem', xl: '1rem', '2xl': '1.25rem', '3xl': '1.5rem', '4xl': '2rem',
      },
      boxShadow: {
        'green-sm': '0 2px 8px rgba(34, 168, 41, 0.2)',
        'green-md': '0 4px 20px rgba(34, 168, 41, 0.3)',
        'green-lg': '0 8px 32px rgba(34, 168, 41, 0.4)',
        'green-glow': '0 0 30px rgba(34, 168, 41, 0.5)',
        'gold-glow': '0 0 24px rgba(212, 160, 23, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.6)',
        'modal': '0 25px 60px rgba(0, 0, 0, 0.8)',
        'drawer': '-20px 0 60px rgba(0, 0, 0, 0.6)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(34, 168, 41, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(34, 168, 41, 0)' },
        },
        'toast-progress': {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        'toast-progress': 'toast-progress 4s linear forwards',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0A0D0A 0%, #0D1A0D 50%, #0A0D0A 100%)',
        'hero-spotlight': 'radial-gradient(ellipse at 60% 50%, rgba(34,168,41,0.08) 0%, transparent 70%)',
        'gold-gradient': 'linear-gradient(135deg, #B8860B 0%, #D4A017 50%, #F5B800 100%)',
        'green-gradient': 'linear-gradient(135deg, #116616 0%, #22A829 50%, #38C424 100%)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
}

export default config
```

---

## 9. CSS Custom Properties (`globals.css`)

```css
@layer base {
  :root {
    --background: 132 14% 6%;
    --foreground: 132 8% 95%;
    --card: 144 13% 9%;
    --card-foreground: 132 8% 95%;
    --popover: 144 18% 14%;
    --popover-foreground: 132 8% 95%;
    --primary: 125 66% 40%;
    --primary-foreground: 132 14% 6%;
    --secondary: 140 14% 12%;
    --secondary-foreground: 132 15% 77%;
    --muted: 140 14% 12%;
    --muted-foreground: 132 14% 48%;
    --accent: 42 76% 47%;
    --accent-foreground: 132 14% 6%;
    --destructive: 0 70% 56%;
    --destructive-foreground: 132 8% 95%;
    --border: 125 33% 18%;
    --input: 125 33% 18%;
    --ring: 125 66% 40%;
    --radius: 0.75rem;
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-[#0A0D0A] text-[#F0F5F0] font-sans antialiased; }
  ::selection { background-color: rgba(34, 168, 41, 0.3); color: #F0F5F0; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0A0D0A; }
  ::-webkit-scrollbar-thumb { background: #1F3D1F; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #22A829; }
}
```

---

## 10. Design Principles

1. **Dark-first**: Every surface defaults to the dark palette.
2. **Green as action**: `#22A829` exclusively signals interactive and positive states.
3. **Gold as premium**: `#D4A017` signals price, value, exclusive content.
4. **Typography contrast**: Playfair Display = luxury; Inter = functional clarity.
5. **Motion with purpose**: Every animation communicates state change or guides attention.
6. **Accessibility**: Minimum 4.5:1 contrast ratio. WCAG AA compliant.
7. **Mobile-first**: Grids collapse gracefully; filter sidebar becomes bottom sheet on mobile.
8. **Consistent radius**: `rounded-xl` default, `rounded-2xl` for cards, `rounded-full` for pills.
9. **Age compliance**: Age gate modal mandatory on first visit. Login/register include DOB validation.
