# MedXchange Africa — website (relaunch draft)

A standalone, dependency-free build of the MedXchange Africa relaunch, ported from the
Claude Design handoff into clean HTML / CSS / JS. No framework, no build step — it runs
by opening it through any static server and deploys to Netlify/Vercel/GitHub Pages as-is.

## Run it locally

```bash
cd site
python3 -m http.server 8756
# open http://localhost:8756
```

(Opening `index.html` directly via `file://` also works, but a server is recommended so
fonts and relative links behave exactly like production.)

## Structure

```
site/
├── index.html              # Homepage one-pager (hero globe, program, rotations,
│                           #   impact + ECG, destinations, team, testimonials, CTA)
├── program.html            # The Program — what's included + transparent costs
├── clinical-rotations.html # Supervised rotations, hospitals, Free Clinic
├── impact.html             # Inclusion (School for the Deaf and Blind) + Free Clinic
├── destinations.html       # Cape Coast / Elmina / Kakum / the coast
├── about.html              # Who we are + the team
├── partners.html           # Partner hospitals & schools
├── apply.html              # Application form (client-side; email fallback)
├── contact.html            # Contact details + map placeholder
├── imprint.html            # Impressum (legal — needs operator details)
├── privacy.html            # Datenschutz / privacy (legal — needs operator details)
├── sitemap.xml · robots.txt
└── assets/
    ├── css/styles.css      # Base reset, responsiveness, mobile menu, form fields,
    │                       #   reduced-motion + a11y. Most styling is inline (faithful
    │                       #   to the mockup); this file holds the shared/responsive bits.
    ├── js/app.js           # The runtime: living-connection globe, scroll-reactive nav,
    │                       #   reveal-on-scroll, counters, magnetic buttons, marquee,
    │                       #   ECG pulse, mobile menu, style-hover shim, email obfuscation.
    ├── favicon.svg
    └── img/                # Curated, web-optimized photos (warm-graded, cropped to the
                            #   design's aspect ratios) selected from the 110 originals.
```

## Brand tokens (from the design system)

- **Palette** — Castle Green `#0E3A34`, Pine `#15514A`, Cape Clay/terracotta `#C0552F`,
  Harmattan Ochre `#D98A3D` / `#E5A155`, Adinkra Gold `#B8893A` / `#D2A85A`,
  Kente Ivory `#F6F1E7`, Warm White `#FBF8F1`, Volta Charcoal `#1C1A17`, Warm Stone `#6B6256`,
  Sand Line `#E2D8C5`; dark surfaces `#0B1F1C` / `#11302B`.
- **Type** — Fraunces (display serif), General Sans (body/UI). Loaded from Google Fonts /
  Fontshare. For production, self-hosting these is recommended (zero layout shift).
- **Motion** — all animation respects `prefers-reduced-motion`; the globe freezes to a
  static frame, reveals become instant, and the marquee/ECG pause.

## Content

Copy is rewritten from the operator's PDFs (Famulatur/PJ + Volunteering programme):
real programme details, the monthly **Free Clinic**, the **GF Brafoyaw** accommodation,
the team, partner institutions and **transparent costs** (no organization fees). Legacy
typos and exclusionary wording from the old site are removed.

## Known follow-ups (intentionally left for you)

1. **German version (DE).** This pass is English only (as agreed). The structure is
   i18n-ready; a `/de/` mirror with localized slugs + `hreflang` is the next step.
2. **Photography gaps.** There is no true **Kakum canopy-walk** photo (a rainforest shot
   stands in) and no clean individual portraits for **Leonora Cruickshank, Bola Lassisi
   and Maria Andrews** (shown as initial cards, not mislabeled faces). Dr Ainooson and the
   two coordinators have photos.
3. **Forms have no backend.** Apply/Contact validate client-side and show a success state;
   they do **not** send email yet. A visible mailto fallback to `medxchangegh@outlook.com`
   is provided. Wire to Formspree / a serverless function before launch.
4. **Legal pages** (`imprint.html`, `privacy.html`) carry `[To be completed by the operator]`
   placeholders for the responsible entity, jurisdiction and registration details.
5. **Testimonials** on the homepage are marked illustrative — replace with real, consented quotes.
6. **HTTPS** — deploy on a host with auto-renewing TLS (the legacy domain's certificate is expired).

## Deploy

Drag the `site/` folder onto Netlify, or `vercel deploy` it as a static site. `sitemap.xml`
and `robots.txt` are included; set the production domain and replace the canonical/OG host
(`https://medxchangeafrica.com/`) if it changes.
