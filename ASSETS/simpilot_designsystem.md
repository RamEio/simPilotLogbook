# SIM PILOT LOGBOOK — DESIGN SYSTEM
Version: 3.0 KOREA | Updated: August 2026
Modes: Dark, Light

---

## COLORS

### Backgrounds
Dark Mode:
- bg-deep: #0B0F19 — page background
- bg-elevated: #111827 — elevated surfaces
- bg-card: #1E293B — cards, modals
- bg-hover: #232D42 — hover states
- bg-input: #0F172A — input fields

Light Mode:
- bg-pure: #FFFFFF — page background
- bg-canvas: #F8FAFC — canvas gray
- bg-elevated: #F1F5F9 — elevated surfaces
- bg-card: #E2E8F0 — cards, modals
- bg-hover: #CBD5E1 — hover states
- bg-input: #FFFFFF — input fields

### Primary Accent — Crimson Red
- red-900: #7F1D1D — pressed/active
- red-700: #B91C1C — hover
- red-600: #DC2626 — primary CTA (both modes)
- red-500: #EF4444 — error states
- red-400: #F87171 — error text, subtle warnings

Light Mode Red Scale (adjusted):
- red-lightest: #FEF2F2 — tinted background
- red-lighter: #FEE2E2 — hover tint
- red-600: #DC2626 — primary CTA (unchanged)
- red-dark: #B91C1C — hover
- red-darkest: #7F1D1D — pressed

### Secondary Accent — Amber
- amber-600: #D97706 — pressed / light mode labels
- amber-500: #F59E0B — highlights, kickers (dark mode)
- amber-400: #FBBF24 — hover

### Status Colors
Dark Mode:
- success: #10B981
- info: #3B82F6
- warning: #F59E0B
- error: #EF4444

Light Mode (higher contrast):
- success: #059669
- info: #2563EB
- warning: #D97706
- error: #DC2626

### Text Colors
Dark Mode:
- text-primary: #FFFFFF — headlines
- text-secondary: #94A3B8 — body text
- text-muted: #64748B — captions, metadata
- text-disabled: #475569 — disabled

Light Mode:
- text-primary: #0F172A — headlines
- text-secondary: #475569 — body text
- text-muted: #94A3B8 — captions, metadata
- text-disabled: #CBD5E1 — disabled

### Borders
Dark Mode:
- border-subtle: #1E293B
- border-default: #334155
- border-strong: #475569

Light Mode:
- border-subtle: #E2E8F0
- border-default: #CBD5E1
- border-strong: #94A3B8

---

## TYPOGRAPHY

Font: Inter (sans-serif)

| Token         | Size | Weight        | Line Height |
|---------------|------|---------------|-------------|
| display       | 36px | Bold 700      | 44px        |
| heading-1     | 28px | Bold 700      | 36px        |
| heading-2     | 24px | Semi Bold 600 | 32px        |
| heading-3     | 20px | Semi Bold 600 | 28px        |
| body-large    | 16px | Regular 400   | 24px        |
| body          | 14px | Regular 400   | 22px        |
| caption       | 12px | Regular 400   | 18px        |
| overline      | 11px | Medium 500    | 16px        |

Rules:
- Headlines: text-primary (white dark / dark light)
- Body: text-secondary
- Overline: UPPERCASE, letter-spacing 0.5px, text-muted or amber accent
- Section IDs [SEC-XX]: red-600, 12px Bold

---

## SPACING

| Token   | Value |
|---------|-------|
| sp-xxs  | 4px   |
| sp-xs   | 8px   |
| sp-sm   | 12px  |
| sp-md   | 16px  |
| sp-lg   | 20px  |
| sp-xl   | 24px  |
| sp-2xl  | 32px  |
| sp-3xl  | 48px  |
| sp-4xl  | 64px  |

---

## BORDER RADIUS

| Token          | Value  |
|----------------|--------|
| radius-none    | 0px    |
| radius-subtle  | 4px    |
| radius-default | 8px    |
| radius-rounded | 12px   |
| radius-large   | 16px   |
| radius-pill    | 9999px |

---

## COMPONENT STATES

### Primary Button (Crimson)
| State    | Background | Text    | Border          |
|----------|-----------|---------|-----------------|
| Default  | #DC2626   | #FFFFFF | none            |
| Hover    | #B91C1C   | #FFFFFF | none            |
| Active   | #7F1D1D   | #FFFFFF | none            |
| Focused  | #DC2626   | #FFFFFF | 2px #F87171     |
| Disabled | #475569   | #64748B | none            |

