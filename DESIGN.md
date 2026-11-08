---
name: My Frames of Earth
description: A naturalist's field sheet for wildlife photography from Costa Rica.
colors:
  paper: "#fcfcfa"
  card: "#ffffff"
  ink: "#16170f"
  muted: "#585c51"
  soft: "#6f7266"
  line: "#dedcd2"
  line-strong: "#b8b6a8"
  accent: "#1c5c43"
  accent-soft: "#e9efe9"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.9rem, 8.6vw, 6rem)"
    fontWeight: 500
    lineHeight: 0.93
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque, Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.8rem, 3.6vw, 2.6rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Bricolage Grotesque, Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.3rem, 1.8vw, 1.55rem)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.018em"
  body:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0em"
  label:
    fontFamily: "Spline Sans Mono, SFMono-Regular, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.1em"
rounded:
  sm: "2px"
  md: "3px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  gutter: "clamp(1.25rem, 2.6vw, 2.25rem)"
  page: "clamp(1.25rem, 4.6vw, 4.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
  chip-default:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "7px 11px"
  chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "7px 11px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    size: "38px"
  plate:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "15px 15px 18px"
  search-field:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "clamp(14px, 2vw, 20px) 0 11px"
---

# Design System: My Frames of Earth

## Overview

**Creative North Star: "The Living Field Sheet"**

My Frames of Earth is a naturalist's field sheet, not a photo gallery. Photographs are mounted as numbered plates on a warm paper ground; the interface behaves like the ruled margin of a specimen ledger. The mood is quiet, exact, and tactile: ink-black type, hairline rules, small monospaced data labels, and one herbarium green used sparingly.

The system is image-led but never full-bleed. Every photograph sits inside a white card with a visible mount margin, so the frame reads as an object that was handled, labelled, and filed. Interface chrome stays deliberately small and flat; the photograph, its common name, and its camera data carry the page.

Density is low at the top of the page and higher in the collection. Motion is restrained: plates fade and rise into place, images drift a fraction on hover, and nothing bounces or glows.

**Key Characteristics:**

- Paper-white ground, pure-white plates, ink-black type.
- Hairline rules and thin borders instead of shadows or blocks.
- Bricolage Grotesque display type against Archivo text and Spline Sans Mono data.
- One herbarium-green accent, used on selected states, category labels, links, and focus.
- Bilingual structure: every plate, filter, dialog, and empty state has English and Spanish parity.
- Metadata is treated as content: plate number, family, place, EXIF, field note, and credit are all first-class.

## Colors

The palette is a paper-and-ink system with a single green botanical accent. It should feel sun-faded rather than screen-bright.

### Primary

