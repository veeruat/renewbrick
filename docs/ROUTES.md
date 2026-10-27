# Route inventory

| Route | Render | Indexed (prod) | Purpose |
| --- | --- | --- | --- |
| `/` | Static | Yes | Homepage narrative: hero, services index, process, scenarios, principles, locations, FAQ, enquiry |
| `/about` | Static | Yes | Business model, who does what, process, geographic focus |
| `/services/renovation-civil-works` | Static | Yes | Work-package schedule R1–R7, deliverables, process, dependencies |
| `/services/property-maintenance` | Static | Yes | Visit cycle, inspection sheet, charges separation |
| `/services/rental-ready` | Static | Yes | Turnover timeline, condition reports, exclusions |
| `/services/property-management` | Static | Yes | **Planned** service: status, responsibilities matrix, register interest |
| `/locations/hyderabad` | Static (SSG) | Yes | City page from `locations.ts` (unknown cities are not exported, so they 404) |
| `/locations/warangal` | Static (SSG) | Yes | City page from `locations.ts` |
| `/contact` | Static | Yes | WhatsApp / phone / email options (shown when set), what to include in a message |
| `/faq` | Static | Yes | All FAQs by topic |
| `/privacy-policy` | Static | No while draft | Draft privacy policy |
| `/terms` | Static | No while draft | Draft website terms |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/icon.svg`, `/apple-icon.png` | Static | n/a | Metadata routes |
| anything else | n/a | No | `404.html`, served with a real 404 by the host / static server |

Everything is exported to `out/` at build time. There are no API routes.

`/projects` is intentionally absent until approved project content exists.