### Secondary Button
Dark Mode:
| State    | Background  | Text    | Border       |
|----------|------------|---------|--------------|
| Default  | transparent | #FFFFFF | 1px #334155  |
| Hover    | #1E293B    | #FFFFFF | 1px #475569  |
| Active   | #0F172A    | #FFFFFF | 1px #475569  |
| Focused  | transparent | #FFFFFF | 2px #3B82F6  |
| Disabled | transparent | #475569 | 1px #1E293B  |

Light Mode:
| State    | Background  | Text    | Border       |
|----------|------------|---------|--------------|
| Default  | transparent | #0F172A | 1px #CBD5E1  |
| Hover    | #F1F5F9    | #0F172A | 1px #94A3B8  |
| Active   | #E2E8F0    | #0F172A | 1px #94A3B8  |
| Focused  | transparent | #0F172A | 2px #2563EB  |
| Disabled | transparent | #CBD5E1 | 1px #E2E8F0  |

### Input Fields
Dark Mode:
| State    | Background | Text              | Border      |
|----------|-----------|-------------------|-------------|
| Empty    | #0F172A   | #475569 (placeholder) | 1px #334155 |
| Focused  | #0F172A   | #FFFFFF           | 1px #3B82F6 |
| Filled   | #0F172A   | #FFFFFF           | 1px #334155 |
| Error    | #0F172A   | #FFFFFF           | 1px #EF4444 |
| Disabled | #111827   | #475569           | 1px #1E293B |

Light Mode:
| State    | Background | Text              | Border      |
|----------|-----------|-------------------|-------------|
| Empty    | #FFFFFF   | #94A3B8 (placeholder) | 1px #CBD5E1 |
| Focused  | #FFFFFF   | #0F172A           | 1px #2563EB |
| Filled   | #FFFFFF   | #0F172A           | 1px #CBD5E1 |
| Error    | #FFFFFF   | #0F172A           | 1px #DC2626 |
| Disabled | #F1F5F9   | #CBD5E1           | 1px #E2E8F0 |

---

## ELEVATION

Dark Mode:
| Level | Shadow                        |
|-------|-------------------------------|
| 0     | none                          |
| 1     | 0 1px 3px rgba(0,0,0,0.3)    |
| 2     | 0 4px 12px rgba(0,0,0,0.4)   |
| 3     | 0 8px 24px rgba(0,0,0,0.5)   |

Light Mode:
| Level | Shadow                         |
|-------|--------------------------------|
| 0     | none                           |
| 1     | 0 1px 3px rgba(0,0,0,0.08)    |
| 2     | 0 4px 12px rgba(0,0,0,0.1)    |
| 3     | 0 8px 24px rgba(0,0,0,0.15)   |

Card: bg-card + 1px border-subtle + radius-default (8px) + sp-xl (24px) padding

---

## STATUS BADGES

| Type    | Color   | Dark BG opacity | Light BG opacity |
|---------|---------|-----------------|------------------|
| Success | #10B981 | 15%             | 10%              |
| Warning | #F59E0B | 15%             | 10%              |
| Error   | #EF4444 | 15%             | 10%              |
| Info    | #3B82F6 | 15%             | 10%              |
| Neutral | #64748B | 15%             | 10%              |

Progress bar: 8px height, radius-pill, track=bg-card, fill=red-600 or success

---

## LAYOUT GRID

Max width: 1280px | Columns: 12 | Gutter: 24px
Margin: 64px (desktop), 32px (tablet), 16px (mobile)

---

## ICONS

Style: Outlined 1.5px | Sizes: 16/20/24/32px | Color: inherits text color

---

## TOKEN NAMING

Pattern: category/role/variant
bg/deep, bg/card, text/primary, text/secondary, red/600, border/subtle, sp/md, radius/default, shadow/level-1

---

## DESIGN RULES

1. Dark-first: surfaces start from bg-deep
2. Red for action only: red-600 for CTAs, never passive
3. Amber for navigation: labels and kickers
4. No new colors: palette is closed
5. Uppercase overlines with letter-spacing for tactical register
6. Light mode mirrors dark structure, inverts value scale