---
name: Serene Utility
colors:
  surface: "#f8f9fc"
  surface-dim: "#d9dadd"
  surface-bright: "#f8f9fc"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f2f3f6"
  surface-container: "#edeef1"
  surface-container-high: "#e7e8eb"
  surface-container-highest: "#e1e2e5"
  on-surface: "#191c1e"
  on-surface-variant: "#464652"
  inverse-surface: "#2e3133"
  inverse-on-surface: "#f0f1f4"
  outline: "#767683"
  outline-variant: "#c7c5d3"
  surface-tint: "#4f55ae"
  primary: "#4f55ae"
  on-primary: "#ffffff"
  primary-container: "#8e94f2"
  on-primary-container: "#232781"
  inverse-primary: "#bfc2ff"
  secondary: "#366758"
  on-secondary: "#ffffff"
  secondary-container: "#b6ebd8"
  on-secondary-container: "#3a6c5d"
  tertiary: "#745945"
  on-tertiary: "#ffffff"
  tertiary-container: "#b69680"
  on-tertiary-container: "#452f1e"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#e0e0ff"
  primary-fixed-dim: "#bfc2ff"
  on-primary-fixed: "#02026b"
  on-primary-fixed-variant: "#373c95"
  secondary-fixed: "#b9eedb"
  secondary-fixed-dim: "#9dd1bf"
  on-secondary-fixed: "#002018"
  on-secondary-fixed-variant: "#1c4f41"
  tertiary-fixed: "#ffdcc4"
  tertiary-fixed-dim: "#e3c0a8"
  on-tertiary-fixed: "#2a1708"
  on-tertiary-fixed-variant: "#5a422f"
  background: "#f8f9fc"
  on-background: "#191c1e"
  surface-variant: "#e1e2e5"
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: "600"
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: "500"
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: "600"
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max-width: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

This design system is built on the principles of **Soft Minimalism** and **Modern Professionalism**. It is specifically engineered for high-utility environments where users spend extended periods—such as productivity tools, health dashboards, or financial management suites. The brand personality is calm, empathetic, and unobtrusive, aiming to reduce cognitive load through a restrained visual language.

The aesthetic prioritizes clarity and breathing room. By utilizing a "low-vibration" color palette and generous whitespace, the UI recedes into the background, allowing the user's data and tasks to take center stage. The emotional response should be one of quiet confidence and effortless focus.

## Colors

The palette is anchored in muted, low-saturation pastel tones that provide a "wash" of color without overwhelming the senses.

- **Primary (Lavender):** Used for primary actions, active states, and brand moments. It offers enough contrast against light backgrounds to remain accessible while maintaining a soft edge.
- **Secondary (Mint):** Reserved for success states, growth indicators, or secondary supporting elements.
- **Tertiary (Peach):** Used sparingly for highlighting specific data points or gentle warnings that do not require the urgency of red.
- **Backgrounds:** Surfaces should utilize the neutral tint (`#F8F9FC`) or pure white to ensure the "airy" feel of the system.
- **Typography:** To ensure high readability, text uses a deep, desaturated charcoal (`#2D3142`) rather than pure black, maintaining a professional look that is easier on the eyes during long sessions.

## Typography

The design system utilizes **Inter** exclusively to maintain a systematic and utilitarian feel. The type hierarchy is defined by subtle weight shifts rather than aggressive scale changes.

For headlines, use a slight negative letter spacing to create a more "locked-in" professional appearance. Body text maintains standard tracking to ensure maximum legibility. Labels and captions should use the SemiBold weight (600) and increased letter spacing to distinguish them from body content at small sizes.

## Layout & Spacing

The design system follows a strict **8px grid** to ensure consistency across all components. The layout philosophy is a **Fixed-Fluid Hybrid**:

- On desktop, the main content is centered within a 1280px container.
- On mobile and tablet, the layout transitions to a fluid grid with 16px lateral margins.

Spacing should be "generous by default." Use 24px (3 units) for standard gutters and 48px (6 units) for section vertical spacing. This creates the "calming" effect requested by preventing the interface from feeling cramped or cluttered.

## Elevation & Depth

To maintain the soft pastel aesthetic, traditional heavy shadows are avoided. Instead, this design system uses **Tonal Layers** and **Ambient Depth**:

1.  **Level 0 (Base):** The neutral background color.
2.  **Level 1 (Cards/Containers):** Pure white surfaces with a subtle 1px border in a slightly darker neutral tint or a very soft, high-spread shadow (15% opacity of the primary color).
3.  **Level 2 (Modals/Popovers):** Elevated surfaces that use a "Pale Sky Blue" backdrop blur (glassmorphism effect) to maintain a sense of context and depth without being opaque.

Borders should be used as the primary method of separation, keeping them at 1px width with low-contrast colors to sustain the "soft" requirement.

## Shapes

The shape language is consistently **Rounded (8px)**. This radius is applied to all primary UI elements:

- **Buttons and Inputs:** 8px corner radius.
- **Cards and Modals:** 16px (rounded-lg) to create a clear hierarchy between small elements and large containers.
- **Chips:** Should use a fully pill-shaped radius (rounded-full) to distinguish them as interactive metadata tags.

The 8px radius provides a friendly, approachable feel while remaining structured enough for professional and data-heavy applications.

## Components

### Buttons

Primary buttons use the Lavender base with white text. Secondary buttons use a transparent background with a 1px Lavender border. Ghost buttons are reserved for tertiary actions and use the Primary color for text only.

### Input Fields

Inputs feature a white background and a subtle neutral-gray border. On focus, the border transitions to a soft Primary Lavender with a 3px outer glow (halo) of the same color at 20% opacity.

### Cards

Cards are the primary container. They should be white, with an 8px radius and a soft 1px border. Avoid heavy shadows; instead, use a slight vertical offset (2px) to suggest elevation.

### Chips & Badges

Use the Mint and Peach tones for chips. These should be low-saturation backgrounds with text that is 20-30% darker than the background color to ensure accessibility without breaking the pastel theme.

### Selection Controls

Checkboxes and radio buttons should use the Primary color for the "checked" state. Ensure the hit area is a minimum of 44x44px for touch accessibility, even if the visual element is smaller.
