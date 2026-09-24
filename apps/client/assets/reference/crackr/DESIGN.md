---
name: Crackr
colors:
  surface: '#310004'
  surface-dim: '#310004'
  surface-bright: '#72131c'
  surface-container-lowest: '#270003'
  surface-container-low: '#410007'
  surface-container: '#480009'
  surface-container-high: '#5c010e'
  surface-container-highest: '#6b0e18'
  on-surface: '#ffdad8'
  on-surface-variant: '#cdc6b7'
  inverse-surface: '#ffdad8'
  inverse-on-surface: '#650814'
  outline: '#969083'
  outline-variant: '#4b463b'
  surface-tint: '#d6c694'
  primary: '#ffffff'
  on-primary: '#39300b'
  primary-container: '#f3e2ae'
  on-primary-container: '#70643b'
  inverse-primary: '#6a5e35'
  secondary: '#f2bf4b'
  on-secondary: '#402d00'
  secondary-container: '#b68a15'
  on-secondary-container: '#372700'
  tertiary: '#ffffff'
  on-tertiary: '#4f2500'
  tertiary-container: '#ffdcc5'
  on-tertiary-container: '#9a510b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f3e2ae'
  primary-fixed-dim: '#d6c694'
  on-primary-fixed: '#231b00'
  on-primary-fixed-variant: '#514620'
  secondary-fixed: '#ffdf9f'
  secondary-fixed-dim: '#f2bf4b'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5c4300'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb782'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703800'
  background: '#310004'
  on-background: '#ffdad8'
  surface-variant: '#6b0e18'
typography:
  display-hero:
    fontFamily: Epilogue
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 60px
    letterSpacing: -0.04em
  display-hero-mobile:
    fontFamily: Epilogue
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Epilogue
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Epilogue
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Epilogue
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Lexend
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Lexend
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Lexend
    fontSize: 13px
    fontWeight: '300'
    lineHeight: 20px
    letterSpacing: 0.015em
  label-code:
    fontFamily: Lexend
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.14em
  label-counter:
    fontFamily: Epilogue
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system embodies high-craft architectural rigor, pairing sharp editorial display headers with hyper-accessible body copy tailored for intense problem-solving sessions. Built for high-stakes Indian competitive entrance prep (JEE Main & Advanced), the design rejects standard EdTech tropes—no playful gamified gradients, no bubbly mascots, and no floating pill containers.

Instead, the aesthetic merges **Swiss International Typographic Style** with **Editorial Neo-brutalism**:
- **Utilitarian & Uncompromising**: Sharp corners, visible hairline data grids, dense information layering, and monospaced diagnostic notation.
- **Cognitive Clarity**: Minimal cognitive overhead under timed, multi-hour mock examinations. High-contrast typography ensures readability across mathematical expressions, chemical equations, and complex physics diagrams.
- **Academic Seriousness**: Respects the maturity and technical focus of aspiring engineers through tactile wire-cut borders, architectural split-planes, and resolute, structural interfaces.

## Colors

The color palette is strictly engineered for dark-mode long-haul study blocks. The base canvas is `#FF7E7E` (Muted Neutral), grounding visual fatigue while maintaining stark contrast.

- **Canvas & Structural Fills**: `#FF7E7E` acts as the root backdrop. `#FFCB56` (Vibrant Yellow/Amber) provides structural zoning for split-pane toolbars, index rails, and question headers.
- **Accents & Quantitative Feedback**: `#FFEDB9` drives progression states, active time counters, calibration streaks, and XP numerals. `#FFA259` is reserved for focused inputs, selected MCQ option surfaces, and primary active CTAs.
- **Typography & Hairlines**: All primary text and structural 1px grid borders utilize raw high-contrast strokes, yielding immediate hierarchy without synthetic glow.
- **Functional Diagnostics**: Indicators use pure, unblurred accents: `#4e8c62` (Precision Green) for validated options and passing margins; `#a84242` (Critical Red) for incorrect responses, negative-marking warnings, and expired timeouts.

Avoid gradients, soft glow halos, and translucent layered overlays. Color application must remain flat, opaque, and strictly bounded by visible borders.

## Typography

The typographic engine uses **Epilogue** for display, indices, and numerical anchors, coupled with **Lexend** for extended body prose, math-heavy question stems, and functional labels.

