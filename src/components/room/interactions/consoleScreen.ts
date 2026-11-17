import { fontFamily } from "@/components/room/scene/textures";

/** Pixel size of the TV picture. 16:9, like the screen it is drawn on. */
export const SCREEN_PX = { width: 1280, height: 720 };

/** Small seeded random, so redrawing the screen (the clock ticks) never reshuffles stars or trees. */
function seeded(seed: number) {
  let t = seed;
  return () => {
    t = (t * 16807) % 2147483647;
    return (t - 1) / 2147483646;
  };
}

type Ctx = CanvasRenderingContext2D;
type Art = (ctx: Ctx, x: number, y: number, w: number, h: number) => void;

function vertical(ctx: Ctx, y: number, h: number, stops: string[]) {
  const gradient = ctx.createLinearGradient(0, y, 0, y + h);
  stops.forEach((color, i) => gradient.addColorStop(i / (stops.length - 1), color));
  return gradient;
}

function ridge(ctx: Ctx, x: number, y: number, w: number, h: number, base: number, amp: number, seed: number, color: string) {
  const rand = seeded(seed);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  for (let i = 0; i <= 12; i++) ctx.lineTo(x + (w * i) / 12, y + h * base - rand() * h * amp);
  ctx.lineTo(x + w, y + h);
  ctx.fill();
}

/** Dusk over layered mountains. Also the full-screen background of the selected game. */
const emberRidge: Art = (ctx, x, y, w, h) => {
  ctx.fillStyle = vertical(ctx, y, h, ["#2a1b4a", "#8a3b5c", "#f08a4b", "#ffd08a"]);
  ctx.fillRect(x, y, w, h);
  const sun = ctx.createRadialGradient(x + w * 0.68, y + h * 0.62, 0, x + w * 0.68, y + h * 0.62, w * 0.22);
  sun.addColorStop(0, "rgba(255,240,200,1)");
  sun.addColorStop(0.18, "rgba(255,214,150,0.95)");
  sun.addColorStop(1, "rgba(255,170,90,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(x, y, w, h);
  ridge(ctx, x, y, w, h, 0.72, 0.22, 7, "rgba(120,52,78,0.85)");
  ridge(ctx, x, y, w, h, 0.82, 0.18, 19, "#4a2140");
  ridge(ctx, x, y, w, h, 0.93, 0.12, 31, "#1c0f22");
};

const neonRun: Art = (ctx, x, y, w, h) => {
  ctx.fillStyle = vertical(ctx, y, h, ["#12062e", "#5a1170", "#ff3d8b"]);
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#ffb347";
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h * 0.58, w * 0.22, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#5a1170";
  for (let i = 0; i < 4; i++) ctx.fillRect(x, y + h * (0.47 + i * 0.03), w, 2 + i);
  const rand = seeded(5);
  ctx.fillStyle = "#0c0420";
  for (let bx = x; bx < x + w; bx += w / 9) ctx.fillRect(bx, y + h * (0.45 + rand() * 0.15), w / 9 - 2, h);
  ctx.strokeStyle = "rgba(111,227,255,0.7)";
  ctx.lineWidth = 1.5;
  for (let i = 1; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y + h * (0.78 + i * i * 0.008));
    ctx.lineTo(x + w, y + h * (0.78 + i * i * 0.008));
    ctx.stroke();
  }
};

const deepTide: Art = (ctx, x, y, w, h) => {
  ctx.fillStyle = vertical(ctx, y, h, ["#9fe7ff", "#1789b8", "#062a4d", "#020c1c"]);
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x + w * (0.2 + i * 0.18), y);
    ctx.lineTo(x + w * (0.28 + i * 0.18), y);
    ctx.lineTo(x + w * (0.1 + i * 0.25), y + h);
    ctx.lineTo(x + w * (0.02 + i * 0.25), y + h);
    ctx.fill();
  }
  ctx.fillStyle = "#04182e";
  ctx.beginPath();
  ctx.ellipse(x + w * 0.55, y + h * 0.55, w * 0.2, h * 0.07, -0.15, 0, Math.PI * 2);
  ctx.moveTo(x + w * 0.74, y + h * 0.52);
  ctx.lineTo(x + w * 0.86, y + h * 0.44);
  ctx.lineTo(x + w * 0.84, y + h * 0.6);
  ctx.fill();
};

