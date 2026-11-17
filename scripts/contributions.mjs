// Saves the last year of public GitHub contributions so the About section can draw them.
// Usage: npm run contributions
import fs from "node:fs";
import path from "node:path";

const USER = "angelo-mouawad";
const OUT = path.resolve(import.meta.dirname, "..", "src", "data", "contributions.json");

const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`);
if (!res.ok) throw new Error(`Contribution service answered ${res.status}`);
const { contributions } = await res.json();
const days = contributions.map(({ date, count }) => ({ date, count }));
fs.writeFileSync(OUT, JSON.stringify(days));
console.log(`Saved ${days.length} days, ${days.reduce((sum, day) => sum + day.count, 0)} contributions`);
