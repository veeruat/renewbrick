/**
 * Renovation job pages (/services/<slug>): the specific jobs people search for,
 * each expanding a work package from the Renovation & Civil Works page
 * (see `renovation.packages` in service-pages.ts). They describe the same
 * scope in more detail and are covered by that service's `confirmed` flag.
 *
 * Same rules as everywhere else: no prices, durations, brands, warranties or
 * results that the owner hasn't confirmed. FAQs answer how the work is
 * approached, never policy.
 */

export type JobSlug = "bathroom-renovation" | "kitchen-renovation" | "waterproofing-leak-repair" | "house-painting" | "flooring-tiling";

export type Job = {
  slug: JobSlug;
  /** Package code on the renovation page this job expands. */
  packageCode: string;
  name: string;
  /** Lower-case phrase used in running text and link anchors, e.g. "bathroom renovation". */
  phrase: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  intro: string;
  /** Signs a property needs this work. */
  signs: string[];
  /** What the work can include. */
  scope: { title: string; text: string }[];
  /** How RenewBrick approaches the job: principles specific to this work. */
  approach: { title: string; text: string }[];
  /** Things to know before starting. */
  notes: { title: string; text: string }[];
  faqs: { question: string; answer: string }[];
  related: JobSlug[];
};

export const jobs: Job[] = [
  {
    slug: "bathroom-renovation",
    packageCode: "R4",
    name: "Bathroom Renovation",
    phrase: "bathroom renovation",
    metaTitle: "Bathroom Renovation in Hyderabad, Bangalore & Warangal",
    metaDescription:
      "Bathroom renovation for apartments and homes in Hyderabad, Bangalore and Warangal: leak investigation, waterproofing, tiling, sanitaryware, plumbing and electrical points, scoped in writing before work starts.",
    headline: "A bathroom rebuilt from the waterproofing up.",
    intro:
      "Most bathroom problems start where you can't see them: under the tiles and behind the walls. RenewBrick inspects the bathroom, finds the cause of any leak or damp, writes down exactly what will be done, and coordinates waterproofing, tiling, plumbing and fittings as one package through to a checked handover.",
    signs: [
      "Damp patches or peeling paint on the walls next to the bathroom, or on the ceiling below",
      "Cracked, loose or hollow-sounding tiles",
      "Water pooling on the floor or draining slowly",
      "Stained grout and mould that keep coming back",
      "Worn or outdated sanitaryware and fittings",
      "Low water pressure or ageing pipes",
    ],
    scope: [
      { title: "Leak investigation", text: "Finding where water is escaping before deciding what to replace." },
      { title: "Removal", text: "Taking out old tiles, fittings and screed where the scope requires it." },
      { title: "Waterproofing", text: "Treating the floor and the wall junctions before any new tiles go down." },
      { title: "Floor and wall tiling", text: "New tiles laid to falls so water drains to the outlet." },
      { title: "Sanitaryware and fittings", text: "WC, basin, shower, taps and accessories, chosen and listed in your scope." },
      { title: "Plumbing and drainage", text: "Supply lines and drainage repaired or replaced by a qualified plumber." },
      { title: "Electrical points", text: "Exhaust fan, lighting and water-heater points, by a qualified electrician." },
      { title: "Layout changes", text: "Moving fixtures where the drainage and the building allow it." },
    ],
    approach: [
      { title: "Cause before cure", text: "If there is a leak, we trace it first. Re-tiling over an unsolved leak only hides it for a while." },
      { title: "Waterproof, then tile", text: "Waterproofing is done and left to cure before tiling, because it can't be reached once the tiles are down." },
      { title: "Fixtures agreed in writing", text: "Sanitaryware, fittings and tiles are listed in the scope, whether we coordinate the purchase or you buy them yourself." },
      { title: "Checked before handover", text: "We check drainage, fittings and finishes against the approved scope and close any snags before handing back." },
    ],
    notes: [
      { title: "The bathroom will be out of use", text: "For most of the work the bathroom can't be used. We discuss the sequence with you at the estimate stage." },
      { title: "Neighbours and association rules", text: "Leaks can affect the flat below, and many buildings restrict working hours and debris removal. We identify both at the inspection." },
      { title: "Hidden conditions", text: "Pipes and waterproofing under the floor can only be fully assessed once opened. Any extra work is estimated and approved in writing first." },
    ],
    faqs: [
      {
        question: "Can a bathroom leak be fixed without replacing all the tiles?",
        answer:
          "Sometimes. It depends on where the water is escaping: a failed joint around a fitting can be a local repair, while failed waterproofing under the floor usually means lifting tiles. We investigate first and explain the options before you decide.",
      },
      {
        question: "Can I choose my own tiles and fittings?",
        answer:
          "Yes. You can choose the finishes yourself. Whether you buy them or we coordinate the purchase through suppliers is agreed and written into the scope.",
      },
      {
        question: "Can the WC or shower be moved to a different position?",
        answer:
          "Often, but it depends on the drainage falls, where the building's drainage stacks are, and any association rules. We confirm what is possible at the inspection.",
      },
    ],
    related: ["waterproofing-leak-repair", "flooring-tiling", "kitchen-renovation"],
  },
  {
    slug: "kitchen-renovation",
    packageCode: "R4",
    name: "Kitchen Renovation",
    phrase: "kitchen renovation",
    metaTitle: "Kitchen Renovation in Hyderabad, Bangalore & Warangal",
    metaDescription:
      "Kitchen renovation in Hyderabad, Bangalore and Warangal: counters, modular or carpenter-made cabinetry, tiling, plumbing and electrical points coordinated as one package, with a written scope and estimate first.",
    headline: "A kitchen planned around how you actually cook.",
    intro:
      "A kitchen brings together civil work, plumbing, electrical points, counters, cabinetry and tiling, usually from different trades. RenewBrick inspects the space, agrees the layout and finishes with you in writing, and coordinates every trade so the kitchen comes together in the right order.",
    signs: [
      "Counters that are cracked, stained or chipped",
      "Cabinets swelling, sagging or breaking, often from moisture",
      "Leaks under the sink",
      "Too few electrical points for your appliances",
      "Cracked or greasy wall tiles",
      "A layout with too little storage or working space",
    ],
    scope: [
      { title: "Removal", text: "Taking out old counters, cabinets and tiles as the scope requires." },
      { title: "Civil changes", text: "Non-structural changes to walls and openings, where the building allows." },
      { title: "Plumbing", text: "Sink, water purifier and appliance supply and drainage points, by a qualified plumber." },
      { title: "Electrical points", text: "Sockets and circuits for appliances, chimney and lighting, by a qualified electrician." },
      { title: "Counters", text: "Countertops supplied and fitted to the agreed layout." },
      { title: "Cabinetry", text: "Modular or carpenter-made cabinets, coordinated through specialist partners." },
      { title: "Wall and floor tiling", text: "Dado tiles behind the counter, and flooring where included." },
      { title: "Finishing", text: "Painting and final fittings once the main work is complete." },
    ],
    approach: [
      { title: "Layout first", text: "Sink, hob, refrigerator and storage positions are agreed before anything is ordered, because they decide where plumbing and electrical points go." },
      { title: "Services before surfaces", text: "Plumbing and electrical work is finished and checked before counters, tiles and cabinets cover it." },
      { title: "One coordinated sequence", text: "Civil work, services, counters, cabinetry and tiling are scheduled in the order they depend on each other." },
      { title: "Finishes agreed in writing", text: "Counter material, cabinet type and tiles are listed in the scope, so there are no surprises at installation." },
    ],
    notes: [
      { title: "Gas connections", text: "Any change to piped or cylinder gas connections must be done by the gas supplier or an authorised technician. We plan the layout around that." },
      { title: "Living without a kitchen", text: "For part of the work the kitchen can't be used. We discuss the sequence with you at the estimate stage." },
      { title: "Association rules", text: "Many buildings restrict working hours and how materials and debris are moved. We identify these at the inspection." },
    ],
    faqs: [
      {
        question: "Do you install modular kitchens?",
        answer:
          "Cabinetry, whether modular or carpenter-made, is coordinated through specialist partners as part of the kitchen scope. The type, materials and finish are agreed with you in writing before anything is ordered.",
      },
      {
        question: "Can the sink or hob be moved?",
        answer:
          "Usually, depending on the drainage route, ventilation and gas connection. We check these at the inspection and include any changes in the scope.",
      },
      {
        question: "Can I keep my cabinets and only change the counter or tiles?",
        answer: "Yes. A partial renovation is often enough. The scope covers only the work you want, once we have checked the condition of what stays.",
      },
    ],
    related: ["bathroom-renovation", "flooring-tiling", "house-painting"],
  },
  {
    slug: "waterproofing-leak-repair",
    packageCode: "R5",
    name: "Waterproofing & Leak Repair",
    phrase: "waterproofing and leak repair",
    metaTitle: "Waterproofing & Leak Repair in Hyderabad, Bangalore & Warangal",
    metaDescription:
      "Waterproofing and leak repair in Hyderabad, Bangalore and Warangal: leak investigation first, then treatment for terraces, bathrooms, balconies, external walls and water tanks, and repair of damp-damaged surfaces.",
    headline: "Find the leak first. Then stop it for good.",
    intro:
      "Damp patches, peeling paint and seepage are symptoms; the cause can be several metres away. RenewBrick investigates where the water is coming from, recommends the treatment that suits that surface, coordinates the work, and repairs the damage once the source is fixed.",
    signs: [
      "Damp patches or peeling paint on ceilings below a terrace or bathroom",
      "Seepage on external walls during the rains",
      "White salt deposits (efflorescence) on walls",
      "Leaking or weeping water tanks",
      "Water entering rooms from balconies",
      "Mould, or a persistent musty smell",
    ],
    scope: [
      { title: "Leak investigation", text: "Tracing the source of water before any treatment is chosen." },
      { title: "Terraces and roofs", text: "Waterproofing for exposed slabs, including the joints and drainage outlets." },
      { title: "Bathrooms and balconies", text: "Treating wet areas where water is escaping into walls or the floor below." },
      { title: "External walls", text: "Crack sealing and protective treatment for walls that take in rain." },
      { title: "Water tanks", text: "Waterproofing for overhead and underground tanks." },
      { title: "Damage repair", text: "Plaster and paint repair once the source has been fixed and the wall has dried." },
    ],
    approach: [
      { title: "Investigate before treating", text: "We look at where the damp appears, what is above and around it, and when it gets worse, to find the actual source." },
      { title: "Source first, surface second", text: "Repainting a damp wall without fixing the source only hides the problem. The source is treated first." },
      { title: "The right system for the surface", text: "Terraces, wet areas, walls and tanks need different treatments. The method for each is written into your scope." },
      { title: "Timed around the weather", text: "Terrace and external waterproofing is best done in dry weather; we suggest timing when we prepare the scope." },
    ],
    notes: [
      { title: "Leaks from another flat", text: "If water is coming from a neighbouring flat or a common area, work there needs that owner's or the association's agreement. We can document the problem to help that conversation." },
      { title: "Drying time", text: "Damp walls need to dry out before they can be replastered or repainted properly, which affects when the final finish is done." },
      { title: "Hidden conditions", text: "Some leak sources can only be confirmed once a surface is opened. Any extra work is estimated and approved in writing first." },
    ],
    faqs: [
      {
        question: "Why does damp come back after the wall is repainted?",
        answer:
          "Because the water source is still active. Paint and putty can't stop water coming through from a terrace, bathroom, pipe or external wall. Once the source is fixed and the wall has dried, the repair lasts.",
      },
      {
        question: "When is the best time to waterproof a terrace?",
        answer:
          "In dry weather, ideally before the monsoon. If the terrace is already leaking, it's worth investigating straight away so the source is known and the work can be planned.",
      },
      {
        question: "Can you fix a bathroom leak without a full renovation?",
        answer:
          "Sometimes. If the leak comes from a joint or fitting, a targeted repair may be enough. If the waterproofing under the floor has failed, tiles usually need to be lifted. The investigation tells us which.",
      },
    ],
    related: ["bathroom-renovation", "house-painting", "flooring-tiling"],
  },
  {
    slug: "house-painting",
    packageCode: "R2",
    name: "House Painting",
    phrase: "house painting",
    metaTitle: "House Painting Services in Hyderabad, Bangalore & Warangal",
    metaDescription:
      "Interior and exterior house painting in Hyderabad, Bangalore and Warangal: surface preparation, crack filling, putty, primer and finish coats, with damp fixed first and colours and paint agreed in writing.",
    headline: "A finish that lasts starts well before the first coat.",
    intro:
      "Most of a good paint job is preparation: repairing cracks and damp, sanding, putty and primer. RenewBrick inspects the walls, deals with anything that would make new paint fail, agrees colours, paint type and finish with you in writing, and coordinates interior and exterior painting through to a checked handover.",
    signs: [
      "Paint peeling, flaking or bubbling",
      "Cracks in the plaster",
      "Faded or stained exterior walls",
      "Damp patches showing through the paint",
      "Moving into a new home, or preparing a property to let",
    ],
    scope: [
      { title: "Surface preparation", text: "Scraping loose paint, sanding and cleaning the walls." },
      { title: "Crack and plaster repair", text: "Filling cracks and repairing damaged plaster before painting." },
      { title: "Putty and primer", text: "Levelling the surface and sealing it so the finish coats bond evenly." },
      { title: "Interior painting", text: "Walls, ceilings, doors and grilles, room by room." },
      { title: "Exterior painting", text: "External walls, with protective coatings where suitable." },
      { title: "Protection and clean-up", text: "Covering floors and furniture, and cleaning up after the work." },
    ],
    approach: [
      { title: "Fix damp first", text: "Paint applied over an active leak or damp wall will fail. If we find damp, we tell you and treat the source first." },
      { title: "Preparation is the job", text: "Crack repair, putty and primer take longer than the final coats, and decide how long the finish lasts." },
      { title: "Agreed in writing", text: "Colours, paint type and finish for each area are listed in the scope before work starts." },
      { title: "Room by room", text: "In an occupied home, we agree a sequence so you can keep living in it while the work moves through." },
    ],
    notes: [
      { title: "Exterior work and weather", text: "External painting needs dry weather; we suggest timing when we prepare the scope." },
      { title: "Access for exterior walls", text: "High walls may need scaffolding or other access, and your building's permission. We identify this at the inspection." },
      { title: "Furniture", text: "Furniture needs to be moved away from walls and covered. We agree with you how that will be handled." },
    ],
    faqs: [
      {
        question: "Can you paint while we are living in the house?",
        answer: "Yes. We agree a room-by-room sequence with you so the home stays usable, with furniture moved and covered as the work progresses.",
      },
      {
        question: "Do you do both interior and exterior painting?",
        answer: "Yes. Interior and exterior work can be scoped together or separately, depending on what the property needs.",
      },
      {
        question: "Can you repaint a rented flat between tenants?",
        answer:
          "Yes. Painting is often part of preparing a property for the next tenant, together with repairs and cleaning. See our rental-ready services.",
      },
    ],
    related: ["waterproofing-leak-repair", "flooring-tiling", "bathroom-renovation"],
  },
  {
    slug: "flooring-tiling",
    packageCode: "R3",
    name: "Flooring & Tiling",
    phrase: "flooring and tiling",
    metaTitle: "Flooring & Tiling Work in Hyderabad, Bangalore & Warangal",
    metaDescription:
      "Flooring and tiling work in Hyderabad, Bangalore and Warangal: replacing loose, hollow or cracked tiles, new floor and wall tiles, skirting and thresholds, with the cause of tile failure found first.",
    headline: "Floors that stay level, sound and in place.",
    intro:
      "Tiles crack, sound hollow or lift for a reason: poor bedding, moisture or movement underneath. RenewBrick inspects the floor, finds why the tiles failed, and coordinates removal, base preparation and relaying, or new flooring and wall tiling, as part of a written scope.",
    signs: [
      "Tiles that sound hollow when tapped",
      "Cracked or chipped tiles",
      "Tiles lifting or popping up",
      "Uneven floors, or gaps at the skirting",
      "Worn or missing grout",
      "Flooring that is simply outdated",
    ],
    scope: [
      { title: "Investigation", text: "Finding why tiles have cracked, sounded hollow or lifted." },
      { title: "Removal and base preparation", text: "Taking up failed tiles and preparing a sound, level base." },
      { title: "Floor tiles and flooring", text: "New tiles or flooring laid to the agreed levels." },
      { title: "Wall tiling and cladding", text: "Kitchens, bathrooms and feature walls." },
      { title: "Skirting and thresholds", text: "Finishing the edges and the transitions between rooms." },
      { title: "Grouting", text: "Regrouting or new grout for a sealed, even finish." },
    ],
    approach: [
      { title: "Find why it failed", text: "Relaying tiles on the same failed base means the problem comes back. We look for the cause first." },
      { title: "Levels and doors", text: "New floors change the height. We plan levels so doors still open and thresholds stay safe." },
      { title: "Materials agreed in writing", text: "Tile type, size and finish are listed in the scope, whether we coordinate the purchase or you buy them yourself." },
      { title: "Protect and clean", text: "Finished floors are protected while other work continues, and cleaned before handover." },
    ],
    notes: [
      { title: "Matching existing tiles", text: "Replacing a few tiles depends on finding a match. If the original tiles are no longer available, we discuss the options." },
      { title: "Dust and access", text: "Removing tiles is noisy and dusty, and rooms are out of use while the floor sets. We agree a sequence with you." },
      { title: "Hidden conditions", text: "Pipes or moisture under the floor can only be confirmed once tiles are lifted. Any extra work is estimated and approved in writing first." },
    ],
    faqs: [
      {
        question: "Can you replace just a few broken tiles?",
        answer:
          "Yes, if a matching tile can be found and the base underneath is sound. If many tiles sound hollow, we may recommend relaying a larger area so the problem doesn't spread.",
      },
      {
        question: "Can new tiles be laid over the old ones?",
        answer:
          "Sometimes, if the existing floor is sound and level and the extra height works with your doors and thresholds. We check this at the inspection.",
      },
      {
        question: "Why are my floor tiles popping up?",
        answer:
          "Common causes include poor bedding when the tiles were laid, missing expansion gaps, and moisture or temperature movement. We inspect the floor to find the cause before recommending a fix.",
      },
    ],
    related: ["bathroom-renovation", "kitchen-renovation", "house-painting"],
  },
];

export const jobPath = (slug: JobSlug) => `/services/${slug}`;

export function getJob(slug: string) {
  return jobs.find((j) => j.slug === slug);
}
