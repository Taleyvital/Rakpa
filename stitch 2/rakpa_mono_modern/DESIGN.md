```markdown
# Design System Specification: Editorial Monochrome Mobility

## 1. Overview & Creative North Star

### The Creative North Star: "The Urban Curator"
This design system moves beyond the utility of a standard mobility app to create a high-fidelity, editorial experience. It is designed to feel like a premium digital monograph—authoritative, clean, and intentional. By stripping away the "noise" of traditional colorful UI, we focus on the raw geometry of the city. 

The aesthetic is driven by **Stark Editorialism**: using aggressive whitespace, ultra-fine lines, and bold typographic scales to create a sense of calm in the chaotic context of urban transit. We break the "template" look through tonal layering and intentional asymmetry, ensuring every screen feels curated rather than generated.

---

## 2. Colors & Surface Philosophy

The palette is strictly monochromatic, utilizing a scale of neutral greys to create depth without introducing hue-based distractions.

### Core Palette
- **Primary (Black):** `#000000` — Used for high-contrast CTAs, heavy headlines, and active states.
- **Surface (White):** `#FFFFFF` — The "base paper" of the experience.
- **Background:** `#F9F9F9` — Used for the outermost canvas to provide a soft contrast against pure white components.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections or separate content blocks. Boundary definition must be achieved through:
1. **Background Shifts:** Placing a `surface-container-low` component on a `surface` background.
2. **Generous Negative Space:** Using the spacing scale (specifically `8` to `12`) to allow the eye to perceive separation.

### Glass & Texture
To elevate the system from "flat" to "premium," floating elements (like the map search bar or FABs) should utilize **Glassmorphism**:
- **Backdrop Blur:** 20px–30px.
- **Opacity:** Surface colors at 80%–90%.
- **Subtle Gradient:** A 0.5px "inner glow" gradient on the top edge of dark elements (Black to `#3B3B3B`) to provide a tactile, machined-metal feel.

---

## 3. Typography: Editorial Authority

We use a modern sans-serif (Inter) to balance technical precision with readability. 

- **Display & Headlines:** Use **Bold** weights with tight letter-spacing (-2%). These are the anchors of the page, acting as visual landmarks.
- **Body Text:** Use **Regular** or **Light** weights. Leading (line height) should be generous (150% of font size) to maintain the "airy" editorial feel.
- **Labeling:** Small caps or slightly tracked-out labels (0.5px) should be used for secondary data like "KM PARCOURUS" to distinguish them from interactive text.

| Role | Weight | Size | Purpose |
| :--- | :--- | :--- | :--- |
| `display-lg` | Bold | 3.5rem | Hero statistics / Large numbers |
| `headline-lg`| Bold | 2.0rem | Main Page Titles |
| `title-md` | SemiBold | 1.125rem | Card Titles |
| `body-md` | Regular | 0.875rem | Standard Information |
| `label-sm` | Medium | 0.6875rem| Metadata & Captions |

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are replaced by **Ambient Occlusion** and **Tonal Stacking**.

- **The Layering Principle:** Depth is achieved by "stacking" surface tiers. Place a card (`surface-container-lowest`) on a section background (`surface-container-low`) to create a natural "lift."
- **Ambient Shadows:** For floating action buttons (FABs) or primary modals, use a "soft-smoke" shadow:
  - `Box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);`
  - The shadow must feel like a soft glow rather than a hard edge.
- **The "Ghost Border" Fallback:** If accessibility requires a container boundary, use the `outline-variant` token at **10% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons & Interaction
- **Primary:** Deep Black (`#000000`) with White text. Corner radius: `xl` (3rem) for a pill shape.
- **Secondary:** Tonal Grey (`#EEEEEE`) with Black text.
- **FAB (Floating Action Button):** High-contrast Black with a white fine-wireframe icon. Should always appear as a perfect circle with an ambient shadow.

### Cards & Lists
- **The Divider Ban:** Do not use horizontal lines between list items. Use vertical white space (`spacing-4`) or a background-color shift on the parent container.
- **Rounding:** All cards must use `md` (1.5rem) or `lg` (2rem) corner radii to evoke a modern, native iOS/Android feel.

### Inputs & Search
- **Search Bar:** High-radius `xl` with a `surface-container-lowest` (#FFFFFF) fill. 
- **Icons:** Use "Ultra-Fine" 1px stroke icons. Avoid filled icons unless they represent an active state (e.g., a selected navigation tab).

---

## 6. Do's and Don'ts

### Do:
- **Prioritize Breathing Room:** If a screen feels "busy," increase the padding to the next value in the spacing scale.
- **Use Tonal Hierarchy:** Make the most important information the darkest (on light mode) or the lightest (on dark mode).
- **Asymmetric Layouts:** Allow for statistics or images to be slightly offset to break the "grid" feel and create visual interest.

### Don't:
- **Never use 100% Black Borders:** This breaks the high-end editorial feel and makes the UI look like a wireframe.
- **Avoid Drop Shadows on everything:** Save shadows only for elements that "fly" over the content (FABs, Modals).
- **No Color:** Except for critical status indicators (e.g., a small green dot for "Fluid Traffic"), stay strictly within the monochrome scale.

---

## 7. Signature Logo Treatment
The stylized 'R' icon is the only element allowed to break the geometry. It should be treated as a "seal of quality"—placed with generous margin, often in a circular high-contrast container to act as a visual anchor for the user profile or splash screen.```