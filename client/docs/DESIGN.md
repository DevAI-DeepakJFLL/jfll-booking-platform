---
version: alpha
name: JF Freight
description: A clean, modern logistics system with bright cyan accents, airy spacing, and polished corporate clarity.
colors:
  primary: "#23C2F2"
  secondary: "#908E92"
  tertiary: "#000000"
  neutral: "#C7C6C8"
  surface: "#FFFFFF"
  on-surface: "#000000"
  background: "#FFFFFF"
  text: "#908E92"
  error: "#D94B4B"
typography:
  headline-display:
    fontFamily: "Outfit"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: "48px"
    letterSpacing: "0px"
  headline-lg:
    fontFamily: "Outfit"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: "38px"
    letterSpacing: "0px"
  headline-md:
    fontFamily: "Times New Roman"
    fontSize: "25px"
    fontWeight: 600
    lineHeight: "30px"
    letterSpacing: "0px"
  headline-sm:
    fontFamily: "Mulish"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "24px"
    letterSpacing: "0px"
  body-lg:
    fontFamily: "Outfit"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0px"
  body-md:
    fontFamily: "Outfit"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "normal"
    letterSpacing: "0px"
  body-sm:
    fontFamily: "Outfit"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "0px"
  label-lg:
    fontFamily: "Mulish"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: "20px"
    letterSpacing: "0px"
  label-md:
    fontFamily: "Mulish"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "18px"
    letterSpacing: "0px"
  label-sm:
    fontFamily: "Mulish"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "16px"
    letterSpacing: "0px"
  nav-link:
    fontFamily: "Outfit"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "0px"
  button-text:
    fontFamily: "Mulish"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: "20px"
    letterSpacing: "0px"
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 16px
  xl: 30px
  full: 9999px
spacing:
  xs: 8px
  sm: 16px
  md: 30px
  lg: 50px
  xl: 84px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.tertiary}"
    typography: "{typography.button-text}"
    rounded: "{rounded.full}"
    padding: "10px 16px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "#18B2E2"
    textColor: "{colors.tertiary}"
    typography: "{typography.button-text}"
    rounded: "{rounded.full}"
    padding: "10px 16px"
    height: "50px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    typography: "{typography.button-text}"
    rounded: "{rounded.full}"
    padding: "10px 16px"
    height: "50px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.tertiary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: "40px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.tertiary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  top-nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.tertiary}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.none}"
    padding: "0px"
  service-tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

## Overview
JF Freight presents a polished, corporate logistics brand that feels dependable, efficient, and approachable. The interface is airy and restrained, using strong whitespace, rounded forms, and a bright cyan accent to keep the experience modern rather than heavy. The tone is professional with a slight friendliness, suited to enterprise shipping customers and visitors who need fast navigation and clear calls to action.