const quietWoods: Art = (ctx, x, y, w, h) => {
  ctx.fillStyle = vertical(ctx, y, h, ["#dfe9c8", "#7fa36a", "#22402c"]);
  ctx.fillRect(x, y, w, h);
  const rand = seeded(11);
  for (let layer = 0; layer < 3; layer++) {
    ctx.fillStyle = ["#6f9466", "#3c6447", "#163020"][layer];
    for (let i = 0; i < 7; i++) {
      const tx = x + rand() * w;
      const ty = y + h * (0.45 + layer * 0.14);
      const tw = w * (0.08 + layer * 0.03);
      ctx.beginPath();
      ctx.moveTo(tx, ty - h * (0.25 + layer * 0.05));
      ctx.lineTo(tx + tw, ty + h * 0.2);
      ctx.lineTo(tx - tw, ty + h * 0.2);
      ctx.fill();
    }
    ctx.fillRect(x, y + h * (0.62 + layer * 0.14), w, h);
  }
};

const redline: Art = (ctx, x, y, w, h) => {
  ctx.fillStyle = vertical(ctx, y, h, ["#2b0508", "#a3121d", "#ff4b3e"]);
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(255,220,200,0.55)";
  const rand = seeded(23);
  for (let i = 0; i < 14; i++) {
    const ly = y + rand() * h;
    ctx.lineWidth = 1 + rand() * 2;
    ctx.beginPath();
    ctx.moveTo(x + rand() * w * 0.4, ly);
    ctx.lineTo(x + w, ly - h * 0.25);
    ctx.stroke();
  }
  ctx.fillStyle = "#14080a";
  ctx.beginPath();
  ctx.moveTo(x + w * 0.12, y + h * 0.72);
  ctx.lineTo(x + w * 0.38, y + h * 0.56);
  ctx.lineTo(x + w * 0.72, y + h * 0.54);
  ctx.lineTo(x + w * 0.9, y + h * 0.66);
  ctx.lineTo(x + w * 0.9, y + h * 0.74);
  ctx.lineTo(x + w * 0.12, y + h * 0.76);
  ctx.fill();
};

