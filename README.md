# My Frames of Earth

A photo portfolio for wildlife and natural-history photography, built with plain HTML, CSS and JavaScript. No build step, no dependencies, ready for GitHub Pages.

**Live structure**

```
index.html
assets/
  css/styles.css
  js/photos.js     ← the photo index you edit
  js/i18n.js       ← interface strings (English / Spanish)
  js/app.js
  photos/          ← your image files
  fonts/
README.md
CREDITS.md
DESIGN.md
.nojekyll
```

## Preview locally

Because everything is static, you can open `index.html` directly. For the closest match to GitHub Pages, run a small local server from this folder:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000/>.

## Publish on GitHub Pages

1. Push the repository to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Save. The site appears at `https://<username>.github.io/<repository>/`.

The site uses relative paths, so it works from a project subfolder as well as a custom domain. `.nojekyll` stops GitHub from processing the folder with Jekyll.

## Add a photograph

1. Export the image as JPEG, ideally 1600–2000 px on the long edge and under ~1.5 MB. If you are on macOS you can resize from Terminal:

   ```bash
   sips -s format jpeg -s formatOptions 82 -Z 1800 original.jpg --out assets/photos/my-photo.jpg
   ```

2. Put the file in `assets/photos/`.
3. Open `assets/js/photos.js`, copy an existing entry, and paste it at the position you want (the first entry is the cover plate). Edit the fields:

```js
{
  id: "my-photo",                     // unique, no spaces
  plate: "016",                       // label shown on the card
  src: "assets/photos/my-photo.jpg",
  width: 1800,                        // real pixel width
  height: 1200,                       // real pixel height
  category: "birds",                  // birds | mammals | herps | insects | plants | landscapes
  name: { en: "Common name", es: "Nombre común" },
  sci: "Scientific name",
  family: { sci: "Family name", en: "Family in English", es: "Familia en español" },
  location: { en: "Place, Country", es: "Lugar, País" },
  date: "2025-06-14",                 // YYYY-MM-DD
  gear: { camera: "Camera body", lens: "Lens" },
  exif: { shutter: "1/500 s", aperture: "f/5.6", iso: "800", focal: "400 mm" },
  alt: { en: "Describe the image for screen readers.", es: "Describe la imagen." },
  note: { en: "A short field note.", es: "Una nota de campo breve." },
  tags: ["bird", "ave", "place"],     // extra search words
  credit: { author: "Photographer", license: "All rights reserved", url: "" }
}
```

That is all. Search, filters, the cover plate, the collection ledger and the language toggle update automatically.

Only one entry should have `featured: true`; remove it from copied entries unless you are replacing the cover plate. For a landscape or other non-species image, set `sci: ""` and `family: { sci: "—", en: "Landscape", es: "Paisaje" }` so the scientific and family rows are omitted.

### Categories

Use one of: `birds`, `mammals`, `herps` (reptiles and amphibians), `insects`, `plants`, `landscapes`. Their labels live in `assets/js/i18n.js` under `categoryNames` and `categorySingular`.

### Removing the demo content

The starter photograph is from Wikimedia Commons and is credited in `CREDITS.md` and in the site's “Photo credits” dialog. Before publishing your own work:

1. Replace the file in `assets/photos/`.
2. Replace the entry in `assets/js/photos.js`.
3. Update `credit` on the entry (use `"All rights reserved"` and leave `url` empty for your own photographs).
4. Remove or rewrite the demo note in the footer and the credits dialog in `index.html` / `assets/js/i18n.js`.
5. Delete the Wikimedia entry from `CREDITS.md`.

## Languages

English is the default. The EN / ES switch in the masthead changes every interface string and every photo record, updates `<html lang>`, and remembers the choice. A shareable link can carry the language, filters and search:

```
/?lang=es&cat=birds&q=quetzal
```

Photo text is stored per entry (`name.en` / `name.es`, `note.en` / `note.es`, etc.). Interface strings are in `assets/js/i18n.js`. Search understands both languages at once, with or without accents, plus scientific names, families, places and shape words such as “bird”, “ave”, “insect” or “mammal”.

## Notes on the demo data

- Photographs: Wikimedia Commons, licence listed in `CREDITS.md`.
- Camera settings, dates and locations are plausible demo values, not metadata from the original file. Replace them with your own.
- Species facts are standard natural-history information; verify local names and records before publishing.

## Accessibility and performance

- Keyboard: `/` focuses search, `Esc` clears it, `←` / `→` move between plates in the viewer, and every control has a visible focus ring.
- The viewer is a native `<dialog>`, and reduced-motion preferences are respected.
- Fonts and images are self-hosted; there are no third-party requests, trackers or server calls.
- Images are lazy-loaded except the cover plate.

## Licence

Site code: use it freely for your own portfolio. Photographs retain their own licences (see `CREDITS.md`).
