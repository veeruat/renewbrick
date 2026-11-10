# RenewBrick website logo kit

Production palette standardized from the approved generated concept. SVG paths are traced from the latest concept and flattened to solid colours; they contain no linked images or font dependencies. This is a vector reconstruction, so minor edge differences from the concept may occur.

## Colours
| Use | HEX | RGB |
|---|---|---|
| Renew / architectural symbol / dark background | #102B4E | 16, 43, 78 |
| Brick / gold symbol panel | #BF8935 | 191, 137, 53 |
| Light background / reversed renew | #FFFFFF | 255, 255, 255 |
| Optional warm background | #F8F6F1 | 248, 246, 241 |

Gold is a logo accent. Use navy for small body text and for text on gold buttons.

## Files
- renewbrick-logo.svg: transparent main logo, navy renew + gold brick.
- renewbrick-logo-dark.svg: transparent reversed logo, white renew + gold brick; place on navy.
- renewbrick-logo-monochrome.svg: one-colour navy.
- renewbrick-icon.svg: transparent standalone symbol.
- Corresponding PNG files: transparent, 1800px wide logos and 512px wide icon.
- favicon.ico and favicon-32.png: square padded browser icons.
- apple-touch-icon.png: 180 x 180, white background.
- brand-colors.css: palette variables and responsive sizing.

## HTML
Copy the assets to your website public folder, for example public/brand/.

```html
<a href="/" aria-label="RenewBrick home">
  <img class="renewbrick-logo" src="/brand/renewbrick-logo.svg"
       alt="RenewBrick" width="240" height="49" />
</a>
<link rel="icon" href="/brand/favicon.ico" sizes="any" />
<link rel="icon" type="image/svg+xml" href="/brand/renewbrick-icon.svg" />
<link rel="apple-touch-icon" href="/brand/apple-touch-icon.png" />
```

## React
```jsx
<img src="/brand/renewbrick-logo.svg" alt="RenewBrick"
     style={{ width: 'clamp(160px, 20vw, 240px)', height: 'auto', display: 'block' }} />
```

## Usage
Use SVG on websites for sharp edges at every display density. Use PNG for apps that do not accept SVG. Suggested header width: 200–240px desktop and 160–180px mobile. Preserve the aspect ratio; do not stretch. Keep clear space around the logo of at least half the symbol width. Below 160px, prefer the standalone icon. Use the reversed logo on navy backgrounds. The lettering is outlined artwork rather than an editable font. For website text, a geometric sans serif such as your existing site font can complement it; no font file is included.