## Colors
- **Primary (#23C2F2):** A vivid sky-cyan used for the main action button and key brand highlights. It gives the site its most recognizable energy and keeps the logistics identity fresh and digital.
- **Secondary (#908E92):** A muted warm gray used for body copy, navigation secondary actions, and low-emphasis interface text. It softens the experience and avoids harsh contrast in non-critical areas.
- **Tertiary (#000000):** Pure black used for high-contrast text and button labels. It anchors the brand with a strong, direct corporate feel.
- **Neutral (#C7C6C8):** A light gray border and divider tone used for card outlines and subtle separation. It supports the clean, minimal structure without introducing heavy visual noise.
- **Surface (#FFFFFF):** The primary background color for pages, cards, and controls. White is dominant, reinforcing openness and readability.
- **Background (#FFFFFF):** Reinforces the site-wide light mode foundation and keeps large sections visually unobtrusive.
- **Text (#908E92):** The default copy color appears in a softer gray to reduce visual intensity while maintaining legibility.
- **Error (#D94B4B):** A reserved alert red for validation and destructive states; it is not prominent in the screenshot but should remain restrained if used.

## Typography
The system blends three families: Outfit for general UI and headlines, Mulish for buttons and compact labels, and Times New Roman for select editorial-feeling headings and secondary link treatments. Headlines are bold and highly legible, with `headline-display` and `headline-lg` providing modern sans-serif emphasis, while `headline-md` introduces a more traditional serif accent that fits the corporate tone. Body text stays at 16px with comfortable rhythm, and labels/buttons use stronger weights for clear scannability.

Navigation and utility text are clean and understated, with no visible uppercase treatment or exaggerated letter spacing. The overall typographic style favors straightforward hierarchy over decorative styling, which suits a service-oriented logistics experience.

## Layout & Spacing
The layout is built on a wide, full-bleed hero with centered content and a strong top navigation bar. Sections feel spacious and horizontally balanced, with the main container spanning most of the viewport while keeping content aligned to a central visual axis. Spacing follows a simple stepped rhythm using `xs`, `sm`, `md`, `lg`, and `xl`, which works well for large hero compositions and evenly padded cards.

Cards and service tiles use generous internal padding, especially around grouped icon-and-label content. The most visible pattern is a large hero overlay with a floating card strip, creating separation between background imagery and functional navigation without overcomplicating the grid.

## Elevation & Depth
The system is intentionally flat and clean, relying more on layering and contrast than on heavy shadows. Depth is created through soft borders, tonal overlays, and the use of white cards placed above darker or image-based sections. Shadow usage is minimal to none, which keeps the interface crisp and avoids a bulky enterprise look.

The hero area uses a dark gradient overlay to preserve legibility over imagery, and the service strip appears as a raised white panel through placement and border contrast rather than pronounced shadow. This keeps the visual language calm and controlled.

## Shapes
The shape language is rounded and friendly, with a strong preference for pill buttons and soft card corners. Large radii such as `rounded.full` on calls to action and `rounded.xl` on cards make the interface feel modern and approachable. Smaller controls remain subtly rounded, preserving consistency without becoming overly playful.

Overall, the geometry is smooth and commercial rather than sharp or technical. This matches the logistics brand’s goal of appearing reliable and easy to use.

## Components
Buttons are the clearest signature element in the system. `button-primary` uses the cyan `primary` color, black text, a full pill radius, and a 50px height for a confident CTA. `button-secondary` is a transparent ghost style with `secondary` text and border, suitable for lower-emphasis actions. `button-link` should remain minimal, underlined, and inline for informational navigation. Keep button padding compact and balanced; the experience favors clarity over oversized touch targets.

Cards use a white surface, a light neutral border, and a large rounded corner radius. `card` should feel clean and contained, with 40px padding for content blocks that need separation from the page background. Avoid heavy shadows; the border is the primary structural device.

Inputs should follow the same restrained logic as cards: white background, subtle border, and modest rounding. They should prioritize readability and fit comfortably alongside text-heavy forms without drawing too much attention. When possible, align input padding with the card rhythm so forms feel integrated with the rest of the layout.

Chips and service tiles should be quiet and utility-focused. Use light surfaces, muted text, and compact spacing for icon-label combinations. In the hero service strip, iconography should remain thin and monochrome so the cyan brand color continues to own the primary action hierarchy.

Top navigation links should stay simple and text-forward, with no fill or border treatment. The header works best when it remains unobtrusive and lets the logo and CTA dominate attention. Maintain consistent vertical alignment and generous horizontal gaps between links.

## Do's and Don'ts
- Do keep primary actions pill-shaped, cyan, and visually prominent.
- Do use generous whitespace and centered alignment for hero messaging.
- Do prefer flat surfaces with subtle borders over heavy shadow stacks.
- Do keep body copy muted and readable, reserving black for emphasis and CTA text.
- Don't introduce sharp corners on key buttons or cards.
- Don't overload the interface with multiple bright accent colors.
- Don't use dense typographic tracking or all-caps styling unless required by a specific utility label.
- Don't make secondary content compete with the main shipment booking CTA.