- **Epilogue**: Brings architectural balance with tight geometric proportions. Used with negative tracking on numerical score displays, test timers, and subject section dividers (e.g., `01 / ROTATIONAL DYNAMICS`).
- **Lexend**: Engineered explicitly for hyper-legibility, visual pacing, and eye tracking. Essential for lengthy JEE problem statements involving sub-scripts, multi-clause premises, and dense technical notation.
- **Index & Meta Formatting**: Utility headers, question tags, and test statuses (`Q 14/30`, `CR—01`, `NEG: -1`) are always uppercase with extended letter spacing (`0.14em`), rendered via `label-code`.

## Layout & Spacing

Layouts adhere to an uncompromising, grid-dominated framework inspired by Swiss document layouts:
- **Canvas Division**: Split-panel viewports. The left workspace holds question stems and metadata; the right panel holds response inputs and navigation palettes.
- **12-Column Responsive Matrix**:
  - **Mobile (<768px)**: 4 columns, `margin: 1rem`, `gutter: 1rem`. Sticky bottom-dock test controls with fixed 1px top border.
  - **Tablet (768px–1024px)**: 8 columns, `margin: 1.5rem`, `gutter: 1rem`. Reflows to single-column stacked modules with persistent right-aligned floating HUD.
  - **Desktop (>1024px)**: 12 columns, `margin-desktop: 2.5rem`, `gutter-desktop: 1.5rem`. Split-screen locked layout with full-height scroll panels separated by a static vertical 1px border.
- **Border Integration**: Grids are visibly articulated. Cells, question modules, and data boxes touch edge-to-edge, sharing single 1px hairline rules without floating gaps.

## Elevation & Depth

No soft blurs, diffuse shadows, or faux-glass transparencies are permitted. Depth is established through hard architectural planes and raw mechanical offsets:

1. **Flat Structural Planes (Default Layer)**: Base canvas with internal cells defined by 1px hairline outlines.
2. **Hard Brutalist Offsets (Floating / Interactive Layer)**: High-priority cards, modal dialogue panels, and interactive controls project a solid, crisp offset shadow with zero blur radius (`blur: 0px`). Active press states translate the component down and right, completely flattening the shadow to zero.
3. **Monochrome Border Contrast**: Subordinate containers rely strictly on 1px borders with zero shadow.

## Shapes

Every component throughout the design system operates on a soft geometry (`border-radius: 0.25rem` base, with structural adjustments for containers).

- **Corners**: Slightly softened geometric corners.
- **Edges**: Crisp contouring with minimal radius to soften starkness while retaining industrial utility.
- **Dividers & Framing**: Hairline rules are exactly 1px solid vectors.

## Components

### Buttons
- **Primary Action**: Soft rect, background `#FFA259`, text `#FFEDB9`, font `Epilogue` (weight 700, uppercase). Border: 1px solid `#FFCB56`. Elevation: 4px 4px 0px `#FFCB56`. Active: translate(4px, 4px), shadow removed.
- **Secondary Action**: Background `#FF7E7E`, text `#FFEDB9`, border: 1px solid `#FFCB56`. Active: background `#FFCB56`.
- **Destructive / Error**: Background `#a84242`, text `#FF7E7E`, border: 1px solid `#FFCB56`.

### MCQ Option Cells
- Full-width structural block with 1px border (`#FFCB56`).
- Left-side indicator strip: 40px square index (`A`, `B`, `C`, `D`) in `Epilogue`, divided from text by a vertical 1px border.
- **Default State**: Background `#FF7E7E`, text `#FFEDB9`.
- **Selected State**: Background `#FFCB56`, left index inverted to `#FFEDB9` with text `#FF7E7E`.
- **Validated Correct**: Solid 6px `#4e8c62` left-edge boundary strip.
- **Validated Incorrect**: Solid 6px `#a84242` left-edge boundary strip.

### Inputs (Numerical & Direct Entry)
- Slight radius, 1px solid `#FFCB56` frame. Padding `space-sm` horizontal, `space-md` vertical.
- Focused state: Border transforms to 1px solid `#FFA259`, rendering an interior solid indicator caret.
- Monospaced numerical values using `Epilogue` (weight 600).

### Question Status Grid / Palette
- Dense matrix of cells (`36px x 36px`).
- Connected by shared 1px borders.
- State encoding:
  - *Unvisited*: `#FF7E7E` background, `#FFCB56` border.
  - *Answered*: Solid `#FFA259` background, `#FFEDB9` text.
  - *Marked for Review*: Solid `#FFEDB9` background, `#FF7E7E` text.
  - *Current Active*: 2px solid `#FFCB56` interior border.

### Badges, Timers & Diagnostic Tags
- Monospaced typography via `label-code`.
- Inline sharp rectangles with 1px hairline perimeter.
- Timers leverage `#FFEDB9` numeral accents with a blinking square block separator instead of soft icons.