const farOrbit: Art = (ctx, x, y, w, h) => {
  ctx.fillStyle = "#03040c";
  ctx.fillRect(x, y, w, h);
  const rand = seeded(41);
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.3 + rand() * 0.7})`;
    ctx.fillRect(x + rand() * w, y + rand() * h, 1.5, 1.5);
  }
  const planet = ctx.createRadialGradient(x + w * 0.42, y + h * 0.5, 2, x + w * 0.55, y + h * 0.65, w * 0.42);
  planet.addColorStop(0, "#ffd9a8");
  planet.addColorStop(0.5, "#c8653a");
  planet.addColorStop(1, "#2a0c08");
  ctx.fillStyle = planet;
  ctx.beginPath();
  ctx.arc(x + w * 0.58, y + h * 0.68, w * 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,226,190,0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x + w * 0.58, y + h * 0.68, w * 0.52, h * 0.1, -0.25, 0, Math.PI * 2);
  ctx.stroke();
};

/** Made-up games with drawn cover art. The first one is the selected game. */
const GAMES: Art[] = [emberRidge, neonRun, deepTide, quietWoods, redline, farOrbit];

function tile(ctx: Ctx, x: number, y: number, size: number, art: Art) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, size * 0.12);
  ctx.clip();
  art(ctx, x, y, size, size);
  ctx.restore();
}

function topBar(ctx: Ctx, w: number, sans: string) {
  ctx.font = `600 26px ${sans}`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Games", 64, 62);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `500 26px ${sans}`;
  ctx.fillText("Media", 168, 62);

  // Clock first: its width depends on the visitor's locale, so the icons line up to its left.
  ctx.textAlign = "right";
  ctx.fillStyle = "#ffffff";
  ctx.font = `500 26px ${sans}`;
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  ctx.fillText(time, w - 64, 63);
  ctx.textAlign = "left";
  const avatarX = w - 64 - ctx.measureText(time).width - 40;

  // Profile picture.
  const avatar = ctx.createLinearGradient(avatarX - 18, 36, avatarX + 18, 72);
  avatar.addColorStop(0, "#6fe3ff");
  avatar.addColorStop(1, "#4d6bff");
  ctx.fillStyle = avatar;
  ctx.beginPath();
  ctx.arc(avatarX, 54, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0a1020";
  ctx.font = `700 18px ${sans}`;
  ctx.textAlign = "center";
  ctx.fillText("A", avatarX, 61);
  ctx.textAlign = "left";

  // Settings and search icons.
  const settingsX = avatarX - 60;
  const searchX = settingsX - 60;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(settingsX, 54, 11, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(settingsX, 54, 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(searchX, 52, 10, 0, Math.PI * 2);
  ctx.moveTo(searchX + 7, 59);
  ctx.lineTo(searchX + 15, 67);
  ctx.stroke();
}

function gameRow(ctx: Ctx) {
  const y = 104;
  const big = 148;
  const small = 104;
  const smallY = y + (big - small) / 2;

  tile(ctx, 64, y, big, GAMES[0]);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(58, y - 6, big + 12, big + 12, big * 0.12 + 5);
  ctx.stroke();

  let x = 64 + big + 28;
  for (const art of GAMES.slice(1)) {
    tile(ctx, x, smallY, small, art);
    x += small + 18;
  }

  // Game library: a grid of squares on frosted glass.
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.beginPath();
  ctx.roundRect(x, smallY, small, small, small * 0.12);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < 4; i++) ctx.fillRect(x + 34 + (i % 2) * 20, smallY + 34 + Math.floor(i / 2) * 20, 15, 15);
}

function selectedGame(ctx: Ctx, w: number, sans: string, display: string) {
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 84px ${display}`;
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 24;
  ctx.fillText("EMBER", 64, 420);
  ctx.fillText("RIDGE", 64, 500);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = `500 22px ${sans}`;
  ctx.fillText("Chapter 4 · The Long Climb", 66, 542);

  // Play button and the round options button beside it.
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(64, 572, 190, 58, 29);
  ctx.fill();
  ctx.fillStyle = "#111111";
  ctx.font = `600 24px ${sans}`;
  ctx.textAlign = "center";
  ctx.fillText("Play", 159, 609);
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.arc(298, 601, 29, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.arc(298 + i * 10, 601, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Activity card on the right: where the player left off.
  const x = w - 420;
  const y = 520;
  ctx.fillStyle = "rgba(20,14,30,0.55)";
  ctx.beginPath();
  ctx.roundRect(x, y, 356, 110, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = `500 17px ${sans}`;
  ctx.fillText("Continue", x + 24, y + 36);
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 22px ${sans}`;
  ctx.fillText("Reach the summit camp", x + 24, y + 66);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.roundRect(x + 24, y + 84, 308, 6, 3);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(x + 24, y + 84, 308 * 0.72, 6, 3);
  ctx.fill();
}

/** A console home screen: the selected game's art fills the screen, with menus, a game row and a Play button on top. */
export function drawConsoleScreen(ctx: Ctx, w: number, h: number) {
  const sans = fontFamily("--font-sans");
  const display = fontFamily("--font-display");
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  emberRidge(ctx, 0, 0, w, h);
  // Darken the left side and the top and bottom edges so the menus stay readable.
  const shadeLeft = ctx.createLinearGradient(0, 0, w * 0.75, 0);
  shadeLeft.addColorStop(0, "rgba(6,6,16,0.82)");
  shadeLeft.addColorStop(1, "rgba(6,6,16,0)");
  ctx.fillStyle = shadeLeft;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = vertical(ctx, 0, h, ["rgba(4,4,12,0.75)", "rgba(4,4,12,0.15)", "rgba(4,4,12,0.1)", "rgba(4,4,12,0.85)"]);
  ctx.fillRect(0, 0, w, h);

  topBar(ctx, w, sans);
  gameRow(ctx);
  selectedGame(ctx, w, sans, display);
}
