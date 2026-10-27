/**
 * Detailed content for each service page. Each page has a different layout,
 * so each entry has its own shape. Shared fields (audiences, exclusions,
 * faqIds) appear on every service page.
 */

type Audience = { title: string; text: string };

type Common = {
  audiences: Audience[];
  problems: string[];
  deliverables: string[];
  dependencies: { title: string; text: string }[];
  faqIds: string[];
};

/* 01 — Renovation: a room-by-room "drawing schedule" of work packages. */
export const renovation: Common & {
  packages: { code: string; title: string; text: string; items: string[] }[];
} = {
  audiences: [
    { title: "Homeowners and apartment owners", text: "Updating a home that has aged, or fixing problems that keep coming back." },
    { title: "New owners", text: "Renovating after a purchase, before moving in." },
    { title: "Landlords and investors", text: "Improving a property between tenancies or before letting it." },
    { title: "Owners who live elsewhere", text: "Needing someone to inspect, coordinate and report on site." },
  ],
  problems: [
    "Damp walls, seepage and terrace or bathroom leaks",
    "Cracked, hollow or lifting tiles",
    "Kitchens and bathrooms that are worn or outdated",
    "Peeling paint and damaged plaster",
    "Ageing plumbing lines and electrical fittings",
    "A layout that no longer suits how the space is used",
  ],
  packages: [
    {
      code: "R1",
      title: "Civil repairs and approved modifications",
      text: "Repairs to plaster, masonry and concrete surfaces, crack treatment, and non-structural changes such as new partitions or openings in non-load-bearing walls.",
      items: ["Plaster and masonry repair", "Crack treatment", "Non-structural partitions and openings"],
    },
    {
      code: "R2",
      title: "Painting and surface restoration",
      text: "Surface preparation, putty and priming, interior and exterior painting, and protective coatings.",
      items: ["Interior painting", "Exterior painting", "Surface preparation and coatings"],
    },
    {
      code: "R3",
      title: "Flooring and tile work",
      text: "Removing and relaying tiles, replacing flooring, skirting and wall tiling.",
      items: ["Floor tiles and flooring", "Wall tiling and cladding", "Skirting and thresholds"],
    },
    {
      code: "R4",
      title: "Kitchens and bathrooms",
      text: "Renovation of wet areas and kitchens — layout, waterproofing, tiling, sanitaryware, counters and cabinetry — coordinated as one package.",
      items: ["Bathroom renovation", "Kitchen renovation", "Fixtures and fittings"],
    },
    {
      code: "R5",
      title: "Waterproofing",
      text: "Leak investigation first, then waterproofing for terraces, bathrooms, balconies, external walls and water tanks.",
      items: ["Terraces and roofs", "Bathrooms and balconies", "External walls and tanks"],
    },
    {
      code: "R6",
      title: "Plumbing and electrical coordination",
      text: "Replacement and repair of plumbing lines, fixtures, wiring and fittings, carried out by suitably qualified tradespeople.",
      items: ["Plumbing lines and fixtures", "Wiring, switches and fittings", "Coordination with other trades"],
    },
    {
      code: "R7",
      title: "Materials",
      text: "Help choosing materials and finishes, with procurement coordinated through suppliers — or reflected in the scope if you prefer to buy items yourself.",
      items: ["Material and finish selection", "Procurement coordination"],
    },
  ],
  deliverables: [
    "Inspection notes and photographs of existing conditions",
    "A written scope of work",
    "An estimate based on that scope, approved by you before work starts",
    "An indicative schedule",
    "Progress updates with photographs",
    "A quality check against the approved scope, with snags closed",
    "Handover with a record of the work completed",
  ],
  dependencies: [
    {
      title: "Structural work",
      text: "Changes affecting columns, beams, slabs or load-bearing walls need assessment by a qualified structural engineer and the approvals that apply to your building. They do not proceed without both.",
    },
    {
      title: "Building and association permissions",
      text: "Some buildings and associations require permission for renovation, or restrict working hours and material movement. We identify these at inspection.",
    },
    {
      title: "Hidden conditions",
      text: "Problems behind walls and under floors can only be confirmed once opened up. Any extra work is estimated and approved in writing before it proceeds.",
    },
    {
      title: "Schedule",
      text: "Timelines depend on scope, site conditions, material lead times and approvals. The schedule in your estimate is indicative.",
    },
  ],
  faqIds: ["estimate-basis", "additional-work", "structural", "materials", "who-does-work", "timelines", "warranty"],
};

