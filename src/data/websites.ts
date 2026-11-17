/**
 * Client sites shown on /websites. To add one:
 *   1. Add an entry here.
 *   2. Add its slug and URL to scripts/site-shots.mjs and run `npm run site-shots`
 *      to capture public/sites/<slug>-desktop.webp and <slug>-mobile.webp.
 */
export interface Site {
  slug: string;
  name: string;
  url: string;
  repo: string;
  /** Who it was built for, in a few words. */
  client: string;
  /** One or two lines on how it is built. Only claim what the site really does. */
  description: string;
  stack: string[];
}

export const SITES: Site[] = [
  {
    slug: "echoes-events",
    name: "Echoes Events",
    url: "https://eventswithechoes.com/",
    repo: "https://github.com/angelo-mouawad/echoes-events-website",
    client: "Event planning and production, Beirut",
    description:
      "A one page site in plain HTML, CSS and JavaScript, with two small PHP scripts behind the enquiry and job application forms. It opens on a full-bleed video hero, and a dot navigation tracks which of the six sections you are in.",
    stack: ["HTML", "CSS", "JavaScript", "PHP"],
  },
  {
    slug: "samar-holidays",
    name: "Samar Holidays",
    url: "https://samarholidays.com/",
    repo: "https://github.com/angelo-mouawad/samar-holidays-website",
    client: "Travel agency, Kaslik, Lebanon",
    description:
      "The whole site ships as a single HTML file: no framework, no build step, no package manager. Package cards flip on hover and on tap so they work on phones, and the hero title measures itself and rescales to stay on one line at any width.",
    stack: ["HTML", "CSS", "JavaScript"],
  },
  {
    slug: "el-samar-travel",
    name: "Elsamar Travel",
    url: "https://elsamartravel.com/",
    repo: "https://github.com/angelo-mouawad/el-samar-travel-website",
    client: "Travel agency, Dubai",
    description:
      "A single page showcase where the packages section pins and slides sideways as you scroll, driven by GSAP ScrollTrigger. Under 900px it becomes a swipeable carousel with snap points, and with reduced motion switched on it falls back to a plain grid.",
    stack: ["HTML", "CSS", "JavaScript", "GSAP"],
  },
  {
    slug: "ayaverse",
    name: "Ayaverse",
    url: "https://ayaverse.be/",
    repo: "https://github.com/angelo-mouawad/ayaverse-website",
    client: "Natural skincare and haircare brand",
    description:
      "A showcase site with an interactive starfield hero, Lenis momentum scrolling and GSAP scroll reveals. Vertical scrolling moves a pinned product carousel sideways, and every product opens an enquire dialog with direct contact links.",
    stack: ["HTML", "CSS", "JavaScript", "GSAP", "Lenis"],
  },
];

export const SERVICES = [
  { id: "design", title: "Custom design", text: "Designed around you and what you do. No template with your logo dropped on top." },
  { id: "responsive", title: "Responsive builds", text: "Built for the phone first, then tablet and desktop, and tested on real screen sizes." },
  { id: "multilingual", title: "Multilingual sites", text: "One site in as many languages as your visitors speak, with a clean way to switch." },
  { id: "performance", title: "Performance", text: "Light pages, compressed images and careful animation, so it opens fast and stays smooth." },
  { id: "hosting", title: "Hosting and domain setup", text: "I register or connect your domain, set up hosting and put the site live for you." },
  { id: "maintenance", title: "Maintenance", text: "Changes, new pages and fixes after launch, so the site keeps up with you." },
] as const;

export const PROCESS = [
  { title: "We talk", text: "You tell me what you do, who it's for and what you like. I ask the questions that matter." },
  { title: "I design", text: "You get a design to react to, and we go back and forth until it feels right." },
  { title: "I build", text: "I turn the design into a fast, responsive site and you can follow along on a preview link." },
  { title: "We launch", text: "Domain, hosting and the last checks. Then it's live, and I stay around for changes." },
] as const;
