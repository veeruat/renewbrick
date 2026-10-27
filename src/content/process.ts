/** The seven-stage RenewBrick process, shown on the homepage and About page. */

export type ProcessStage = {
  id: string;
  title: string;
  text: string;
  /** Marks the stage where nothing proceeds without the owner's sign-off. */
  gate?: boolean;
};

export const processStages: ProcessStage[] = [
  {
    id: "enquiry",
    title: "Enquiry",
    text: "Tell us about the property, where it is and what you have in mind. We call or message back to understand the requirement.",
  },
  {
    id: "inspection",
    title: "Inspection",
    text: "Once a visit is agreed, we inspect the property, take measurements and photographs, and note existing conditions.",
  },
  {
    id: "scope",
    title: "Scope & Estimate",
    text: "You receive a written scope of work and an estimate based on what we found on site.",
  },
  {
    id: "approval",
    title: "Written Approval",
    text: "Work is scheduled only after you approve the scope and estimate in writing. Changes later are estimated and approved the same way.",
    gate: true,
  },
  {
    id: "execution",
    title: "Execution",
    text: "We coordinate suitable execution partners and specialist vendors, and keep you informed as the work progresses.",
  },
  {
    id: "quality",
    title: "Quality Check",
    text: "Completed work is checked against the approved scope, and any snags are listed and closed.",
  },
  {
    id: "handover",
    title: "Handover",
    text: "The property is handed back with a record of what was done.",
  },
];

export const processCaveat =
  "Scope, cost and schedule depend on site conditions, material availability and your approvals. Nothing is fixed until it is written down and you have approved it.";