/* 02 — Maintenance: an inspection log / visit cycle. */
export const maintenance: Common & {
  cycle: { step: string; title: string; text: string }[];
  checks: { area: string; items: string[] }[];
  feeNote: string;
} = {
  audiences: [
    { title: "Owner-occupiers", text: "Who want problems caught early rather than discovered in an emergency." },
    { title: "Landlords", text: "Keeping let properties in good condition between and during tenancies." },
    { title: "Owners living elsewhere", text: "Who need regular, documented checks on a property they cannot visit." },
    { title: "Owners of several properties", text: "Who want one arrangement and consistent reporting across them." },
  ],
  problems: [
    "Slow leaks and seepage that go unnoticed",
    "Electrical faults, tripping circuits and failing fittings",
    "Blocked drains and worn plumbing fixtures",
    "Vacant properties left unchecked for months",
    "No record of a property's condition over time",
  ],
  cycle: [
    { step: "A", title: "Agree the schedule", text: "We agree how often the property is inspected and what each visit covers." },
    { step: "B", title: "Inspect", text: "Each visit follows a checklist covering the areas you have agreed." },
    { step: "C", title: "Report", text: "You receive a condition report with photographs and recommended actions." },
    { step: "D", title: "Approve repairs", text: "Repairs are estimated. Nothing is carried out until you approve it." },
    { step: "E", title: "Coordinate and close", text: "Approved repairs are coordinated, checked and recorded in the next report." },
  ],
  checks: [
    { area: "Water", items: ["Visible leaks and damp", "Taps, valves and drains", "Tanks and terraces"] },
    { area: "Electrical", items: ["Switches and sockets", "Distribution board", "Lighting and fittings"] },
    { area: "Fabric", items: ["Walls, ceilings and paint", "Doors, windows and locks", "Floors and tiles"] },
    { area: "Vacant property", items: ["Signs of entry or damage", "Pests", "Ventilation and odour"] },
  ],
  feeNote:
    "Where a maintenance arrangement carries a fee, that fee covers the agreed inspections, reporting and coordination. Labour, materials and specialist charges for any repair are estimated and approved separately.",
  deliverables: [
    "An agreed inspection schedule",
    "A photo-based condition report after each visit",
    "Recommended actions, with urgent items highlighted",
    "Estimates for repairs, approved by you before work",
    "Coordination of approved repairs",
    "A record of work completed",
  ],
  dependencies: [
    { title: "Access", text: "Visits need access to the property — keys held by you, a tenant, a neighbour or a building manager." },
    { title: "Annual plans", text: "Annual maintenance arrangements are being finalised. Ask us about your property when you enquire." },
  ],
  faqIds: ["maintenance-arrangements", "maintenance-plan-fees", "vacant-property", "locations-remote-owner", "inspection-attendance"],
};

/* 03 — Rental-ready: a turnover timeline between occupants. */
export const rentalReady: Common & {
  turnover: { phase: string; title: string; items: string[] }[];
  report: string[];
} = {
  audiences: [
    { title: "Landlords", text: "Turning a property around between tenants." },
    { title: "Investors", text: "Preparing a newly purchased or long-vacant property for letting." },
    { title: "Owners living elsewhere", text: "Who need move-in and move-out handled on site." },
  ],
  problems: [
    "No clear record of condition when a tenant moves in or out",
    "Disputes about what was damaged and what was wear",
    "Repairs, painting and cleaning arranged separately and slowly",
    "A property standing empty longer than it needs to",
  ],
  turnover: [
    { phase: "Move-out", title: "Record", items: ["Room-by-room inspection", "Photographs of condition", "Meter readings noted"] },
    { phase: "Snag list", title: "List", items: ["Repairs needed", "Painting and touch-ups", "Deep cleaning", "Replacement items"] },
    { phase: "Preparation", title: "Fix", items: ["Approved repairs coordinated", "Painting", "Cleaning"] },
    { phase: "Move-in", title: "Check", items: ["Final inspection", "Move-in condition report", "Photographs for your records"] },
  ],
  report: ["Room-by-room condition", "Fixtures and fittings", "Plumbing and electrical", "Doors, windows and locks", "Photographs throughout"],
  deliverables: [
    "Move-out and move-in condition reports with photographs",
    "A snag list with recommended actions",
    "Estimates for repairs, painting and cleaning, approved by you",
    "Coordination of the approved work",
    "A final check before the next occupant",
  ],
  dependencies: [
    { title: "Not included", text: "Finding tenants, brokerage, rent collection and rental agreements are not part of this service." },
    { title: "Access and timing", text: "Inspections are arranged around the outgoing and incoming occupants." },
    { title: "Deposits", text: "Condition reports are a factual record. Decisions about deposits remain between you and your tenant." },
  ],
  faqIds: ["rental-reports", "rental-tenants", "additional-work", "locations-remote-owner"],
};

/* 04 — Management (planned): a responsibilities matrix. */
export const management: Common & {
  responsibilities: { task: string; owner: string; renewbrick: string }[];
} = {
  audiences: [
    { title: "Owners living elsewhere", text: "In another city or country, with a property in Hyderabad or Warangal." },
    { title: "Multi-unit owners", text: "Owning several flats or a building and wanting consistent oversight." },
    { title: "Apartment associations", text: "Looking for coordinated upkeep of common areas, where agreed." },
  ],
  problems: [
    "Repairs that need someone on site to arrange and supervise",
    "Several properties, several vendors, no consistent record",
    "Vacant periods without anyone checking the property",
  ],
  responsibilities: [
    { task: "Inspections and condition reports", owner: "Receives reports", renewbrick: "Inspects and reports" },
    { task: "Maintenance and vendor coordination", owner: "—", renewbrick: "Coordinates" },
    { task: "Repair decisions", owner: "Approves", renewbrick: "Estimates and recommends" },
    { task: "Vacant property care", owner: "—", renewbrick: "Checks and reports" },
    { task: "Owner communication", owner: "Single point of contact", renewbrick: "Regular updates" },
  ],
  deliverables: [
    "Scheduled inspections and condition reports",
    "Coordination of maintenance and specialist vendors",
    "Repair estimates for your approval",
    "Regular owner updates",
  ],
  dependencies: [
    { title: "Availability", text: "This service is planned and not yet accepting new arrangements. Registering interest does not create a commitment on either side." },
    { title: "Tenancy matters", text: "Tenant placement, rent collection and rental agreements are not part of the planned scope." },
  ],
  faqIds: ["maintenance-arrangements", "vacant-property", "rental-tenants", "locations-remote-owner"],
};
