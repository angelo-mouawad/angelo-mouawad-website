/**
 * Every project shown in the monitor scene. To add one, add an entry here.
 * Nothing else needs to change: numbering, counts and the tech marquee all follow this list.
 */
export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tech: string[];
  links: { label: string; href: string }[];
  /** Screenshot in public/, captured at 1440x900. Leave out and the card shows a placeholder. */
  image?: string;
  /** Where the card anchors the screenshot when it crops it (CSS object-position). Defaults to the top left. */
  imagePosition?: string;
  /** Leave out for a finished project. "soon" renders a reserved slot. */
  status?: "soon";
}

export const PROJECTS: Project[] = [
  {
    id: "flow-engine",
    image: "/projects/flow-engine.webp",
    title: "Flow Engine",
    category: "Backend architecture",
    description:
      "A configurable workflow engine. You define a flow once, trigger it over HTTP, and it walks its own steps, validating requests, pausing while people approve them, and pushing notifications over WebSocket in real time. The runner stores its position when it stalls, so resuming is restart-safe without a scheduler.",
    tech: ["Java 21", "Spring Boot", "Vue 3", "MongoDB", "WebSocket", "Docker"],
    links: [{ label: "GitHub", href: "https://github.com/angelo-mouawad/flow-engine" }],
  },
  {
    id: "gaffer",
    image: "/projects/gaffer.webp",
    title: "Gaffer",
    category: "Machine learning, AI",
    description:
      "Premier League predictions behind one dashboard. A neural network trained on twenty seasons of results is merged with a language model that reads this week's team news and weighs each absence by how much that player actually plays. It also prices players against Transfermarkt and finds the closest stylistic replacement for anyone in the league.",
    tech: ["Python", "PyTorch", "XGBoost", "FastAPI", "Jupyter", "LLM"],
    links: [{ label: "GitHub", href: "https://github.com/angelo-mouawad/football-prediction-project" }],
  },
  {
    id: "restaurant-management",
    image: "/projects/restaurant-management.webp",
    title: "Restaurant Management System",
    category: "Full stack, team project",
    description:
      "Shift planning and stock for a restaurant, with admin, manager and employee roles enforced by the API. Employees enter their availability; managers plan on a grid that flags clashes and short staffing, then publish the week. Every stock change is a logged movement, and orders book straight into stock. Started as a Scrum team project at UCLL.",
    tech: ["Java 21", "Spring Boot", "PostgreSQL", "Flyway", "Next.js 15", "TypeScript"],
    links: [{ label: "GitHub", href: "https://github.com/angelo-mouawad/restaurant-management-system-project" }],
  },
  {
    id: "finger-dragon",
    image: "/projects/finger-dragon.webp",
    imagePosition: "center",
    title: "Finger Dragon",
    category: "Computer vision, games",
    description:
      "A webcam-controlled arcade game. Your index finger flies the dragon and pinching it to your thumb breathes fire, while enemy dragons chase you and shoot back. Pinches are measured against your own palm, so they work at any distance from the camera. Lose your hand and the game waits for you, and with no webcam at all the mouse flies the dragon instead.",
    tech: ["Python", "Pygame", "MediaPipe", "OpenCV"],
    links: [{ label: "GitHub", href: "https://github.com/angelo-mouawad/finger-dragon-game" }],
  },
  {
    id: "battlecars",
    image: "/projects/battlecars.webp",
    title: "BattleCars",
    category: "IoT, team project",
    description:
      "Two robot cars fight in an arena while players drive them from a browser. As the team's IoT engineer I built the cars and the ESP32 hub and wrote all the firmware, from the 433 MHz radio protocol to accelerometer hit detection. A car stops itself the moment commands stop arriving, and every hit takes health off live, with AI commentary read aloud.",
    tech: ["C++", "ESP32", "Arduino", "PlatformIO", "Spring Boot", "Next.js"],
    links: [{ label: "GitHub", href: "https://github.com/angelo-mouawad/battlecars" }],
  },
  {
    id: "samar-holidays",
    image: "/sites/samar-holidays-desktop.webp",
    title: "Samar Holidays",
    category: "Client work, live",
    description:
      "Marketing site for a travel agency in Kaslik, Lebanon. One self-contained HTML file, with no framework, no build step, no package manager. Package cards flip on hover and on tap so they work on phones, and the hero title measures itself and rescales to stay on one line at any width.",
    tech: ["HTML", "CSS", "JavaScript"],
    links: [
      { label: "Live site", href: "https://samarholidays.com/" },
      { label: "GitHub", href: "https://github.com/angelo-mouawad/samar-holidays-website" },
    ],
  },
  {
    id: "echoes-events",
    image: "/sites/echoes-events-desktop.webp",
    title: "Echoes Events",
    category: "Client work, live",
    description:
      "Site for a Beirut event planning and production company covering weddings, corporate galas and concerts. Six scrolling sections with dot navigation that highlights wherever you are, a full-bleed video hero and showreel, and PHP handlers behind the enquiry and job application forms.",
    tech: ["HTML", "CSS", "JavaScript", "PHP"],
    links: [
      { label: "Live site", href: "https://eventswithechoes.com/" },
      { label: "GitHub", href: "https://github.com/angelo-mouawad/echoes-events-website" },
    ],
  },

  // Reserved slots. Replace the text, add tech and links, and delete the status line.
  {
    id: "coming-soon-2",
    title: "Next project",
    category: "Coming soon",
    description: "This slot is reserved for something I'm working on.",
    tech: [],
    links: [],
    status: "soon",
  },
  {
    id: "coming-soon-3",
    title: "Next project",
    category: "Coming soon",
    description: "This slot is reserved for something I'm working on.",
    tech: [],
    links: [],
    status: "soon",
  },
];

/** Every technology used across the finished projects, most used first. */
export function techStack() {
  const counts = new Map<string, number>();
  for (const project of PROJECTS) for (const tech of project.tech) counts.set(tech, (counts.get(tech) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tech]) => tech);
}
