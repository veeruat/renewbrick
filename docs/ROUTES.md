# Route inventory

| Route | Render | Indexed (prod) | Purpose |
| --- | --- | --- | --- |
| `/` | Static | Yes | Homepage narrative: hero, services index, process, scenarios, principles, locations, FAQ, enquiry |
| `/about` | Static | Yes | Business model, who does what, process, geographic focus |
| `/services/renovation-civil-works` | Static | Yes | Work-package schedule R1–R7, deliverables, process, dependencies |
| `/services/property-maintenance` | Static | Yes | Visit cycle, inspection sheet, charges separation |
| `/services/rental-ready` | Static | Yes | Turnover timeline, condition reports, exclusions |
| `/services/property-management` | Static | Yes | **Planned** service: status, responsibilities matrix, register interest |
| `/locations/hyderabad` | Static (SSG) | Yes | City page from `locations.ts` |
| `/locations/warangal` | Static (SSG) | Yes | City page from `locations.ts` |
| `/contact` | Static (form hydrates) | Yes | Enquiry form; `?service=<slug>` preselects the service |
| `/contact/received` | Static | No | Confirmation for the no-JavaScript form fallback |
| `/faq` | Static | Yes | All FAQs by topic |
| `/privacy-policy` | Static | No while draft | Draft privacy policy |
| `/terms` | Static | No while draft | Draft website terms |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/icon.svg` | Static | n/a | Metadata routes |
| `POST /api/enquiries` | Dynamic | n/a | Enquiry submission (JSON or form-encoded) |
| anything else | n/a | No | 404 page with real 404 status |

`/projects` is intentionally absent until approved project content exists.
