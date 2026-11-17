export const LINKS = {
  notes: { label: "Notes", href: "/notes/" },
  bible: { label: "Bible", href: "/bible/" },
  websites: { label: "Websites", href: "/websites/" },
} as const;

export type LinkId = keyof typeof LINKS;

export const LINK_IDS = Object.keys(LINKS) as LinkId[];

// Seconds. The camera flies in, the curtain closes over the end of the move, then the route changes.
export const LEAVE = { fly: 1.15, curtainDelay: 0.55, curtain: 0.6 };