- **Herbarium Green** (#1c5c43): selected chips, category labels, field-note headings, inline links, focus rings, and the hover state of the primary button. It marks living things and active states without becoming a brand wash.

### Neutral

- **Warm Paper** (#fcfcfa): the page ground behind every section and dialog. It is warmer than white without reading as beige.
- **Specimen White** (#ffffff): only the plate and viewer figure surfaces. The contrast between paper and card is the mount.
- **Ink Black** (#16170f): headlines, body copy, plate EXIF values, and the filled primary button.
- **Field Gray** (#585c51): secondary copy, metadata, and navigation.
- **Label Gray** (#6f7266): the smallest functional labels, including EXIF keys and inline taxonomy.
- **Hairline** (#dedcd2): all dividers, plate borders, and field boundaries.
- **Strong Hairline** (#b8b6a8): hover borders and the scrollbar thumb.
- **Pressed Herbarium** (#e9efe9): reserved for subtle green-tinted surfaces and selection support.

### Named Rules

**The Green Rarity Rule.** Herbarium green appears on no more than roughly a tenth of any viewport. Its rarity is what makes a selected filter or a Latin name feel alive.

**The No Color Coding Rule.** Categories, families, and places never receive their own colors. Shape is communicated by position and label, not by a rainbow of chips.

## Typography

**Display Font:** Bricolage Grotesque (with Archivo, Helvetica Neue, Arial)
**Body Font:** Archivo (with Helvetica Neue, Arial)
**Label/Mono Font:** Spline Sans Mono (with SFMono-Regular, Consolas)

**Character:** Bricolage gives the field sheet its editorial voice: slightly odd, compact, and confident at large sizes. Archivo keeps long bilingual copy plain and readable. Spline Sans Mono turns camera data into specimen labels.

### Hierarchy

- **Display** (500, clamp(2.9rem, 8.6vw, 6rem), 0.93): the hero statement only. Tight tracking and near-solid leading make it read as a masthead, not a marketing headline.
- **Headline** (400, clamp(1.8rem, 3.6vw, 2.6rem), 1.05): section openings such as About the collection and the empty state.
- **Title** (500, clamp(1.3rem, 1.8vw, 1.55rem), 1.12): plate common names and dialog titles.
- **Body** (400, 1rem, 1.55): descriptions, field notes, and About copy; long passages cap around 56–58ch.
- **Label** (400, 11px, 0.1em, uppercase): plate numbers, categories, filter labels, EXIF keys, and footer meta. Functional text never drops below 11px; legal footer copy may reach 10px.

### Named Rules

**The Two-Voice Rule.** Display type is allowed to be expressive; every other word on the page is quiet. Never set body copy in all caps or mono.

**The Specimen Label Rule.** Camera data and taxonomy keys use mono, uppercase, and tracked-out 11px. Values use mono at 12px so the numbers stay aligned and legible.

**The Italic Taxonomist Rule.** Scientific names are always italic. Family names may sit inline after a common family label, but the Latin binomial never becomes decorative chrome.

## Layout

The page is a single editorial column with a 1440px maximum width. Page padding is `clamp(1.25rem, 4.6vw, 4.5rem)` and inter-element gaps use `clamp(1.25rem, 2.6vw, 2.25rem)`. The rhythm is generous at the masthead and hero, then tightens inside the collection.

The masthead is a three-column bar: mark and wordmark left, field line centered, navigation and language toggle right. The hero pairs a large display statement with a short guide paragraph and a right-aligned ledger of counts.

The collection begins with a full-width sticky index bar containing search and shape chips, followed by a non-sticky metadata row for family, place, order, count, and clear filters. Plates use a two-column CSS-columns masonry above 760px and a single column below it. The featured plate is wider than the grid and uses the photograph's natural aspect ratio, capped at 76vh desktop and 58vh mobile.

The About section is a two-column editorial spread (roughly 0.9 / 1.1) that collapses to one column at 900px. The viewer is a two-column dialog (1.45 / 0.75) that also collapses at 900px. Breakpoints are 1080px (hide the masthead field line), 900px (single-column hero foot, About, and viewer), 760px (single-column collection, compact navigation), and 520px (compact viewer bar and controls).

### Named Rules

**The Margin Rule.** Photographs never touch the page edge. A plate always keeps a visible mount margin between image and card edge.

**The Sticky Index Rule.** Search and shape chips remain available while browsing the collection, but they never trap the page: the bar ends with the collection, not the document.

## Elevation & Depth

The system is flat by default. There are no box shadows, no gradients, no glass, and no blurred surfaces. Depth comes from layering paper against pure white, from 1px rules, and from the dialog backdrop (`rgba(22, 23, 15, 0.5)`).

Plates lift only through state: their border darkens from `{colors.line}` to `{colors.line-strong}`, and their image scales to 1.014 over 900ms. The viewer and credits dialogs use the native dialog backdrop rather than a shadow.

### Named Rules

**The Flat-By-Default Rule.** If a surface needs to look raised, use a border, a paper/card contrast, or a dialog backdrop. Do not add a shadow.

## Shapes

The form language is rectangular and archival. Corners are barely rounded: 3px on plates and 2px on buttons, chips, inputs, and dialogs. Images inside plates are square-cornered at the mount (the card clips at 3px), and there are no circles, pills, or blobs.

Borders are always 1px. Filled shapes are rare; the ink chip and the primary button are the main exceptions. The plate's mount area uses padding rather than an inset frame, so the white card itself becomes the mat.

## Components

### Buttons

- **Shape:** barely rounded rectangle (2px).
- **Primary:** ink-black fill, paper text, mono uppercase 11px, 12px × 16px padding. Used for the empty-state "Show every plate" action and similar recovery actions.
- **Hover / Focus:** hover shifts the fill to herbarium green; keyboard focus uses a 2px green outline with 3px offset.
- **Ghost / Icon:** transparent background, hairline border, ink icon or text. Used for viewer previous/next and close controls.

### Chips

- **Style:** transparent background, hairline border, muted mono uppercase label, 2px radius, 7px × 11px padding.
- **State:** the active chip flips to ink fill and paper text. Category chips are filters, not decoration; there are no counts inside them.

### Cards / Containers

- **Corner Style:** 3px.
- **Background:** pure white on warm paper.
- **Shadow Strategy:** none; see Elevation & Depth.
- **Border:** 1px hairline, darkening to strong hairline on hover.
- **Internal Padding:** mount padding `clamp(10px, 1.3vw, 16px)` on top and sides, `15px 15px 18px` for the body.

### Inputs / Fields

- **Style:** borderless search input on a hairline-underlined row; selects are white with a 1px border, 2px radius, and a custom chevron.
- **Focus:** search row underline shifts to ink; selects and buttons use a 2px green focus ring.
- **Disabled / Error:** not used; empty results are handled by the empty state rather than field errors.

### Navigation

Mono uppercase 11px links in field gray, spaced with a 0.09em track. Hover shifts to ink with a thin underline. The language toggle is a two-cell segmented control with the active language inverted to ink. Below 760px the text navigation hides; the language toggle and the in-page collection remain.

### Plate

The signature component: a white mounted card with a natural-aspect image, a numbered top line, common name, italic scientific name, family and place facts, and a four-column EXIF strip. The whole card is one link; keyboard focus draws inside the card edge. Plates animate in with a 700ms rise and settle, staggered by 45ms up to 260ms.

### Viewer

A full-viewport native dialog on paper. The sticky top bar carries plate number, category, previous/next, and close. The image sits in a bordered white figure; the right column holds the name, taxonomy, place, date, field note, camera craft, gear, and a demo-photo credit. At 900px the image stacks above the record; at 520px the EXIF becomes two columns and the gear list becomes one.

## Do's and Don'ts

### Do:

- **Do** keep the page ground warm paper and reserve pure white for plates, figures, and dialogs.
- **Do** use hairline rules to separate fields, rows, and sections.
- **Do** set functional UI text at 11px or larger; keep legal footer copy at 10px only.
- **Do** keep English and Spanish strings in parity, including placeholder copy, empty states, and metadata.
- **Do** preserve each photograph's natural aspect ratio; let the plate height follow the image.
- **Do** use herbarium green sparingly for active states, links, categories, and focus.
- **Do** label camera data in mono uppercase and align values in a stable grid.

### Don't:

- **Don't** add shadows, gradients, glassmorphism, or glowing accents.
- **Don't** full-bleed photographs or let images touch the viewport edge.
- **Don't** use pills, circles, or radii above 3px for cards and controls.
- **Don't** introduce a second accent color or color-code species categories.
- **Don't** set body copy in mono or all caps.
- **Don't** invent scientific names, locations, or camera settings for real photographs; demo data must stay clearly labelled.
- **Don't** hide bilingual content behind a language-only route; both languages live in the same static page.
